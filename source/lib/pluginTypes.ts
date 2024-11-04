import type { CheerioAPI } from "cheerio";
import { z } from "zod";

export type PluginInput = {
	dom: CheerioAPI;
	css: string;
};

export interface IPlugin {
	readonly name: string;
	readonly version: string;
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
