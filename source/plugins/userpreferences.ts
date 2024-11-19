import debug from "../lib/debug";
import {
	Requirements,
	requires,
	type IPlugin,
	type PluginInput,
} from "../lib/pluginTypes";

class UserpreferencePlugin implements IPlugin {
	name = "User preference";
	version = "1.0.0";
	requires = requires(Requirements.Document);

	async analyze(input: PluginInput): Promise<number> {
		const css = input.document.hasCss ? input.document.css : "";

		const checks: RegExp[] = [
			/@media[^{]*prefers-color-scheme/,
			/@media[^{]*prefers-contrast/,
			// /@media[^{]*prefers-reduced-motion/, //this is an oppertunity
			/color-scheme\s*:([^{]*((light)|(dark))){2}/,
		];
		let result = 0;
		checks.map((searchString) => {
			debug.debug("Checks for: " + searchString);
			if (css.search(searchString) >= 0) result += 100;
		});

		return result / checks.length;
	}
}

export default new UserpreferencePlugin();
