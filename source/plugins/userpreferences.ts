import { average } from "../lib/average";
import debug from "../lib/debug";
import { Requirements, requires, ResultType } from "../lib/pluginTypes";
import type {
	IPlugin,
	PluginCheck,
	PluginInput,
	PluginResultSink,
} from "../lib/pluginTypes";

enum PreferenceType {
	PrefColor = "Preferred color scheme",
	PrefContrast = "Preferred contrast",
	ColorScheme = "Supported color scheme",
}
type checkObject = { name: PreferenceType; regExp: RegExp };

class UserPreferencePlugin implements IPlugin {
	name = "User preference";
	version = "1.0.0";
	requires = requires(Requirements.Document);

	async analyze(sink: PluginResultSink, input: PluginInput) {
		const css = input.document.hasCss ? input.document.css : "";

		const preferenceChecks: checkObject[] = [
			{
				name: PreferenceType.PrefColor,
				regExp: /(@media[^{]*prefers-color-scheme)|(color-scheme\s*:([^{]*((light)|(dark))){2})/,
			},
			{
				name: PreferenceType.PrefContrast,
				regExp: /@media[^{]*prefers-contrast/,
			},
		];

		let completedChecks = 0;

		const checkResults: PluginCheck = {
			name: "User preference checks",
			type: ResultType.Requirement,
			score: 0,
			description: "Results of preference analysis",
		};

		preferenceChecks.map((check) => {
			debug.debug("Checks for: " + check.name);
			let result = 0;
			if (css.search(check.regExp) >= 0) result = 100;

			checkResults.table ??= [["Name", "Score"]];
			checkResults.table.push([check.name, result]);
			checkResults.score = average(
				//Slice top row with names of and take average of the scores
				checkResults.table.slice(1).map((row) => row[1]) as number[],
			);
			completedChecks++;
			updateResults();
		});

		async function updateResults() {
			const score = checkResults.score;
			await sink({
				progress: (preferenceChecks.length / completedChecks) * 100,
				score,
				description:
					score === 100
						? "Your website correctly checks for user preferences"
						: "Some preferences are not checked for",
				checks: [checkResults],
			});
		}
	}
}

export default new UserPreferencePlugin();
