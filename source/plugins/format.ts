import type { IPlugin, PluginInput } from "../lib/pluginTypes";

/*
	Notes:
	- How to find media used in unconventional ways?
		- Can technically traverse all element attributes but that's a lot of work (for the analyzer, not the developer xd)
	- Media in CSS such as background images?
	- Not traversing iframes? (I tried audio in iframes and it didn't work)
	- Should we check font formats too?
	- Should we check srcset too here? Can srcset and src have different formats in same image tag?
	- File format is not in URL but in the response headers?
	- What about data URLs? data:[<media-type>][;base64],<data>

	- Fuck DOM and CSS? Just look requests? Because it's hard to find in all media in DOM and sometimes the file type is not in the URL but in Content-Type Header
*/

class FormatPlugin implements IPlugin {
	name = "Format";
	version = "0.0.1";
	requiresDocument = false;
	requiresNetwork = true;
	async analyze(input: PluginInput): Promise<number> {
		const mediaList = Object.values(input.network)
			.filter((e) => ["image", "media"].includes(e.type))
			.map((e) => {
				return {
					type: e.type,
					contentType: e.responseHeaders?.find(
						(e) => e.name === "content-type",
					)?.value,
					all: e,
				};
			});

		console.log(mediaList);

		const formatScores = new Map<string, number>([
			["svg", 100],
			["avif", 100],
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

		const mediaScore = 0;
		const workingMedia = 0;

		for (const media of mediaList) {
			const format = media.contentType?.split("/").pop();
			if (!format) continue;

			console.log(format, formatScores.get(format));
		}

		console.log(mediaScore, workingMedia);
		return 0;

		// const images = input.dom("svg, img, picture, picture source");
		// const videos = input.dom("video, video source");
		// const audios = input.dom("audio, audio source");

		// let imageScore = 0;
		// let videoScore = 0;
		// let audioScore = 0;

		// let workingImages = 0;
		// let workingVideos = 0;
		// let workingAudios = 0;

		// for (const image of images) {
		// 	const src = input.dom(image).attr("src");
		// 	if (!src) continue;

		// 	const format = src.split(/[?#]/)[0].split(".").pop();
		// 	if (!format) continue;

		// 	imageScore += formatScores.get(format) || 0;
		// 	workingImages++;
		// }

		// for (const video of videos) {
		// 	const src = input.dom(video).attr("src");
		// 	if (!src) continue;

		// 	const format = src.split(/[?#]/)[0].split(".").pop();
		// 	if (!format) continue;

		// 	videoScore += formatScores.get(format) || 0;
		// 	workingVideos++;
		// }

		// for (const audio of audios) {
		// 	const src = input.dom(audio).attr("src");
		// 	if (!src) continue;

		// 	const format = src.split(/[?#]/)[0].split(".").pop();
		// 	if (!format) continue;

		// 	audioScore += formatScores.get(format) || 0;
		// 	workingAudios++;
		// }

		// const totalWorking = workingImages + workingVideos + workingAudios;
		// const totalScore = imageScore + videoScore + audioScore;

		// return totalWorking > 0 ? totalScore / totalWorking : 100;
	}
}

export default new FormatPlugin();
