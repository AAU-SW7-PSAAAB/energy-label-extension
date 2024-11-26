import { Requirements, ResultType } from "../lib/pluginTypes";
import type {
	IPlugin,
	PluginInput,
	PluginResultSink,
} from "../lib/pluginTypes";

class TitlePlugin implements IPlugin {
	name = "Title";
	version = "0.0.1";
	devOnly = true;
	requires = [Requirements.Document];
	async analyze(sink: PluginResultSink, input: PluginInput) {
		const dom = input.document.dom;
		const score = dom("title").text() ? 100 : 0;
		await sink({
			progress: 100,
			score,
			description: "This plugin checks if there is a title set.",
			checks: [
				{
					name: "Title",
					type: ResultType.Requirement,
					description: score
						? "You have a <title> element set correctly."
						: "You need to add a <title> element to the page head.",
					score,
				},
			],
		});
	}
}

export default new TitlePlugin();
