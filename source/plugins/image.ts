import type { IPlugin, PluginInput } from "../lib/pluginTypes";

class ImagePlugin implements IPlugin {
	name = "Image";
	async analyze(input: PluginInput): Promise<number> {
		const images = input.dom("img");

		if (images.length === 0) return 0;

		const avif = images.filter((_, e) => {
			const src = input.dom(e).attr("src");
			if (!src) return false;
			return src.includes(".avif");
		});

		return (avif.length / images.length) * 100;
	}
}

export default new ImagePlugin();
