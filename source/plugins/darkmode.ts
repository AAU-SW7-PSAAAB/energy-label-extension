import debug from "../lib/debug";
import type { IPlugin, PluginInput } from "../lib/pluginTypes";

class DarkmodePlugin implements IPlugin {
	name = "Darkmode";
	version = "0.0.1";
	async analyze(input: PluginInput): Promise<number> {
		const css = input.css;
        const body = input.dom("body");
        debug.debug(css)
        debug.debug("tetstst")
        debug.debug(body)

        if(
            body.attr("data-dark-mode") ||
            css.search(/@media \(prefers-color-scheme: dark\)/) >= 0 ||
            css.search(/html\[dark\]/) >= 0 || //youtube
            css.search(/:root.dark/) >= 0 //svelte
        )
            return 1
		return 0
	}
}

export default new DarkmodePlugin();
