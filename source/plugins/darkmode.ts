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
        // debug.debug(body)
        debug.debug(input.dom("[color-scheme]"))
        debug.debug(input.dom("[color-scheme]=dark"))
        debug.debug(getComputedStyle(document.documentElement).backgroundColor) //I think this gets expansion document
        debug.debug(input.dom("body").css("backgroundColor"))
        debug.debug(getComputedStyle(document.body).backgroundColor)
        // debug.debug(getComputedStyle(document.querySelector(':root'))["color-scheme"])//this gets "normal" instead of dark in extension?
        debug.debug(input.dom(':root'))
        debug.debug("nugårdethurtigt")
        debug.debug(getComputedStyle(input.dom("body").toArray()[0] as unknown as Element))
        if(
            body.attr("data-dark-mode") ||
            css.search(/@media \(prefers-color-scheme: dark\)/) >= 0 ||
            css.search(/html\[dark\]/) >= 0 || //youtube
            css.search(/:root.dark/) >= 0 ||//svelte
            css.search(/color-scheme: dark/) >= 0 || //twitter might not work - twitter uses auto...
            css.search(/color-scheme: auto/) >= 0 //twitter might not work - twitter uses auto...
        )
        {
            debug.debug(css.search(/@media \(prefers-color-scheme: dark\)/) >= 0)
            debug.debug(css.search(/html\[dark\]/) >= 0)
            debug.debug(css.search(/:root.dark/) >= 0)
            debug.debug(css.search(/color-scheme: dark/) >= 0)
            debug.debug(css.search(/color-scheme: auto/) >= 0)
            return 1
        }
		return 0
	}
}

export default new DarkmodePlugin();
