import { OpenAIStream } from "ai";
import OpenAI from "openai";

const openai = new OpenAI({
	apiKey: process.env["OPENAI_API_KEY"],
});

export default async function summarizeText(text: string) {
	const chat = await openai.chat.completions.create({
		messages: [
			{
				role: "system",
				content: `You will receive a Thai texts from Speech To Text API and you should summarize that to make text more simpler and easier to read. Target audience is students, either primary or secondary level, based on what the text context is about. Texts may have incorrect or unrelated words, and you should be able to ignore that safely to provide a higher quality of the result.`,
			},
			{
				role: "user",
				content: text,
			},
		],
		model: "gpt-3.5-turbo",
		stream: true,
	});
	return OpenAIStream(chat);
}
