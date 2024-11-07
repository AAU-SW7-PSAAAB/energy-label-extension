import type { IPlugin, PluginInput } from "../lib/pluginTypes";

class MinifyPlugin implements IPlugin {
	name: string = "Minify";
	version: string = "0.0.1";
	requiresNetwork: boolean = true;
	requiresDocument: boolean = false;
	async analyze(input: PluginInput): Promise<number> {
	    return 1000;
	}
}


