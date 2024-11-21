import { average } from "../lib/average";
import debug from "../lib/debug";
import { Requirements, requires, ResultType } from "../lib/pluginTypes";
import type {
	IPlugin,
	PluginCheck,
	PluginInput,
	PluginResultSink,
} from "../lib/pluginTypes";

enum PrefrenceType {
	PrefColor = "Prefered color scheme",
	PrefContrast = "Prefered contrast",
	ColorScheme = "Supported color scheme",
}
type checkObject = { name: PrefrenceType; RegExp: RegExp };

class UserpreferencePlugin implements IPlugin {
	name = "User preference";
	version = "1.0.0";
	requires = requires(Requirements.Document);

	async analyze(sink: PluginResultSink, input: PluginInput) {
		const css = input.document.hasCss ? input.document.css : "";

		const preferencechecks: checkObject[] = [
			{
				name: PrefrenceType.PrefColor,
				RegExp: /@media[^{]*prefers-color-scheme/,
			},
			{
				name: PrefrenceType.PrefContrast,
				RegExp: /@media[^{]*prefers-contrast/,
			},
			{
				name: PrefrenceType.ColorScheme,
				RegExp: /color-scheme\s*:([^{]*((light)|(dark))){2}/,
			},
		];

		const completedChecks = 0;

		const checkResults: PluginCheck = {
			name: "User preference checks",
			type: ResultType.Requirement,
			score: 0,
			description: "Results of preference analysis",
			table: [["Name", "Score"]],
		};

		preferencechecks.map((check) => {
			debug.debug("Checks for: " + check.name);
			let result = 0;
			if (css.search(check.RegExp) >= 0) result = 100;

			checkResults.table?.push([check.name, result]);
			updateResults();
		});

		async function updateResults() {
			const score = average(
				//Slice top row with names of and take average of the scores
				checkResults.table?.slice(1).map((row) => row[1]) as number[],
			);

			await sink({
				progress: preferencechecks.length / completedChecks,
				score,
				description:
					score === 100
						? "Your website correctly checks for user prefrences"
						: "Some prefrences are not checked for",
				checks: [checkResults],
			});
		}
	}
}

export default new UserpreferencePlugin();
