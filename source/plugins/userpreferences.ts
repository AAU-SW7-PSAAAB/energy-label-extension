import { average } from "../lib/average";
import debug from "../lib/debug";
import { Requirements, ResultType } from "../lib/pluginTypes";
import type {
	IPlugin,
	PluginCheck,
	PluginInput,
	PluginResultSink,
} from "../lib/pluginTypes";

enum PreferenceType {
	PrefColor = "Dark mode",
	PrefContrast = "Preferred contrast",
	ColorScheme = "Supported color scheme",
}
type checkObject = { name: PreferenceType; regExp: RegExp };

class UserPreferencePlugin implements IPlugin {
	name = "User preference";
	version = "1.0.0";
	requires = [Requirements.Document];

	async analyze(sink: PluginResultSink, input: PluginInput) {
		const css = input.document.hasCss ? input.document.css : "";

		const preferenceChecks: checkObject[] = [
			{
				name: PreferenceType.PrefColor,
				regExp: /(@media[^{};]*prefers-color-scheme)|([^a-zA-Z0-9-_]color-scheme\s*:([^{};]*((light)|(dark))){2})/,
			},
			// {
			// 	name: PreferenceType.PrefContrast,
			// 	regExp: /@media[^{};]*prefers-contrast/,
			// },
		];

		let completedChecks = 0;

		const checkResults: PluginCheck[] = [];

		preferenceChecks.map((check) => {
			debug.debug("Checks for: " + check.name);
			let score = 0;
			if (css.search(check.regExp) >= 0) score = 100;

			const checkResult: PluginCheck = {
				name: check.name,
				type: ResultType.Requirement,
				score,
				susWebLink:
					"https://sustainablewebdesign.org/guidelines/3-13-adapt-to-user-preferences/",
			};
			switch (check.name) {
				case PreferenceType.PrefColor: {
					checkResult.description =
						score === 100
							? "Your website supports dark mode."
							: `Your website does not support dark mode. Dark mode support is recommended for multiple reasons, one being that it greatly reduces power consumption on some devices. You can use the "light-dark" CSS function to provide colors in both light and dark modes.`;
					break;
				}
				// case PreferenceType.PrefContrast: {
				// 	checkResult.description =
				// 		score === 100
				// 			? "Your website supports contrast."
				// 			: "";
				// 	break;
				// }
			}
			checkResults.push(checkResult);
			completedChecks++;
			updateResults();
		});

		async function updateResults() {
			const score = average(checkResults.map((result) => result.score));
			await sink({
				progress: (completedChecks / preferenceChecks.length) * 100,
				score,
				description:
					score === 100
						? "Your website correctly checks for user preferences"
						: "Some preferences are not checked for",
				checks: checkResults,
			});
		}
	}
}

export default new UserPreferencePlugin();
