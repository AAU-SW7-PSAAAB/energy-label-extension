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

class FormatPlugin implements IPlugin {
	name = "Format";
	version = "1.0.0";
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

		const networkMediaTypes = ["image", "media", "font"];
		const mediaRequests = Object.values(network)
			.filter((e) => networkMediaTypes.includes(e.type))
			.map((e) => ({
				url: e.url,
				type: e.type,
				contentType: e.responseHeaders?.find(
					(e) => e.name === "content-type",
				)?.value,
			}));

		const redirects = new Map(
			Object.values(network)
				.filter(
					(e) =>
						e.statusCode === 302 &&
						networkMediaTypes.includes(e.type),
				)
				.map((e) => [e.url, e.redirectUrl]),
		);

		const formatMap = new Map<string, string>();
		for (const mediaRequest of mediaRequests) {
			const format =
				mediaRequest.contentType
					?.split("/")[1] // image/svg+xml => svg+xml
					?.split(/[+;]/)[0] || // svg+xml => svg
				// When content-type is not specified, but the URL specifies the format
				mediaRequest.url
					?.split(/[?#]/)[0] // https://example.com/image.avif?key=value or https://example.com/image.avif#fragment => https://example.com/image.avif
					?.split(".") // https://example.com/image.avif => [https://example, com/image, avif]
					?.pop(); // [https://example, com/image, avif] => avif
			if (!format) {
				debug.debug("No format found for media", mediaRequest);
				continue;
			}

			formatMap.set(mediaRequest.url, format);
		}

		const DOMMediaElements = dom(
			"svg, img, picture, video, audio, source, link",
		);

		const allURLs: Set<string> = new Set();

		for (const element of DOMMediaElements) {
			const src = dom(element).attr("src") || dom(element).attr("href");
			const srcset = dom(element)
				.attr("srcset")
				?.split(",")
				.map((e) => e.trim().split(" ")[0]);

			// Combine src and srcset into a single array, as one element can have null
			const sources =
				src && srcset ? [src, ...srcset] : src ? [src] : srcset;

			if (!sources) continue;

			for (const source of sources) {
				allURLs.add(source);
			}
		}

		if (input.css) {
			for (const match of input.css.matchAll(
				/url\(['"]?([^'"]+)['"]?\)/g, // url("example.com") or url('example.com') or url(example.com)
			)) {
				allURLs.add(match[1]);
			}
		}

		let accumulatedScore = 0;
		let validUsedMedia = 0;
		for (const URL of allURLs) {
			// Data URLs are judged on format and score is halved as they are inefficient
			if (URL.startsWith("data:")) {
				const format = URL.split(";")[0] // data:image/svg+xml;base64,.... => data:image/svg+xml
					?.split("/")[1] // data:image/svg+xml => svg+xml
					?.split(/[+;]/)[0]; // svg+xml => svg

				if (!format) {
					debug.debug("No format found for data URL", URL);
					continue;
				}

				accumulatedScore += (formatScores.get(format) || 0) / 2;
				validUsedMedia++;
				continue;
			}

			let destination = URL;
			let redirectCount = 0;

			while (redirectCount < 10) {
				const redirect = redirects.get(destination);
				if (!redirect) break;

				destination = redirect;
				redirectCount++;
			}

			if (redirectCount >= 10) {
				debug.debug("Redirect loop detected", URL);
				continue;
			}

			if (!mediaRequests.find((e) => e.url === destination)) {
				debug.debug("Media not found in network", URL);
				continue;
			}

			const format = formatMap.get(destination);
			if (!format) {
				debug.debug("Format not found for media", URL);
				continue;
			}

			accumulatedScore += formatScores.get(format) || 0;
			validUsedMedia++;
		}

		return validUsedMedia > 0 ? accumulatedScore / validUsedMedia : 100;
	}
}

export default new FormatPlugin();