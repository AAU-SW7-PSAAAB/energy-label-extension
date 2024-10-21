import * as cheerio from "cheerio";
import browser from "./lib/browser.ts";
import plugins from "./plugins.ts";

browser.runtime.onMessage.addListener((message) => {
	const $ = cheerio.load(message.data);

	plugins.forEach(async (plugin) => {
		const grade = await plugin.analyze({ dom: $ });
		console.log(`Plugin '${plugin.name}' returned grade: ${grade}`);
	});
});
