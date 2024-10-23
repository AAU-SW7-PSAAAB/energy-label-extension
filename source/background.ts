import * as cheerio from "cheerio";
import browser from "./lib/browser";
import plugins from "./plugins";
import {
	MessageLiterals,
	SendContentSchema,
	SendResult,
} from "./lib/communication";

browser.runtime.onMessage.addListener(async (request) => {
	switch (request.action) {
		case MessageLiterals.SendContent: {
			const parsed = SendContentSchema.safeParse(request);
			if (!parsed.success) return;

			const $ = cheerio.load(parsed.data.content.dom);

			const results = new Map<string, number>();

			const pluginPromises = plugins.map(async (plugin) => {
				try {
					const result = await plugin.analyze({ dom: $ });
					results.set(plugin.name, result);
				} catch {
					results.set(plugin.name, 0);
				}
			});

			await Promise.all(pluginPromises);

			const message: SendResult = {
				action: MessageLiterals.SendResult,
				grades: results,
			};

			browser.runtime.sendMessage(message);

			break;
		}

		default: {
			console.log("Unknown request", request);
			break;
		}
	}
});
