import type { CheerioAPI } from "cheerio";
import { z } from "zod";
import type { RequestDetails } from "./communication";

export type PluginInput = {
	dom?: CheerioAPI;
	css?: string;
	network?: Record<string, RequestDetails>;
};

export interface IPlugin {
	/**
	 * The plugin name.
	 */
	readonly name: string;
	/**
	 * Versioning of each individual plugin.
	 */
	readonly version: string;
	/**
	 * If true, means we need to scan the contents of the DOM
	 * and pass that information to this plugin.
	 */
	readonly requiresDocument: boolean;
	/**
	 * If true, means we need to reload and collect network
	 * information, then pass that information to this plugin.
	 */
	readonly requiresNetwork: boolean;
	/**
	 * The function that runs the analysis and returns a score.
	 */
	analyze(input: PluginInput): Promise<number>;
}

export const IPluginSchema = z.object({
	name: z.string(),
	version: z.string(),
	analyze: z
		.function()
		.args(z.object({ dom: z.function() }))
		.returns(z.promise(z.number())),
});
