import type { IPlugin } from "../lib/pluginTypes";

class FailPlugin implements IPlugin {
	name = "Fail";
	version = "0.0.1";
	async analyze(): Promise<number> {
		throw new Error("This plugin always fails");
	}
}

export default new FailPlugin();
