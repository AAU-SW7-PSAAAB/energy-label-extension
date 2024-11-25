import { average } from "../lib/average";
import debug from "../lib/debug";
import { Requirements, requires, ResultType } from "../lib/pluginTypes";
import type {
	IPlugin,
	PluginInput,
	PluginResultSink,
} from "../lib/pluginTypes";

const formatScores = new Map<string, number>([
	["br", 100],
	["zstd", 100],
	["gzip", 50],
	["Plain text", 0],
]);

class TextCompressionPlugin implements IPlugin {
	name = "Text compression";
	version = "1.0.0";
	requires = requires(Requirements.Network);
	async analyze(sink: PluginResultSink, input: PluginInput) {
		const network = Object.values(input.network);

		const totalRequests = network.length;
		let completedRequests = 0;
		const results: [string, string, number][] = [];

		for (const details of network) {
			completedRequests++;
			if (!details.responseHeaders) {
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
			const format = contentEncoding?.value ?? "Plain text";
			let score = formatScores.get(format);
			if (score === undefined) {
				debug.warn("Unknown format detected:", format);
				score = 0;
			}
			results.push([details.url, format, score]);
			updateResult();
		}
		updateResult();

		async function updateResult() {
			const score =
				results.length === 0
					? 100
					: average(results.map((row) => row[2]));
			await sink({
				progress:
					totalRequests > 0
						? (completedRequests / totalRequests) * 100
						: 100,
				score,
				description:
					score === 100
						? "Your website uses modern text compression."
						: "Some assets on your website are using outdated text compression formats.",
				checks: [
					{
						name: "Compression",
						score,
						type: ResultType.Requirement,
						description:
							score === 100
								? "All assets use modern text compression."
								: "Some assets are using outdated text compression formats.",
						table: [["URL", "Format", "Score"], ...results],
					},
				],
			});
		}
	}
}

export default new TextCompressionPlugin();
