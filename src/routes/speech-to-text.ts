import { Router } from "express";
import { doResponse } from "../services/response";
import { upload } from "../services/audio";
import FormData from "form-data";
import fs from "fs";
import axios from "axios";
import { Readable } from "stream";

const router = Router();

router.get("/", (req, res) => {
	doResponse(res, {
		message: "Speech API",
	});
});

// TODO: Can the form-data parsing stream be piped directly to the axios request?
// This would save us from having to save the file to disk first.

router.post("/upload", upload.single("file"), async (req, res) => {
	console.log(req.file);
	if (!req.file) {
		return doResponse(res, {
			status: 400,
			message: "Invalid file upload",
		});
	}
	const form = new FormData();
	form.append("file", fs.createReadStream(req.file.path));
	form.append("diarization", "false");
	const { data } = await axios.post<Readable>(
		"https://api.iapp.co.th/asr",
		form,
		{
			headers: {
				apikey: process.env.IAPP_API_KEY,
			},
			responseType: "stream",
		}
	);
	data.pipe(res);
});

export default router;
