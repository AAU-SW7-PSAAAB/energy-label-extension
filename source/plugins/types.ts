import type { CheerioAPI } from "cheerio";
import { z } from "zod";

export type PluginInput = {
	dom: CheerioAPI;
};

export interface IPlugin {
	readonly name: string;
	analyze(input: PluginInput): Promise<number>;
}

export const IPluginSchema = z.object({
	name: z.string(),
	analyze: z
		.function()
		.args(z.object({ dom: z.function() }))
		.returns(z.promise(z.number())),
});
