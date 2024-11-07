import debug from "../lib/debug";
import type { IPlugin, PluginInput } from "../lib/pluginTypes";

/*
	Notes:
	- How to find media used in unconventional ways?
		- Can technically traverse all element attributes but that's a lot of work (for the analyzer, not the developer xd)
	- Media in CSS such as background images?
	- Not traversing iframes? (I tried audio in iframes and it didn't work)
	- Should we check font formats too?
	- Should we check srcset too here? Can srcset and src have different formats in same image tag?
	- What about data URLs? data:[<media-type>][;base64],<data>
*/

class FormatPlugin implements IPlugin {
	name = "Format";
	version = "0.0.1";
	requiresDocument = false;
	requiresNetwork = true;
	async analyze(input: PluginInput): Promise<number> {
		const network = input.network;
		if (!network) {
			debug.error("Need access to network to function");
			return 0;
		}

		const mediaList = Object.values(network)
			.filter((e) => ["image", "media", "audio"].includes(e.type))
			.map((e) => {
				return {
					type: e.type,
					contentType: e.responseHeaders?.find(
						(e) => e.name === "content-type",
					)?.value,
					url: e.url,
				};
			});

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
			["gif", 25],
			["mp4", 100],
			["webm", 100],
			["mp3", 100],
			["aac", 100],
			["ogg", 100],
		]);

		let mediaScore = 0;
		let workingMedia = 0;

		for (const media of mediaList) {
			const format =
				media.contentType
					?.split("/") // image/svg+xml => [image, svg+xml]
					?.pop() // [image, svg+xml] => svg+xml
					?.split(/[+;]/)[0] || // svg+xml => svg
				// When content-type is not specified, but the URL specifies the format
				media.url
					?.split(/[?#]/)[0] // https://example.com/image.avif?key=value or https://example.com/image.avif#fragment => https://example.com/image.avif
					?.split(".") // https://example.com/image.avif => [https://example, com/image, avif]
					?.pop(); // [https://example, com/image, avif] => avif
			if (!format) {
				debug.debug("No format found for media", media);
				continue;
			}

			mediaScore += formatScores.get(format) || 0;
			workingMedia++;
		}

		return workingMedia > 0 ? mediaScore / workingMedia : 100;

		/*
			Plan:
			1) Save all formats from requests as a map of media URL => format
			2) Traverse DOM and CSS to find media URLs and lookup their format in the map
			3) After traversing the DOM and CSS, any unused media is identified and added to a list of opportunities (could be lazy loaded, dynamically loaded, etc. for UX/SEO)
			   Used media is given a score based on the format
			4) Return the total score divided by the number of media
		*/
	}
}

export default new FormatPlugin();
