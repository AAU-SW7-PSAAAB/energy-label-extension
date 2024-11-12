import {
	Requirements,
	requires,
	type IPlugin,
	type PluginInput,
} from "../lib/pluginTypes";

class VideoPlugin implements IPlugin {
	name = "Video";
	version = "0.0.1";
	requires = requires(Requirements.Document);
	async analyze(input: PluginInput): Promise<number> {
		const dom = input.document.dom;

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
