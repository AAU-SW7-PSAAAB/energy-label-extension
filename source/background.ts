import * as cheerio from "cheerio";
import { detect } from "detect-browser";
import browser from "./lib/browser.ts";
import debug from "./lib/debug.ts";
import plugins from "./plugins.ts";
import { ScanStates, scanState } from "./lib/ScanState.ts";
import { MessageLiterals, storage } from "./lib/communication.ts";
import type { Results, RequestDetails, Result } from "./lib/communication.ts";
import { Server, StatusCodes } from "energy-label-types";
import type { Run } from "energy-label-types";
import {
	Document,
	PluginError,
	PluginInput,
	Requirements,
	type PluginResult,
} from "./lib/pluginTypes.ts";

import Config from "../extension-config.ts";
import packageFile from "../package.json" assert { type: "json" };

let networkResults: Record<string, RequestDetails> = {};

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
			networkResults = {};

			const [activeTab] = await browser.tabs.query({
				active: true,
				currentWindow: true,
			});

			if (!activeTab?.id) {
				debug.error("Could not start scanning, no tab id");
				return;
			}

			/* 
				Yes, this is disgusting.
				It is difficult to group them into a loop because of the different types.
			*/
			browser.webRequest.onBeforeRequest.addListener(collectRequestInfo, {
				urls: ["<all_urls>"],
				tabId: activeTab.id,
			});

			browser.webRequest.onBeforeRedirect.addListener(
				collectRequestInfo,
				{
					urls: ["<all_urls>"],
					tabId: activeTab.id,
				},
			);

			browser.webRequest.onCompleted.addListener(collectRequestInfo, {
				urls: ["<all_urls>"],
				tabId: activeTab.id,
			});

			browser.webRequest.onErrorOccurred.addListener(collectRequestInfo, {
				urls: ["<all_urls>"],
				tabId: activeTab.id,
			});

			browser.webRequest.onHeadersReceived.addListener(
				collectRequestInfo,
				{
					urls: ["<all_urls>"],
					tabId: activeTab.id,
				},
				["responseHeaders"],
			);

			// Not supported in Safari: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/browsingData/removeCache#browser_compatibility
			await browser.browsingData?.removeCache?.({});
			await browser.tabs.reload(activeTab.id);

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

			// Send status report to server
			await sendReportToServer(analysisResults);

			await scanState.set(ScanStates.ShowResult);
			break;
		}
	}
});
browser.runtime.onMessage.addListener(async (request) => {
	switch (request.action) {
		case MessageLiterals.SiteLoaded: {
			if (!(await scanState.is(ScanStates.LoadNetwork))) return;

			/* 
				Yes, this is disgusting.
			*/
			browser.webRequest.onBeforeRequest.removeListener(
				collectRequestInfo,
			);
			browser.webRequest.onBeforeRedirect.removeListener(
				collectRequestInfo,
			);
			browser.webRequest.onCompleted.removeListener(collectRequestInfo);
			browser.webRequest.onErrorOccurred.removeListener(
				collectRequestInfo,
			);
			browser.webRequest.onHeadersReceived.removeListener(
				collectRequestInfo,
			);

			await storage.networkRequests.set(networkResults);
			networkResults = {};
			await scanState.set(ScanStates.LoadNetworkFinished);
			break;
		}
	}
});

function collectRequestInfo(details: RequestDetails) {
	const existing = networkResults[details.url] || {};
	networkResults[details.url] = { ...existing, ...details };
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
	const { needPageContent, needNetwork } = await pluginNeeds();

	const pageContent = needPageContent
		? await storage.pageContent.get()
		: null;
	const networkRequests = needNetwork
		? await storage.networkRequests.get()
		: null;

	const pluginInput = new PluginInput({
		document: new Document({
			dom: pageContent?.dom ? cheerio.load(pageContent.dom) : undefined,
			css: pageContent?.css,
		}),
		network: networkRequests ?? undefined,
	});

	const results: Record<string, Result> = {};

	await Promise.all(
		plugins
			.filter((plugin) => pluginNames.includes(plugin.name))
			.map(async (plugin) => {
				try {
					await plugin.analyze(async (result: PluginResult) => {
						if (
							isNaN(result.progress) ||
							result.progress < 0 ||
							result.progress > 100
						) {
							debug.error("Plugin returned invalid progress");
							result.progress = 100;
						}
						for (const scoreContainer of [
							result,
							...result.checks,
						]) {
							scoreContainer.score = Math.round(
								scoreContainer.score,
							);

							const score = scoreContainer.score;
							if (isNaN(score) || score < 0 || score > 100) {
								throw new PluginError(
									StatusCodes.InvalidScore,
									"Plugin returned invalid score",
								);
							}
						}

						results[plugin.name] = {
							name: plugin.name,
							pluginResult: result,
							status: StatusCodes.Success,
						};
						await storage.analysisResults.set(
							Object.values(results),
						);
					}, pluginInput);
				} catch (e) {
					if (e instanceof PluginError) {
						results[plugin.name] = {
							name: plugin.name,
							pluginResult: {
								progress: 100,
								score: 0,
								checks: [],
							},
							status: e.statusCode,
							errorMessage: e.message,
						};
					} else {
						results[plugin.name] = {
							name: plugin.name,
							pluginResult: {
								progress: 100,
								score: 0,
								checks: [],
							},
							status: StatusCodes.FailureNotSpecified,
							errorMessage: (e as Error).message,
						};
					}
				}
				// Just in case something went wrong, we hard code the progress to 100% after the plugin has finished running
				results[plugin.name].pluginResult.progress = 100;
				await storage.analysisResults.set(Object.values(results));
			}),
	);

	return Object.values(results);
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
			score: result.pluginResult.score,
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
