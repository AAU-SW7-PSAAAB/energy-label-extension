import type { IPlugin, PluginInput } from "../lib/pluginTypes";

/*
	Notes:
	- Media in CSS such as background images?
	- Not traversing iframes? (I tried audio in iframes and it didn't work)
	- Should we check font formats too?
	- Should we check srcset too here? Can srcset and src have different formats in same image tag?
	- File format is not in URL but in the response headers?
*/

class FormatPlugin implements IPlugin {
	name = "Format";
	version = "0.0.1";
	async analyze(input: PluginInput): Promise<number> {
		const formatScores = new Map<string, number>([
			["svg", 100],
			["avif", 75],
			["jxl", 75],
			["webp", 50],
			["png", 25],
			["jpg", 25],
			["jpeg", 25],
			["bmp", 25],
			["ico", 25],
			["mp4", 100],
			["webm", 100],
			["mp3", 100],
			["aac", 100],
			["ogg", 100],
		]);

		const images = input.dom("svg, img, picture, picture source");
		const videos = input.dom("video, video source");
		const audios = input.dom("audio, audio source");

		let imageScore = 0;
		let videoScore = 0;
		let audioScore = 0;

		let workingImages = 0;
		let workingVideos = 0;
		let workingAudios = 0;

		for (const image of images) {
			const src =
				input.dom(image).attr("src") || input.dom(image).attr("source");
			if (!src) continue;

			const format = src.split(/[?#]/)[0].split(".").pop();
			if (!format) continue;

			imageScore += formatScores.get(format) || 0;
			workingImages++;
		}

		for (const video of videos) {
			const src =
				input.dom(video).attr("src") || input.dom(video).attr("source");
			if (!src) continue;

			const format = src.split(/[?#]/)[0].split(".").pop();
			if (!format) continue;

			videoScore += formatScores.get(format) || 0;
			workingVideos++;
		}

		for (const audio of audios) {
			const src =
				input.dom(audio).attr("src") || input.dom(audio).attr("source");
			if (!src) continue;

			const format = src.split(/[?#]/)[0].split(".").pop();
			if (!format) continue;

			audioScore += formatScores.get(format) || 0;
			workingAudios++;
		}

		const totalWorking = workingImages + workingVideos + workingAudios;
		const totalScore = imageScore + videoScore + audioScore;

		return totalWorking > 0 ? totalScore / totalWorking : 100;
	}
}

export default new FormatPlugin();
