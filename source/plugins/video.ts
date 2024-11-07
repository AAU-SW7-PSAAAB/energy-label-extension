import debug from "../lib/debug";
import type { IPlugin, PluginInput } from "../lib/pluginTypes";

class VideoPlugin implements IPlugin {
	name = "Video";
	version = "0.0.1";
	requiresDocument = true;
	requiresNetwork = false;
	async analyze(input: PluginInput): Promise<number> {
		const dom = input.dom;
		if (!dom) {
			debug.error("Need access to DOM content to function");
			return 0;
		}
		return new Promise((resolve) => {
			setTimeout(
				(dom) => {
					resolve(dom("video").length ? 100 : 0);
				},
				250,
				dom,
			);
		});
	}
}

export default new VideoPlugin();
