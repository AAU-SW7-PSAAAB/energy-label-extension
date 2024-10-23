import * as cheerio from "cheerio";
import browser from "./lib/browser";
import plugins from "./plugins";
import { MessageLiterals, isSendContent } from "./lib/communication";

browser.runtime.onMessage.addListener((request) => {
	switch (request.action) {
		case MessageLiterals.SendContent: {
			if (!isSendContent(request)) return;

			const $ = cheerio.load(request.data.dom);

			plugins.forEach(async (plugin) => {
				const grade = await plugin.analyze({ dom: $ });
				console.log(`Plugin '${plugin.name}' returned grade: ${grade}`);
			});

			break;
		}
	}
});
