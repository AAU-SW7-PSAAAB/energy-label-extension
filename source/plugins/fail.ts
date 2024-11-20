import { StatusCodes } from "energy-label-types";
import { requires, PluginError } from "../lib/pluginTypes";
import type { IPlugin } from "../lib/pluginTypes";

class FailPlugin implements IPlugin {
	name = "Fail";
	version = "0.0.1";
	devOnly = true;
	requires = requires();
	async analyze() {
		throw new PluginError(StatusCodes.TestRun, "This plugin always fails");
	}
}

export default new FailPlugin();
