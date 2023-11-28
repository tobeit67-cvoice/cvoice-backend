import OpenAI from "openai";

const openai = new OpenAI({
	apiKey: process.env["OPENAI_API_KEY"],
});

export default async function summarizeText(text: string) {
	const chat = await openai.chat.completions.create({
		messages: [
			{
				role: "assistant",
				content: `"${text}" ช่วยเรียบเรียงข้อความนี้ใหม่ ให้อ่านเข้าใจง่ายขึ้นหน่อย`,
			},
		],
		model: "gpt-3.5-turbo"
	});
	return chat.choices.map(c => c.message.content).join("");
}