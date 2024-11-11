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
			throw new PluginError(StatusCodes.FailureNotSpecified);
		return this.#dom;
	}

	/**
	 * Get the css
	 * */
	get css(): string {
		if (this.#css === undefined)
			throw new PluginError(StatusCodes.FailureNotSpecified);
		return this.#css;
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
			throw new PluginError(StatusCodes.FailureNotSpecified);
		return this.#document;
	}

	/**
	 * Get the network
	 * */
	get network(): Network {
		if (this.#network === undefined)
			throw new PluginError(StatusCodes.FailureNotSpecified);
		return this.#network;
	}
}

const defaultRequires = {
	document: false,
	network: false,
};

/**
 * Set the requirements of a plugin
 * The requirements can be
 *  - document
 *  - network
 * */
export function requires(...requirements: Array<keyof typeof defaultRequires>) {
	const requires = { ...defaultRequires };
	for (const requrement of requirements) {
		requires[requrement] = true;
	}

	return requires;
}

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
	readonly requires: typeof defaultRequires;
	/**
	 * The function that runs the analysis and returns a Run.
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

export class PluginError {
	statusCode: StatusCodes;
	constructor(code: StatusCodes) {
		this.statusCode = code;
	}
}
