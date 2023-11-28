require("dotenv").config({
	path: "../.env",
});

const { default: axios } = require("axios");
const { createReadStream, writeFileSync } = require("fs");
const FormData = require("form-data");

const { OpenAI } = require("openai");

const openai = new OpenAI({
	apiKey: process.env["OPENAI_API_KEY"],
});

async function speechToSummary(wav) {
	const startTime = Date.now();
	console.log("Start");
	const text = await speechToText(wav);
	const speechToTextDone = Date.now();
	console.log(`speechToText done in ${(speechToTextDone - startTime) / 1000}`);
	console.log(text);
	const summarize = await summarizeText(text);
	for await (const chunk of summarize) {
		process.stdout.write(chunk.choices[0]?.delta?.content || '');
	}
	// console.log(`summarizeText done in ${(Date.now() - speechToTextDone) / 1000}`);
	// console.log(summarize);
}

async function speechToText(wav) {
	const form = new FormData();
	form.append("file", wav);
    form.append("diarization", "false");
	const res = await axios.post("https://api.iapp.co.th/asr", form, {
		headers: {
			apikey: process.env.IAPP_API_KEY,
		},
	});
	return res.data[0].transcript;
}

async function summarizeText(text) {
	const chat = await openai.chat.completions.create({
		messages: [
			{
				role: "assistant",
				content: `"${text}" ช่วยเรียบเรียงข้อความนี้ใหม่ ให้อ่านเข้าใจง่ายขึ้นหน่อย`,
			},
		],
		model: "gpt-3.5-turbo",
		stream: true
	});
	return chat;
}

const buffer = createReadStream("./test-9arm.wav");
speechToSummary(buffer);
