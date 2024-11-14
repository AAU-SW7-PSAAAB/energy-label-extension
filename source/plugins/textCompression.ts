import {
	Requirements,
	requires,
	type IPlugin,
	type PluginInput,
} from "../lib/pluginTypes";

class TextCompressionPlugin implements IPlugin {
	name = "Text compression";
	version = "1.0.0";
	requires = requires(Requirements.Network);
	async analyze(input: PluginInput): Promise<number> {
		const network = input.network;

		const scores: number[] = [];

		for (const details of Object.values(network)) {
			if (
				!details.responseHeaders
			) {
				continue;
			}
			const contentType = details.responseHeaders.find(
				(candidate) => candidate.name.toLowerCase() === "content-type",
			);
			if (
				!contentType?.value ||
				!(
					contentType.value.startsWith("text/") ||
					contentType.value.startsWith("application/json") ||
					contentType.value.startsWith("application/xml") ||
					contentType.value.startsWith("image/svg")
				)
			) {
				continue;
			}
			const contentEncoding = details.responseHeaders.find(
				(candidate) =>
					candidate.name.toLowerCase() === "content-encoding",
			);
			switch (contentEncoding?.value) {
				case "br": {
					scores.push(100);
					break;
				}
				case "zstd": {
					scores.push(100);
					break;
				}
				case "gzip": {
					scores.push(50);
					break;
				}
				default: {
					scores.push(0);
					break;
				}
			}
		}

		if (scores.length === 0) {
			scores.push(100);
		}

		return scores.reduce((a, b) => a + b, 0) / scores.length;
	}
}

export default new TextCompressionPlugin();
