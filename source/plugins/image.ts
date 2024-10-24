import type { IPlugin, PluginInput } from "./types";

class ImagePlugin implements IPlugin {
	name = "Image";
	async analyze(input: PluginInput): Promise<number> {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve(input.dom("img").length ? 100 : 0);
			}, 500);
		});
	}
}

export default new ImagePlugin();
