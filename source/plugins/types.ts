import { CheerioAPI } from "cheerio";

export type PluginInput = {
	dom: CheerioAPI;
};

export interface IPlugin {
	readonly name: string;
	analyze(input: PluginInput): Promise<number>;
}
