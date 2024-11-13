import {
	Requirements,
	requires,
	type IPlugin,
	type PluginInput,
} from "../lib/pluginTypes";

class TitlePlugin implements IPlugin {
	name = "Title";
	version = "0.0.1";
	requires = requires(Requirements.Document);
	async analyze(input: PluginInput): Promise<number> {
		const dom = input.document.dom;
		return dom("title").text() ? 100 : 0;
	}
}

export default new TitlePlugin();
