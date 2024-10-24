import * as cheerio from "cheerio";
import browser from "./lib/browser";
import plugins from "./plugins";
import {
	MessageLiterals,
	SendContentSchema,
	type Results,
} from "./lib/communication";

browser.runtime.onMessage.addListener(async (request) => {
	switch (request.action) {
		case MessageLiterals.SendContent: {
			const { success, data } = SendContentSchema.safeParse(request);
			if (!success) return;

			const $ = cheerio.load(data.content.dom);
			const results: Results = [];

			await Promise.all(
				plugins
					.filter((plugin) =>
						data.selectedPluginNames.includes(plugin.name),
					)
					.map(async (plugin) => {
						try {
							const score = Math.round(
								await plugin.analyze({ dom: $ }),
							);
							results.push({
								name: plugin.name,
								score,
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

			await browser.storage.local.set({ results });

			break;
		}

		default: {
			console.log("Unknown request in background.ts", request);
			break;
		}
	}
});
