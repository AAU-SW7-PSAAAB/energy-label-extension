import debug from "../lib/debug";
import { requires, type IPlugin, type PluginInput } from "../lib/pluginTypes";

class MinifyPlugin implements IPlugin {
	name: string = "Minify";
	version: string = "0.0.1";
	requires = requires("network");
	async analyze(input: PluginInput): Promise<number> {
		const network = input.network;

		Object.keys(network).forEach(debug.debug);

		return 100;
	}
}

export default new MinifyPlugin();
