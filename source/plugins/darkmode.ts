import debug from "../lib/debug";
import {
	Requirements,
	requires,
	type IPlugin,
	type PluginInput,
} from "../lib/pluginTypes";

class DarkmodePlugin implements IPlugin {
	name = "Darkmode";
	version = "0.0.1";
	requires = requires(Requirements.Document);
	async analyze(input: PluginInput): Promise<number> {
		const css = input.document.hasCss ? input.document.css : "";
		const dom = input.document.dom;

		const body = dom("body");
		const numberstr: string[] = body.css("background")?.match(/\d+/g) ?? [
			"",
		]; // "rgb(112,24,0)" -> ["112", "24", "0"]
		const numbers = numberstr.map((number) => {
			return parseInt(number);
		});
		let brightness = 255; //Default brightness to white incase background is not defined
		if (numbers?.length) {
			//best way to calculate brightness acording to google
			brightness =
				numbers[0] * 0.2126 + numbers[1] * 0.7152 + numbers[2] * 0.0722;
		}

		if (
			body.attr("data-dark-mode") ||
			css.search(/@media \(prefers-color-scheme: dark\)/) >= 0 || //Browser theme check rule
			css.search(/html\[dark\]/) >= 0 || //youtube
			css.search(/:root.dark/) >= 0 || //svelte
			brightness < 128 //dark by design websites
		) {
			debug.debug(
				css.search(/@media \(prefers-color-scheme: dark\)/) >= 0,
			);
			debug.debug(css.search(/html\[dark\]/) >= 0);
			debug.debug(css.search(/:root.dark/) >= 0);
			return 100;
		}
		return 0;
	}
}

export default new DarkmodePlugin();
