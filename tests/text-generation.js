require("dotenv").config({
	path: "../.env",
});
const { OpenAI } = require("openai");

const openai = new OpenAI({
	apiKey: process.env["OPENAI_API_KEY"],
});

async function main() {
	const stream = await openai.chat.completions.create({
		messages: [
			{
				role: "assistant",
				content: `"สวัสดีนักเรียนวันนี้ครูจะมาสอนเรื่องวิชาภาษาไทยนะวันนี้จะเรียนเรื่องสุนทรภู่การนักเรียนนะก็เตรียมหนังสือมาจดกันได้เลย" ช่วยเรียบเรียงข้อความนี้ใหม่ ให้อ่านเข้าใจง่ายขึ้นหน่อย`,
			},
		],
		model: "gpt-3.5-turbo",
		stream: true,
	});
	for await (const chunk of stream) {
		process.stdout.write(chunk.choices[0]?.delta?.content || "");
	}
}

main();
