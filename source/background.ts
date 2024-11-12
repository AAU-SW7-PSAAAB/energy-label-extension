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
import {
	Document,
	PluginError,
	PluginInput,
	Requirements,
} from "./lib/pluginTypes.ts";

import Config from "../extension-config.ts";
import packageFile from "../package.json" assert { type: "json" };

/**
 * The names of the listeners that are used to collect network information.
 */
const listeners: Array<keyof typeof browser.webRequest> = [
	"onBeforeRequest",
	"onBeforeRedirect",
	"onCompleted",
	"onErrorOccurred",
];

let results: Record<string, RequestDetails> = {};

scanState.initAndUpdate(async (state: ScanStates) => {
	switch (state) {
		case ScanStates.BeginLoad: {
			const { needNetwork, needPageContent } = await pluginNeeds();
			if (needNetwork) {
				await scanState.set(ScanStates.LoadNetwork);
				break;
			}
			if (needPageContent) {
				await scanState.set(ScanStates.LoadContent);
				break;
			}
			break;
		}
		case ScanStates.LoadNetwork: {
			results = {};
			const [activeTab] = await browser.tabs.query({
				active: true,
				currentWindow: true,
			});

			if (!activeTab?.id) {
				debug.error("Could not start scanning, no tab id");
				return;
			}

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

			browser.tabs.reload(activeTab.id);

			break;
		}
		case ScanStates.LoadNetworkFinished: {
			const { needPageContent } = await pluginNeeds();
			await scanState.set(
				needPageContent ? ScanStates.LoadContent : ScanStates.Analyze,
			);
			break;
		}
		case ScanStates.LoadContentFinished: {
			await scanState.set(ScanStates.Analyze);
			break;
		}
		case ScanStates.Analyze: {
			const pluginNames = await storage.selectedPlugins.get();
			if (!pluginNames) {
				debug.error("Could not start analyzing, no selected plugins");
				return;
			}

			// Run each plugin and continuously update results in local storage
			const analysisResults = await performAnalysis(pluginNames);

			await storage.analysisResults.set(analysisResults);

			// Send status report to server
			await sendReportToServer(analysisResults);

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

async function pluginNeeds(): Promise<{
	needPageContent: boolean;
	needNetwork: boolean;
}> {
	const pluginNames = await storage.selectedPlugins.get();
	if (!pluginNames) {
		debug.error(
			"Could not check plugin needs, no selected plugins were defined",
		);
		return { needPageContent: true, needNetwork: true };
	}
	const selectedPlugins = plugins.filter((plugin) =>
		pluginNames.includes(plugin.name),
	);

	const requirements = selectedPlugins
		.map((p) => p.requires)
		.reduce((a, b) => a.union(b), new Set());

	const needPageContent = requirements.has(Requirements.Document);
	const needNetwork = requirements.has(Requirements.Network);

	return { needPageContent, needNetwork };
}

async function performAnalysis(pluginNames: string[]): Promise<Results> {
	const selectedPlugins = plugins.filter((plugin) =>
		pluginNames.includes(plugin.name),
	);

	const { needPageContent, needNetwork } = await pluginNeeds();

	const pageContent = needPageContent
		? await storage.pageContent.get()
		: null;
	const networkConnections = needNetwork
		? await storage.networkConnections.get()
		: null;
	const pluginInput = new PluginInput({
		document: new Document({
			dom: pageContent?.dom ? cheerio.load(pageContent.dom) : undefined,
			css: pageContent?.css,
		}),
		network: networkConnections ? networkConnections : undefined,
	});

	const results: Results = [];

	await Promise.all(
		selectedPlugins
			.filter((plugin) => pluginNames.includes(plugin.name))
			.map(async (plugin) => {
				try {
					const score = Math.round(await plugin.analyze(pluginInput));

					results.push({
						name: plugin.name,
						score: isNaN(score) ? -1 : score,
						status: StatusCodes.Success,
					});
				} catch (e) {
					if (e instanceof PluginError) {
						results.push({
							name: plugin.name,
							score: 0,
							status: e.statusCode,
							errorMessage: e.message,
						});
					} else {
						results.push({
							name: plugin.name,
							score: 0,
							status: StatusCodes.FailureNotSpecified,
							errorMessage: (e as Error).message,
						});
					}
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
			errorMessage: result.errorMessage,
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
