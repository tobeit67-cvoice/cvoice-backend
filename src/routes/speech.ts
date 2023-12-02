import { streamToResponse } from "ai";
import crypto from "crypto";
import { Router } from "express";
import { readFileSync, createReadStream } from "fs";

import { upload } from "../services/audio";
import { prisma } from "../services/prisma";
import { doResponse } from "../services/response";
import speechToText from "../services/speech-to-text";
import summarizeText from "../services/text-to-summary";

const router = Router();

router.get("/", (req, res) => {
	doResponse(res, {
		message: "Speech API",
	});
});

router.post("/upload", upload.single("file"), async (req, res) => {
	const file = req.file;
	if (!file) {
		return doResponse(res.status(400), {
			success: false,
			message: "Invalid file upload",
		});
	}

	// TODO: Stream and compute the hash file without reading the whole file into memory again.
	const fileHash = crypto
		.createHash("sha1")
		.update(readFileSync(file.path))
		.digest("hex");

	const existingResult = await prisma.speech2Text.findFirst({
		where: {
			fileHash,
		},
	});

	if (existingResult && existingResult.status !== "error") {
		const { id, content, status } = existingResult;
		return doResponse(res, {
			data: {
				id,
				content,
				status,
			},
		});
	}

	const { id, status } = await prisma.speech2Text.create({
		data: {
			fileName: file.filename,
			fileHash,
			status: "pending",
		},
	});

	req.app.locals.task.add(id, {
		run: async (controller) => speechToText(file, controller),
		onStatusUpdate: async (status, content) => {
			console.log(`[Task] ${id} status: ${status}`);
			return await prisma.speech2Text.update({
				where: {
					id,
				},
				data: {
					content,
					status,
					...(status === "done"
						? {
								completedAt: new Date(),
						  }
						: {}),
				},
			});
		},
	});
	await req.app.locals.task.run(id);

	return doResponse(res, {
		data: {
			id,
			status,
		},
	});
});

router.get("/:id/status", async (req, res) => {
	const id = req.params.id;

	const result = await prisma.speech2Text.findUnique({
		where: {
			id,
		},
	});

	if (!result) {
		return doResponse(res.status(404), {
			success: false,
			message: "Invalid ID",
		});
	}

	return doResponse(res, {
		data: {
			id: result.id,
			status: result.status,
			...(result.content ? { content: result.content } : {}),
		},
	});
});

// router.get("/test", async (req, res) => {
// 	return doResponse(res, {
// 		data: await getAudioParts(`data/videoplayback.m4a`),
// 	});
// });

router.get("/:id/audio", async (req, res) => {
	const id = req.params.id;

	const result = await prisma.speech2Text.findUnique({
		where: {
			id,
		},
	});

	if (!result || result.status !== "done") {
		return doResponse(res.status(404), {
			success: false,
			message: "Invalid ID",
		});
	}

	const file = `data/uploads/${result.fileName}`;
	const fileStream = createReadStream(file);
	res.appendHeader("Content-Type", "audio/wav");
	return fileStream.pipe(res);
});

router.post("/:id/summarize", async (req, res) => {
	const id = req.params.id;

	const result = await prisma.speech2Text.findUnique({
		where: {
			id,
		},
	});
	if (!result) {
		return doResponse(res.status(404), {
			success: false,
			message: "Invalid ID",
		});
	}

	if (!result.content) {
		return doResponse(res.status(400), {
			success: false,
			message: "No content",
		});
	}

	try {
		const summary = await summarizeText(result.content);
		return streamToResponse(summary, res);
	} catch (err) {
		console.error(err);
		return doResponse(res.status(500), {
			success: false,
			message: "Internal server error",
		});
	}
});

export default router;
