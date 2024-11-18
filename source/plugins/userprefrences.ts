import debug from "../lib/debug";
import {
	Requirements,
	requires,
	type IPlugin,
	type PluginInput,
} from "../lib/pluginTypes";

class UserprefrencePlugin implements IPlugin {
	name = "Darkmode";
	version = "1.0.0";
	requires = requires(Requirements.Document);
	async analyze(input: PluginInput): Promise<number> {
		const css = input.document.hasCss ? input.document.css : "";

		const checks: RegExp[] = [
			/@media[^{]*prefers-color-scheme/,
			/@media[^{]*prefers-contrast/,
			/@media[^{]*prefers-reduced-motion/,
		];
		let result = 0;
		debug.debug(css.includes("@media (prefers-color-scheme:"))
		checks.map((searchString) => {
			debug.debug("Checks for: " + searchString);
			if (css.search(searchString) >= 0) result += 100;
		});

		return result / checks.length;
	}
}

export default new UserprefrencePlugin();
