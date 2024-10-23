import { IPlugin, PluginInput } from "./types";

class TitlePlugin implements IPlugin {
	name = "Title 3";
	async analyze(input: PluginInput): Promise<number> {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve(input.dom("title").text() ? 100 : 0);
			}, 5000);
		});
	}
}

export default new TitlePlugin();
