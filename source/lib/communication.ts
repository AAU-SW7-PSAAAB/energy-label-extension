import { z } from "zod";
import { statusCodeEnum } from "energy-label-types";
import { StorageKey } from "./StorageKey.ts";
import { scanState } from "./ScanState.ts";

export enum MessageLiterals {
	SiteLoaded = "SiteLoaded",
}

export type RequestDetails = browser.webRequest._OnBeforeRequestDetails &
	Partial<browser.webRequest._OnBeforeRedirectDetails> &
	Partial<browser.webRequest._OnCompletedDetails> &
	Partial<browser.webRequest._OnErrorOccurredDetails> &
	Partial<browser.webRequest._OnHeadersReceivedDetails>;

export const ResultSchema = z.object({
	name: z.string(),
	score: z.number(),
	status: statusCodeEnum,
});
export const ResultsSchema = z.array(ResultSchema);

export type Result = z.infer<typeof ResultSchema>;
export type Results = z.infer<typeof ResultsSchema>;

class Storage {
	/**
	 * The global scanning state of the plugin.
	 */
	scanState = scanState;
	/**
	 * A list of currently selected plugins.
	 */
	selectedPlugins = new StorageKey("SelectedPlugins", z.array(z.string()));
	/**
	 * The query selectors that decide which DOM content is collected.
	 */
	querySelectors = new StorageKey(
		"QuerySelectors",
		z.object({
			include: z.array(z.string()),
			exclude: z.array(z.string()),
		}),
	);
	/**
	 * Page content scanned by the content script, ready for analysis.
	 */
	pageContent = new StorageKey(
		"PageContent",
		z.object({
			dom: z.string(),
			css: z.string(),
		}),
	);
	/**
	 * Network information collected by the background script, ready for analysis.
	 */
	networkConnections = new StorageKey(
		"NetworkConnections",
		z.record(
			z.string(),
			// TODO: improve custom checker
			z.custom<RequestDetails>(() => true),
		),
	);
	/**
	 * The final results after analysis has completed.
	 */
	analysisResults = new StorageKey("AnalysisResults", ResultsSchema);
}
export const storage = new Storage();
