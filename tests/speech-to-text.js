require("dotenv").config();

const { default: axios } = require("axios");
const { createReadStream } = require("fs");
const FormData = require("form-data");

async function textToSpeech(wav) {
    const form = new FormData();
    form.append("file", wav);
    console.time("api");
    const res = await axios.post("https://api.iapp.co.th/asr", form, {
        headers: {
            "apikey": process.env.IAPP_API_KEY
        }
    });
    console.timeEnd("api");
    console.log(res.data);
}

const buffer = createReadStream("./test.wav");
textToSpeech(buffer);