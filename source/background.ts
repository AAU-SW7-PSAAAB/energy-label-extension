import * as cheerio from "cheerio";
import { detect } from "detect-browser";
import browser from "./lib/browser.ts";
import debug from "./lib/debug.ts";
import plugins from "./plugins.ts";
import { ScanStates, scanState } from "./lib/ScanState.ts";
import { MessageLiterals, storage } from "./lib/communication.ts";
import type { Results, RequestDetails } from "./lib/communication.ts";
import { Server, StatusCodes } from "energy-label-types";
import type { Run } from "energy-label-types";
import type { PluginInput } from "./lib/pluginTypes.ts";

import Config from "../extension-config.ts";
import packageFile from "../package.json" assert { type: "json" };

/**
 * The names of the listeners that are used to collect network information.
 */
const listeners: Array<keyof typeof browser.webRequest>= [
	"onBeforeRequest",
	"onBeforeRedirect",
	"onCompleted",
	"onErrorOccurred",
];

let results: Record<string, RequestDetails> = {};

scanState.initAndUpdate(async (state: ScanStates) => {
	switch (state) {
		case ScanStates.LoadNetwork: {
			results = {};
			const [activeTab] = await browser.tabs.query({
				active: true,
				currentWindow: true,
			});

			for (const listener of listeners) {
				(
					browser.webRequest[
						listener
					] as browser.webRequest._WebRequestOnBeforeRequestEvent
				).addListener(collectRequestInfo, {
					urls: ["<all_urls>"],
					tabId: activeTab.id!,
				});
			}

			browser.tabs.reload(activeTab.id!);

			break;
		}
		case ScanStates.Analyze: {
			const pluginInput: PluginInput = {
				dom: cheerio.load((await storage.pageContent.get())!.dom),
			};

			// Run each plugin and continuously update results in local storage
			const results = await performAnalysis(
				(await storage.selectedPlugins.get())!,
				pluginInput,
			);

			await storage.analysisResults.set(results);

			// Send status report to server
			await sendReportToServer(results);

			await scanState.set(ScanStates.Idle);
			break;
		}
	}
});
browser.runtime.onMessage.addListener(async (request) => {
	switch (request.action) {
		case MessageLiterals.SiteLoaded: {
			if (!(await scanState.is(ScanStates.LoadNetwork))) return;
			for (const listener of listeners) {
				(
					browser.webRequest[
						listener
					] as browser.webRequest._WebRequestOnBeforeRequestEvent
				).removeListener(collectRequestInfo);
			}
			await storage.networkConnections.set(results);
			results = {};
			await scanState.set(ScanStates.LoadNetworkFinished);
			break;
		}
	}
});

function collectRequestInfo(details: RequestDetails) {
	const existing = results[details.requestId] || {};
	results[details.requestId] = { ...existing, ...details };
}

async function performAnalysis(
	pluginNames: string[],
	pluginInput: PluginInput,
): Promise<Results> {
	const results: Results = [];

	await Promise.all(
		plugins
			.filter((plugin) => pluginNames.includes(plugin.name))
			.map(async (plugin) => {
				try {
					const score = Math.round(await plugin.analyze(pluginInput));

					results.push({
						name: plugin.name,
						score: isNaN(score) ? -1 : score,
						status: StatusCodes.Success,
					});
				} catch {
					results.push({
						name: plugin.name,
						score: 0,
						status: StatusCodes.FailureNotSpecified,
					});
				}
			}),
	);

	return results;
}

async function sendReportToServer(results: Results) {
	const server = new Server(Config.serverAddress);

	const browserProperties = detect();
	const urlString = await getCurrentTabUrl();

	if (!urlString || !browserProperties) {
		debug.warn("Warning: Unable to get required information for log");
	}

	const url = urlString ? new URL(urlString) : undefined;
	const logs: Run[] = [];

	for (const result of results) {
		const plugin = plugins.find((plugin) => plugin.name == result.name);

		if (!plugin) continue; // Provide feedback to frontend

		logs.push({
			score: result.score,
			statusCode: result.status,
			browserName: browserProperties?.name ?? "unknown",
			browserVersion: browserProperties?.version ?? "unknown",
			pluginName: result.name,
			pluginVersion: plugin.version,
			extensionVersion: packageFile.version,
			url: url ? url.hostname : "unknown",
			path: url ? url.pathname : "unknown",
		});
	}

	try {
		await server.call("/log", logs);
	} catch {
		debug.debug("Failed to send logs");
	}
}

async function getCurrentTabUrl(): Promise<string | undefined> {
	const tabs = await browser.tabs.query({
		active: true,
		currentWindow: true,
	});
	const currentTab = tabs.length > 0 ? tabs[0] : undefined;

	return currentTab ? currentTab.url : undefined;
}
