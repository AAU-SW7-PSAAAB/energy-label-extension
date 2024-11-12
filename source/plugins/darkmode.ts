import debug from "../lib/debug";
import type { IPlugin, PluginInput } from "../lib/pluginTypes";
import { storage } from "../lib/communication";

class DarkmodePlugin implements IPlugin {
	name = "Darkmode";
	version = "0.0.1";
    requiresDocument = true;
	requiresNetwork = false;
	async analyze(input: PluginInput): Promise<number> {
		const css = input.css??  "";
        const dom = (await storage.pageContent.get())!.dom
        const parser = new DOMParser();
        const document = parser.parseFromString(dom, "text/html");
        const body = document.querySelector("body")
        if (body) {
            
            const numberstr: string[]  = body.style.background.match(/\d+/g)?? [""];
            let numbers = numberstr.map((number) => {return parseInt(number)})
            let brightness = 255
            if(numbers?.length){
                //best way to calculate brightness acording to google
                brightness = numbers[0] *0.2126 + numbers[1] * 0.7152 + numbers[2] * 0.0722
            }
            
            debug.debug(body.style.background)   
            debug.debug(css)       

            if(
                body.getAttribute("data-dark-mode") ||
                css.search(/@media \(prefers-color-scheme: dark\)/) >= 0 ||
                css.search(/html\[dark\]/) >= 0 || //youtube
                css.search(/:root.dark/) >= 0 ||//svelte
                brightness < 128
                
            )
            {
                debug.debug(css.search(/@media \(prefers-color-scheme: dark\)/) >= 0)
                debug.debug(css.search(/html\[dark\]/) >= 0)
                debug.debug(css.search(/:root.dark/) >= 0)
                return 100
            }
            return 0
        }
        else
            debug.error("Failed to load body dom")
        return -1
        
	}
}

export default new DarkmodePlugin();
