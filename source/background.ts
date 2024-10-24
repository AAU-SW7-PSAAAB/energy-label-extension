import * as cheerio from "cheerio";
import browser from "./lib/browser";
import debug from "./lib/debug";
import plugins from "./plugins";
import {
	MessageLiterals,
	SendContentSchema,
	ResultsSchema,
	type Results,
} from "./lib/communication";

browser.runtime.onMessage.addListener(async (request) => {
	switch (request.action) {
		case MessageLiterals.SendContent: {
			const { success: requestSuccess, data: requestData, error: requestError } =
				SendContentSchema.safeParse(request);
			if (!requestSuccess) {
				debug.warn(requestError);
				return;
			}

			const $ = cheerio.load(requestData.content.dom);

			const results: Results = [];

			await Promise.all(
				plugins
					.filter((plugin) =>
						requestData.selectedPluginNames.includes(plugin.name),
					)
					.map(async (plugin) => {
						try {
							const score = Math.round(
								await plugin.analyze({ dom: $ }),
							);
							results.push({
								name: plugin.name,
								score: isNaN(score) ? -1 : score,
								success: true,
							});
						} catch {
							results.push({
								name: plugin.name,
								score: 0,
								success: false,
							});
						}
					}),
			);

			const { success: resultsSuccess, data: resultsData, error: resultsError } =
				ResultsSchema.safeParse(results);

			if (!resultsSuccess) {
				debug.warn(resultsError);
				return
			};

			await browser.storage.local.set({ results: resultsData });
			break;
		}

		default: {
			console.log("Unknown request in background.ts", request);
			break;
		}
	}
});
