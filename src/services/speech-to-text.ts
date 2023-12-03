import axios from "axios";
import FormData from "form-data";
import { createReadStream } from "fs";
import path from "path";
import { getAudioFromRange, getAudioParts } from "./audio/ffmpeg";

export type IAPP_ASR_Response = Array<{
	transcript: string;
}>;

export default async function speechToText(
	path: string,
	controller?: AbortController
) {
	const form = new FormData();
	form.append("file", createReadStream(path));
	form.append("diarization", "false");
	const res = await axios.post<IAPP_ASR_Response>(
		"https://api.iapp.co.th/asr",
		form,
		{
			headers: {
				apikey: process.env.IAPP_API_KEY,
			},
			signal: controller?.signal,
		}
	);
	return res.data[0].transcript;
}

export async function unstable_speechToTextMultipart(
	sourceFile: string,
	controller?: AbortController
) {
	const parts = await getAudioParts(sourceFile, 60);
	const filename = path.parse(sourceFile).name;
	const result = await Promise.all(
		parts.map(async (part, index) => {
			const processedFile = `data\\processed\\${filename}_${index}.wav`;
			await new Promise((resolve, reject) =>
				getAudioFromRange(sourceFile, part.audio_start, part.audio_duration)
					.on("error", reject)
					.on("end", resolve)
					.saveToFile(`'${processedFile}'`)
			);
			return `${index}`;
		})
	);
	return result.join(" ");
}
