import debug from "../lib/debug";
import type { IPlugin, PluginInput } from "../lib/pluginTypes";

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
	["woff2", 100],
	["woff", 50],
	["ttf", 25],
	["otf", 25],
]);

// TODO:
// - Testing

class FormatPlugin implements IPlugin {
	name = "Format";
	version = "0.0.1";
	requiresDocument = true;
	requiresNetwork = true;
	async analyze(input: PluginInput): Promise<number> {
		const network = input.network;
		if (!network) {
			debug.error("Need access to network to function");
			return 0;
		}

		const dom = input.dom;
		if (!dom) {
			debug.error("Need access to DOM to function");
			return 0;
		}

		const networkTypes = ["image", "media", "audio", "font"];
		const networkMedia = Object.values(network)
			.filter((e) => networkTypes.includes(e.type))
			.map((e) => ({
				type: e.type,
				contentType: e.responseHeaders?.find(
					(e) => e.name === "content-type",
				)?.value,
				url: e.url,
			}));

		const redirects = new Map(
			Object.values(network)
				.filter(
					(e) =>
						e.statusCode === 302 && networkTypes.includes(e.type),
				)
				.map((e) => [e.url, e.redirectUrl]),
		);

		let totalScore = 0;
		let workingMedia = 0;

		const formatMap = new Map<string, string>();
		for (const media of networkMedia) {
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

			formatMap.set(media.url, format);
		}

		const DOMMedia = dom(
			"svg, img, picture, picture source, video, video source, audio, audio source",
		);

		const CSSMedia =
			input.css
				?.match(/url\(([^)]+)\)/g) // Matches anything inside url()
				?.map((e) => e.replaceAll('url("', "").replaceAll('")', "")) || // Removes url() and quotes
			[]; // If no matches, return empty array

		const DOMURLs: Set<string> = new Set();

		for (const media of DOMMedia) {
			const src = dom(media).attr("src");
			const srcset = dom(media)
				.attr("srcset")
				?.split(",")
				.map((e) => e.trim().split(" ")[0]);

			// Combine src and srcset into a single array, as one element can have null
			const sources =
				src && srcset ? [src, ...srcset] : src ? [src] : srcset;
			if (!sources) continue;

			for (const URL of sources) {
				DOMURLs.add(URL);
			}
		}

		for (const media of CSSMedia) {
			DOMURLs.add(media);
		}

		for (const URL of DOMURLs) {
			let destination = URL;
			let redirectCount = 0;

			const MAX_REDIRECTS = 10;
			while (redirectCount < MAX_REDIRECTS) {
				const redirect = redirects.get(destination);
				if (!redirect) break;

				destination = redirect;
				redirectCount++;
			}

			if (!networkMedia.find((e) => e.url === destination)) {
				debug.debug("Media not found in network", URL);
				continue;
			}

			const format = formatMap.get(destination);
			if (!format) {
				debug.debug("No format found for media", URL);
				continue;
			}

			totalScore += formatScores.get(format) || 0;
			workingMedia++;
		}

		return workingMedia > 0 ? totalScore / workingMedia : 100;
	}
}

export default new FormatPlugin();
