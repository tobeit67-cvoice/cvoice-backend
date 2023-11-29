import OpenAI from "openai";
import { OpenAIStream } from "ai";

const openai = new OpenAI({
	apiKey: process.env["OPENAI_API_KEY"],
});

export default async function summarizeText(text: string) {
	const chat = await openai.chat.completions.create({
		messages: [
			{
				role: "user",
				content: `"${text}" ช่วยเรียบเรียงข้อความนี้ใหม่ ให้อ่านเข้าใจง่ายขึ้นหน่อย`,
			},
		],
		model: "gpt-3.5-turbo",
		stream: true,
	});
	return OpenAIStream(chat);
}
