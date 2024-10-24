import type { IPlugin, PluginInput } from "../lib/pluginTypes";

class TitlePlugin implements IPlugin {
	name = "Title";
	async analyze(input: PluginInput): Promise<number> {
		return input.dom("title").text() ? 100 : 0;
	}
}

export default new TitlePlugin();
