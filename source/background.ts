import * as cheerio from "cheerio";
import { detect } from "detect-browser";
import browser from "./lib/browser.ts";
import debug from "./lib/debug.ts";
import plugins from "./plugins.ts";
import {
	MessageLiterals,
	SendContentSchema,
	type Results,
} from "./lib/communication.ts";
import { type Run, Server, StatusCodes } from "../energy-label-types/index.ts";
import type { PluginInput } from "./lib/pluginTypes.ts";

import Config from "../extension-config.ts";
import packageFile from "../package.json" assert { type: "json" };

browser.runtime.onMessage.addListener(async (request) => {
	switch (request.action) {
		case MessageLiterals.SendContent: {
			const {
				success: requestSuccess,
				data: requestData,
				error: requestError,
			} = SendContentSchema.safeParse(request);
			if (!requestSuccess) {
				debug.warn(requestError);
				return;
			}

			const pluginInput: PluginInput = {
				dom: cheerio.load(requestData.content.dom),
			};

			// Run each plugin and continuously update results in local storage
			const results = await performAnalysis(
				requestData.selectedPluginNames,
				pluginInput,
			);

			// Send status report to server
			await sendReportToServer(results);

			break;
		}

		default: {
			console.log("Unknown request in background.ts", request);
			break;
		}
	}
});

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

				await browser.storage.local.set({ results: results });
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

	await server.call("/log", logs);
}

async function getCurrentTabUrl(): Promise<string | undefined> {
	const tabs = await browser.tabs.query({
		active: true,
		currentWindow: true,
	});
	const currentTab = tabs.length > 0 ? tabs[0] : undefined;

	return currentTab ? currentTab.url : undefined;
}
