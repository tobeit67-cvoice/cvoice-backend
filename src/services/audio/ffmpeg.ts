import ffmpeg from "fluent-ffmpeg";
import FFMpegSilenceProcessor, { AudioPart } from "./silence";

export const getAudioFromRange = (
	input: string,
	start: number,
	duration: number
) => {
	return ffmpeg()
		.input(input)
		.on("start", function (commandLine) {
			console.log("Spawned Ffmpeg with command: " + commandLine);
		})
		.setStartTime(start)
		.setDuration(duration)
		.audioCodec("pcm_s16le")
		.audioChannels(1)
		.audioFrequency(16_000)
		.outputFormat("wav");
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
