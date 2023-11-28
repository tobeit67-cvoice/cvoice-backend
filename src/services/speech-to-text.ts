import axios from "axios";
import FormData from "form-data";
import { createReadStream } from "fs";

export default async function speechToText(file: Express.Multer.File) {
	const form = new FormData();
	form.append("file", createReadStream(file.path));
	form.append("diarization", "false");
	const res = await axios.post("https://api.iapp.co.th/asr", form, {
		headers: {
			apikey: process.env.IAPP_API_KEY,
		},
	});
	return res.data[0].transcript;
}
