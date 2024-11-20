import type { CheerioAPI } from "cheerio";
import { z } from "zod";
import type { RequestDetails } from "./communication";
import { StatusCodes } from "energy-label-types";

export class Document {
	#dom?: CheerioAPI;
	#css?: string;

	constructor(data: { dom?: CheerioAPI; css?: string }) {
		this.#css = data.css;
		this.#dom = data.dom;
	}

	/**
	 * Get the dom
	 * */
	get dom(): CheerioAPI {
		if (this.#dom === undefined)
			throw new PluginError(StatusCodes.NoDom, "No dom object");
		return this.#dom;
	}

	/**
	 * Returns true if there is a dom object
	 * */
	get hasDom(): boolean {
		return this.#dom !== undefined;
	}

	/**
	 * Get the css
	 * */
	get css(): string {
		if (this.#css === undefined)
			throw new PluginError(StatusCodes.NoCss, "No css object");
		return this.#css;
	}

	/**
	 * Returns true if there is a css object
	 * */
	get hasCss(): boolean {
		return this.#css !== undefined;
	}
}

export type Network = Record<string, RequestDetails>;

export class PluginInput {
	#document?: Document;
	#network?: Network;
	constructor(data: { document?: Document; network?: Network }) {
		this.#document = data.document;
		this.#network = data.network;
	}

	/**
	 * Get the document
	 * */
	get document(): Document {
		if (this.#document === undefined)
			throw new PluginError(
				StatusCodes.NoDocument,
				"No document obeject",
			);
		return this.#document;
	}

	/**
	 * Returns true if there is a document
	 * */
	get hasDocument(): boolean {
		return this.#document !== undefined;
	}

	/**
	 * Get the network
	 * */
	get network(): Network {
		if (this.#network === undefined)
			throw new PluginError(StatusCodes.NoNetwork, "No network object");
		return this.#network;
	}

	/**
	 * Returns true if there is network
	 * */
	get hasNetwork(): boolean {
		return this.#network !== undefined;
	}
}

/**
 * Requremetns enum
 *
 * */
export enum Requirements {
	/**
	 * The plugin requires access to the dom and css
	 * */
	Document,

	/**
	 * The plugin requires access to the network requrests
	 * */
	Network,
}

/**
 * Set the requirements of a plugin
 * The requirements can be
 * */
export function requires(...requirements: Array<Requirements>) {
	return new Set(requirements);
}

export enum ResultType {
	Requirement = "Requirement",
	Opportunity = "Opportunity",
}

export const PluginCheckSchema = z.object({
	type: z.nativeEnum(ResultType),
	name: z.string(),
	score: z.number(),
	description: z.string().optional(),
	table: z.array(z.array(z.union([z.string(), z.number()]))).optional(),
});
export const PluginResultSchema = z.object({
	progress: z.number(),
	score: z.number(),
	description: z.string().optional(),
	checks: z.array(PluginCheckSchema),
});
export type PluginCheck = z.infer<typeof PluginCheckSchema>;
export type PluginResult = z.infer<typeof PluginResultSchema>;

export type PluginResultSink = (result: PluginResult) => Promise<void>;

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
	 * If true, means the plugin is for testing purposes
	 * and will not be included in a production build.
	 */
	readonly devOnly?: boolean;
	/**
	 * If true, means we need to scan the contents of the DOM
	 * and pass that information to this plugin.
	 */
	readonly requires: Set<Requirements>;
	/**
	 * The function that runs the analysis and returns a Run.
	 */
	analyze(sink: PluginResultSink, input: PluginInput): Promise<void>;
}

export const IPluginSchema = z.object({
	name: z.string(),
	version: z.string(),
	analyze: z
		.function()
		.args(z.object({ dom: z.function() }))
		.returns(z.promise(z.number())),
});

export class PluginError {
	statusCode: StatusCodes;
	message?: string;
	constructor(code: StatusCodes, message?: string) {
		this.statusCode = code;
		this.message = message;
	}
}
