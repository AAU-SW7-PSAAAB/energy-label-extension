import type {
	IPlugin,
	PluginResult,
	PluginResultSink,
} from "../lib/pluginTypes";

class NeverPlugin implements IPlugin {
	name = "Never";
	version = "0.0.1";
	devOnly = true;
	requires = [];
	analyze(sink: PluginResultSink): Promise<void> {
		return new Promise(() => {
			const result: PluginResult = {
				progress: 10,
				score: 50,
				description: "This plugin will never complete",
				checks: [],
			};
			sink(result);
		});
	}
}

export default new NeverPlugin();
