import debug from "../lib/debug";
import type { IPlugin, PluginInput } from "../lib/pluginTypes";

class TitlePlugin implements IPlugin {
	name = "Title";
	version = "0.0.1";
	requiresDocument = true;
	requiresNetwork = false;
	async analyze(input: PluginInput): Promise<number> {
		const dom = input.dom;
		if (!dom) {
			debug.error("Need access to DOM content to function");
			return 0;
		}
		return dom("title").text() ? 100 : 0;
	}
}

export default new TitlePlugin();
