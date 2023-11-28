import { Router } from "express";
import crypto from "crypto";
import { readFileSync } from "fs";
import { doResponse } from "../services/response";
import { upload } from "../services/audio";
import speechToText from "../services/speech-to-text";
import summarizeText from "../services/text-to-summary";

const router = Router();

router.get("/", (req, res) => {
	doResponse(res, {
		message: "Speech API",
	});
});

// TODO: Can the form-data parsing stream be piped directly to the axios request?
// This would save us from having to save the file to disk first.

// router.post("/upload", upload.single("file"), async (req, res) => {
// 	console.log(req.file);
// 	if (!req.file) {
// 		return doResponse(res, {
// 			status: 400,
// 			message: "Invalid file upload",
// 		});
// 	}
// 	const form = new FormData();
// 	form.append("file", fs.createReadStream(req.file.path));
// 	form.append("diarization", "false");
// 	const { data } = await axios.post<Readable>(
// 		"https://api.iapp.co.th/asr",
// 		form,
// 		{
// 			headers: {
// 				apikey: process.env.IAPP_API_KEY,
// 			},
// 			responseType: "stream",
// 		}
// 	);
// 	data.pipe(res);
// });

const cached = new Map<string, { text: string; summary: string }>();

router.post("/summarize", upload.single("file"), async (req, res) => {
	if (!req.file) {
		return doResponse(res.status(400), {
			success: false,
			message: "Invalid file upload",
		});
	}

	const fileHash = crypto
		.createHash("sha1")
		.update(readFileSync(req.file.path))
		.digest("hex");

	const cache = cached.get(fileHash);
	if (cache) {
		return doResponse(res, {
			data: cache,
		});
	}

	const text = await speechToText(req.file);
	const summary = await summarizeText(text);

	cached.set(fileHash, { text, summary });

	doResponse(res, {
		data: {
			text,
			summary,
		},
	});
});

export default router;
