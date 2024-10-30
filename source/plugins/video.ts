import type { IPlugin, PluginInput } from "../lib/pluginTypes";

class VideoPlugin implements IPlugin {
	name = "Video";
	version = "0.0.1";
	async analyze(input: PluginInput): Promise<number> {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve(input.dom("video").length ? 100 : 0);
			}, 250);
		});
	}
}

export default new VideoPlugin();
