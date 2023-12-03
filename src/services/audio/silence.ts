export type AudioPart = {
	audio_start: number;
	audio_end: number;
	audio_duration: number;
	silence_duration: number;
};

/**
 * Class to parse FFMPEG output to silence detection parts,
 * and split audio based on these informations.
 */
class FFMpegSilenceProcessor {
	private _parts: AudioPart[] = [];
	private currentPos: number = 0;
	private duration: number = 0;

	/**
	 * Returns all audio parts splitted by silence information.
	 */
	get parts() {
		return this._parts;
	}

	reset() {
		this._parts = [];
		this.currentPos = 0;
	}

	/**
	 * Set the duration of the audio file, returned from initial file `codecData` event.
	 *
	 * The duration is used to calculate audio parts in case no more silence is detected.
	 *
	 * @param duration Duration of the audio file in HH:mm:ss format.
	 */

	setDuration(duration: string) {
		const a = duration.split(":");
		const hours = +a[0] * 60 * 60;
		const minutes = +a[1] * 60;
		const seconds = +a[2];
		this.duration = hours + minutes + seconds;
	}

	private _handleSilenceStart = (value: number) => {
		this._parts.push({
			audio_start: this.currentPos,
			audio_end: value,
			audio_duration: value - this.currentPos,
			silence_duration: 0,
		});
	};

	private _handleSilenceEnd = (value: number) => {
		this.currentPos = value;
	};

	private _handleSilenceDuration = (value: number) => {
		//this.currentPos += value;
		this._parts[this._parts.length - 1] = {
			...(this._parts[this._parts.length - 1] || {}),
			silence_duration: value,
		};
	};

	private readonly handlers: Record<string, (value: number) => void> = {
		silence_start: this._handleSilenceStart,
		silence_end: this._handleSilenceEnd,
		silence_duration: this._handleSilenceDuration,
	};

	private handleFFMpegOutputLine = (output: string) => {
		for (const handler in this.handlers) {
			const regex = new RegExp(`(?:${handler}: )([0-9\.]{1,})`);
			const match = output.match(regex);
			if (match && match[1]) {
				const value = Number(match[1]);
				if (!isNaN(value)) {
					this.handlers[handler](Number(match[1]));
				}
			}
		}
	};

	/**
	 * Parse all silence detection from ffmpeg output, and returns an audio parts splitted by the silence information.
	 */
	getSilenceParts(data: string) {
		const lines = data.split("\n");
		for (const line of lines) {
			this.handleFFMpegOutputLine(line);
		}
		if (
			this._parts.length > 0 &&
			this._parts[this._parts.length - 1].audio_end < this.duration
		) {
			this._parts.push({
				audio_start: this.currentPos,
				audio_end: this.duration,
				audio_duration: this.duration - this.currentPos,
				silence_duration: 0,
			});
		}
		return this;
	}
	/**
	 * Merge all audio parts with a duration less than `max_duration` seconds.
	 *
	 * Must call `getSilenceParts` before calling this method.
	 */
	mergeWithDuration(max_duration: number) {
		return this._parts.reduce((acc, part) => {
			let lastPart = acc[acc.length - 1];
			if (!lastPart) {
				acc.push(part);
				return acc;
			}
			const newDuration =
				lastPart.audio_duration + part.audio_duration + part.silence_duration;

			if (newDuration < max_duration) {
				lastPart = {
					...lastPart,
					audio_end: part.audio_end,
					audio_duration: newDuration,
					silence_duration: part.silence_duration,
				};
				acc[acc.length - 1] = lastPart;
			} else {
				acc.push(part);
			}

			return acc;
		}, [] as AudioPart[]);
	}
}

export default FFMpegSilenceProcessor;
