import { average } from "../lib/average";
import debug from "../lib/debug";
import { Requirements, requires, ResultType } from "../lib/pluginTypes";
import type {
	IPlugin,
	PluginCheck,
	PluginInput,
	PluginResultSink,
} from "../lib/pluginTypes";

type FormatResult = { url: string; format: string; isDataEncoded: boolean };

enum FormatType {
	Image = "Images",
	Video = "Videos",
	Audio = "Audio files",
	Font = "Font files",
	Unknown = "Unknown files",
}

//format, [score, type]
const formatInfo = new Map<string, [number, FormatType]>([
	["svg", [100, FormatType.Image]],
	["avif", [100, FormatType.Image]],
	["jxl", [75, FormatType.Image]],
	["webp", [50, FormatType.Image]],
	["png", [25, FormatType.Image]],
	["jpg", [25, FormatType.Image]],
	["jpeg", [25, FormatType.Image]],
	["bmp", [25, FormatType.Image]],
	["ico", [25, FormatType.Image]],
	["gif", [25, FormatType.Image]],
	["mp4", [100, FormatType.Video]],
	["webm", [100, FormatType.Video]],
	["mp3", [100, FormatType.Audio]],
	["aac", [100, FormatType.Audio]],
	["ogg", [100, FormatType.Audio]],
	["woff2", [100, FormatType.Font]],
	["woff", [50, FormatType.Font]],
	["ttf", [25, FormatType.Font]],
	["otf", [25, FormatType.Font]],
]);

class FormatPlugin implements IPlugin {
	name = "Format";
	version = "1.0.0";
	requires: Set<Requirements> = requires(
		Requirements.Network,
		Requirements.Document,
	);
	async analyze(sink: PluginResultSink, input: PluginInput) {
		const network = input.network;
		const dom = input.document.dom;

		const previousUrls: Set<string> = new Set();

		const checks: Record<FormatType, PluginCheck> = Object.values(
			FormatType,
		).reduce(
			(object, name) => {
				object[name] = {
					name,
					type: ResultType.Requirement,
					score: 100,
					description: "Your site does not use files in this format.",
					table: [["URL", "Format", "Score"]],
				};
				return object;
			},
			{} as Record<FormatType, PluginCheck>,
		);

		const DOMMediaElements = dom(
			"svg, img, picture, video, audio, source, link",
		);

		const cssUrls = [];
		if (input.document.hasCss) {
			cssUrls.push(
				...[
					...input.document.css.matchAll(
						/url\(['"]?([^'"]+)['"]?\)/g, // Matches url("example.com") or url('example.com') or url(example.com)
					),
				].map((match) => match[1]), // match[1] is the first capture group, which is the URL
			);
		}

		const totalElements: number = DOMMediaElements.length + cssUrls.length;
		let completedElements = 0;
		let progress = 0;
		await updateResults();

		for (const element of DOMMediaElements) {
			let srcsetFound = false;
			for (const srcset of dom(element).attr("srcset")?.split(",") || // srcset="example1.com 100w, example2.com 200w" => ["example1.com 100w", " example2.com 200w"]
				[]) {
				const url = srcset.trim().split(" ")[0]; // "example1.com 100w" => "example1.com"
				await processUrl(url);
				srcsetFound = true;
			}
			// srcset will always take precedence over src, so if srcset is there, you are allowed to
			// put whatever in the src for backwards compat and we won't judge you for it
			if (!srcsetFound) {
				// href is for link elements for fonts / icons
				const src =
					dom(element).attr("src") || dom(element).attr("href");
				if (src) await processUrl(src);
			}

			completedElements++;
			progress = (completedElements / totalElements) * 100;
		}

		for (const cssUrl of cssUrls) {
			await processUrl(cssUrl);
			completedElements++;
			progress = (completedElements / totalElements) * 100;
		}

		async function processUrl(url: string): Promise<void> {
			const details = getFormatFromUrl(url, network, previousUrls);
			if (!details) return;

			const info = formatInfo.get(details.format) || [
				0,
				FormatType.Unknown,
			];
			const check = checks[info[1]];
			check.table!.push([
				details.url,
				details.isDataEncoded
					? `data ${details.format}`
					: details.format,
				// Data URLs are halved as they are inefficient
				details.isDataEncoded ? info[0] / 2 : info[0],
			]);

			const score =
				check.table!.length <= 1
					? 100
					: average(
							check
								.table!.slice(1)
								.map((row) => row[2]) as number[],
						);
			check.score = score;
			check.description =
				info[1] === FormatType.Unknown
					? score === 100
						? `You are not using unknown formats.`
						: `Some of your files use unknown formats. You should always use standardized formats.`
					: score === 100
						? `All of your ${check.name} use modern compression formats.`
						: `Some of your ${check.name} are using outdated compression formats.`;

			await updateResults();
		}
		async function updateResults() {
			const overallScore = average(
				Object.values(checks).map((check) => check.score),
			);
			await sink({
				progress,
				score: overallScore,
				description:
					overallScore === 100
						? "Your website uses modern compression formats."
						: "Some assets on your website are using outdated compression formats.",
				checks: Object.values(checks),
			});
		}
	}
}

function getFormatFromUrl(
	originalUrl: string,
	network: PluginInput["network"],
	previousUrls: Set<string>,
): FormatResult | undefined {
	if (originalUrl.startsWith("data:")) {
		const format = originalUrl
			.split(";")[0] // data:image/svg+xml;base64,.... => data:image/svg+xml
			?.split("/")[1] // data:image/svg+xml => svg+xml
			?.split(/[+;]/)[0]; // svg+xml => svg

		if (!format) {
			debug.debug("No format found for data URL", originalUrl);
			return;
		}

		return {
			url: originalUrl,
			format,
			isDataEncoded: true,
		};
	}

	let redirectedUrl = originalUrl;
	let redirectCount = 0;

	while (redirectCount < 10) {
		const redirectUrl = network[redirectedUrl]?.redirectUrl;
		if (!redirectUrl) break;

		redirectedUrl = redirectUrl;
		redirectCount++;
	}
	if (redirectCount >= 10) {
		debug.debug("Redirect loop detected", originalUrl);
		return;
	}

	// If we have already added a result for this, we don't need to do it again.
	if (previousUrls.has(redirectedUrl)) {
		return;
	}
	previousUrls.add(redirectedUrl);

	const networkRequest = network[redirectedUrl];
	if (!networkRequest) {
		debug.debug("Media not found in network", originalUrl);
		return;
	}

	// We probably have other sources, like CSS files, in here as well.
	// If the source is not one of the types we care about, we quickly exit.
	if (!["image", "media", "font"].includes(networkRequest.type)) {
		return;
	}

	const contentType = networkRequest.responseHeaders?.find(
		(header) => header.name === "content-type",
	)?.value;

	const format =
		contentType
			?.split("/")[1] // image/svg+xml => svg+xml
			?.split(/[+;]/)[0] || // svg+xml => svg
		// When content-type is not specified, but the URL specifies the format
		networkRequest.url
			?.split(/[?#]/)[0] // https://example.com/image.avif?key=value or https://example.com/image.avif#fragment => https://example.com/image.avif
			?.split(".") // https://example.com/image.avif => [https://example, com/image, avif]
			?.pop(); // [https://example, com/image, avif] => avif
	if (!format) {
		debug.debug("Format not found for media", originalUrl);
		return;
	}

	return { url: networkRequest.url, format, isDataEncoded: false };
}

export default new FormatPlugin();
