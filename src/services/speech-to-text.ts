import axios from "axios";
import FormData from "form-data";
import { createReadStream } from "fs";

export type IAPP_ASR_Response = Array<{
	transcript: string;
}>;

export default async function speechToText(
	file: Express.Multer.File,
	controller?: AbortController
) {
	const form = new FormData();
	form.append("file", createReadStream(file.path));
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
