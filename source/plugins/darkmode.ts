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
		if (numbers.length === 3) { //rgb
			//best way to calculate brightness acording to google
			brightness =
				numbers[0] * 0.2126 + numbers[1] * 0.7152 + numbers[2] * 0.0722;
		}
		else if(numbers.length === 4) {//rgba 
			const alphaBackground = css.search(/color-scheme: dark/) ? 0 : 255;
			const alpha = numbers[3]
			const red = (1-alpha) * alphaBackground + alpha * numbers[0]
			const green = (1-alpha) * alphaBackground + alpha * numbers[1]
			const blue = (1-alpha) * alphaBackground + alpha * numbers[1]
			brightness =
				(red * 0.2126 + green * 0.7152 + blue * 0.0722);
		}
		if (
			body.attr("data-dark-mode") ||
			css.search(/@media \(prefers-color-scheme: dark\)/) >= 0 || //Browser theme check rule
			css.search(/color-scheme: dark/) || //twitter
			css.search(/html\[dark\]/) >= 0 || //youtube
			css.search(/:root.dark/) >= 0 || //svelte
			brightness < 128 //dark by design websites
		) {
			debug.debug("test")
			debug.debug(css.search(/color-scheme/))
			return 100;
		}
		return 0;
	}
}

export default new DarkmodePlugin();
