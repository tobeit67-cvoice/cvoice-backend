import ffmpeg from "fluent-ffmpeg";
import FFMpegSilenceProcessor, { AudioPart } from "./silence";

/**
 * Converts the audio file to mono, 16-bit, 16kHz PCM WAV, which is the format
 * required by most speech-to-text APIs.
 */
export const convertAudioFile = (input: string, output: string) => {
	return new Promise<void>((resolve, reject) =>
		ffmpeg()
			.input(input)
			.audioCodec("pcm_s16le")
			.audioChannels(1)
			.audioFrequency(16_000)
			.on("data", console.log)
			.on("error", reject)
			.on("end", resolve)
			.outputFormat("wav")
			.save(output)
	);
};

/**
 * Splits the audio file into parts based on the silence duration.
 *
 * **Note:** The final parts duration may be shorter than the `maxDurationInSeconds` parameter.
 */
export const getAudioParts = (input: string, maxDurationInSeconds: number) => {
	return new Promise<AudioPart[]>((resolve, reject) => {
		const silence = new FFMpegSilenceProcessor();
		ffmpeg({ stdoutLines: 0 })
			.input(input)
			.audioFilter("silencedetect=noise=-20dB:d=0.3")
			.on("codecData", function (data) {
				silence.setDuration(data.duration);
			})
			.on("start", function (commandLine) {
				console.log("Spawned Ffmpeg with command: " + commandLine);
			})
			.on("error", reject)
			.on("end", (stderr, stdout) => {
				resolve(
					silence
						.getSilenceParts(stdout)
						.mergeWithDuration(maxDurationInSeconds)
				);
			})
			.outputFormat("null")
			.save("-")
			.run();
	});
};
