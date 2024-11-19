import { StatusCodes } from "energy-label-types";
import {
	requires,
	PluginError,
	type IPlugin,
	Requirements,
	PluginInput,
} from "../lib/pluginTypes";
import type { RequestDetails } from "../lib/communication";

class MinifiedPlugin implements IPlugin {
	name: string = "minify";
	version: string = "0.0.1";
	requires = requires(Requirements.Network);
	async analyze(input: PluginInput): Promise<number> {
		const network = input.network;

		const [trueCount, totalCount] = Object.keys(network)
			.filter((file) => file.slice(-2) === "js")
			.map((file) => network[file])
			.map(isMinified)
			.reduce(
				([trueCount, totalCount], minified) => [
					trueCount + (minified ? 1 : 0),
					totalCount + 1,
				],
				[0, 0],
			);

		return (trueCount / totalCount) * 100;
	}
}

function isMinified(request: RequestDetails): boolean {
	function checkData(object: any) {
		console.log(object);
		return true;
	}

	return (
		request.statusCode === 200 &&
		request.requestBody !== undefined &&
		request.requestBody.formData !== undefined &&
		checkData(request.requestBody.formData)
	);
}

export default new MinifiedPlugin();
