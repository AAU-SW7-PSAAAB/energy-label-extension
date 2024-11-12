import debug from "../lib/debug";
import type { IPlugin, PluginInput } from "../lib/pluginTypes";

class ImagePlugin implements IPlugin {
	name = "Image";
	version = "0.0.1";
	requiresDocument = true;
	requiresNetwork = false;
	async analyze(input: PluginInput): Promise<number> {
		const dom = input.dom;
		if (!dom) {
			debug.error("Need access to DOM content to function");
			return 0;
		}
		const images = dom("img");

		if (images.length === 0) return 0;

		const avif = images.filter((_, e) => {
			const src = dom(e).attr("src");
			if (!src) return false;
			return src.includes(".avif");
		});

		return (avif.length / images.length) * 100;
	}
}

export default new ImagePlugin();
