import { StatusCodes } from "energy-label-types";
import { requires, PluginError, type IPlugin } from "../lib/pluginTypes";

class FailPlugin implements IPlugin {
	name = "Fail";
	version = "0.0.1";
	requires = requires();
	async analyze(): Promise<number> {
		throw new PluginError(StatusCodes.FailureNotSpecified);
	}
}

export default new FailPlugin();
