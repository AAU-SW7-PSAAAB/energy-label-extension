import debug from "../lib/debug";
import {
	Requirements,
	requires,
	type IPlugin,
	type PluginInput,
} from "../lib/pluginTypes";

class UserprefrencePlugin implements IPlugin {
	name = "Darkmode";
	version = "0.0.1";
	requires = requires(Requirements.Document);
	async analyze(input: PluginInput): Promise<number> {
		const css = input.document.hasCss ? input.document.css : "";

		const checks: string[] = [
			"@media (prefers-color-scheme:",
			"@media (prefers-contrast:",
			"@media (prefers-reduced-motion",
		];
		let result = 0;
		checks.map((searchString) => {
			debug.debug("Checks for: " + searchString);
			if (css.includes(searchString)) result += 100;
		});

		return result / checks.length;
	}
}

export default new UserprefrencePlugin();
