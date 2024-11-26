import { ResultType } from "../lib/pluginTypes";
import type {
	IPlugin,
	PluginResult,
	PluginResultSink,
} from "../lib/pluginTypes";

class LongPlugin implements IPlugin {
	name = "Long";
	version = "0.0.1";
	devOnly = true;
	requires = [];
	analyze(sink: PluginResultSink): Promise<void> {
		return new Promise((resolve) => {
			let seconds = 1;
			const result: PluginResult = {
				progress: 0,
				score: 100,
				description: "This plugin takes ten seconds to complete.",
				checks: [
					{
						score: 100,
						type: ResultType.Requirement,
						name: "Counting seconds",
						description:
							"You are going to spend 0.000000008% of your entire life waiting for this to finish.",
						table: [
							[
								"Where did he come from",
								"Where did he go",
								"Where did he come from",
								"Cotton-Eyed Joe",
							],
						],
					},
				],
			};
			sink(result);

			setTimeout(newSecond, 1000);
			async function newSecond() {
				result.progress = 10 * seconds;
				result.checks[0]!.table![seconds] = [
					seconds - 1,
					seconds,
					seconds - 1,
					"Cotton-Eyed Joe",
				];
				await sink(result);
				seconds++;
				if (seconds <= 10) {
					setTimeout(newSecond, 1000);
				} else {
					resolve();
				}
			}
		});
	}
}

export default new LongPlugin();
