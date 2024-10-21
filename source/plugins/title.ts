import { IPlugin, PluginInput } from "./types.ts";

class TitlePlugin implements IPlugin {
	name = "Title";
	async analyze(input: PluginInput): Promise<number> {
		const title = input.dom("title").text();
		return title ? 100 : 0;
	}
}

export default new TitlePlugin();
