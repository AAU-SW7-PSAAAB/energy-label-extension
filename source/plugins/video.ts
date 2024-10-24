import type { IPlugin, PluginInput } from "./types";

class VideoPlugin implements IPlugin {
	name = "Video";
	async analyze(input: PluginInput): Promise<number> {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve(input.dom("video").length ? 100 : 0);
			}, 250);
		});
	}
}

export default new VideoPlugin();
