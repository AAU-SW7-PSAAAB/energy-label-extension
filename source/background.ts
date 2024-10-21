import browser from "./lib/browser.ts";
import * as cheerio from "cheerio";
import plugins from "./plugins.ts";

browser.runtime.onMessage.addListener((request) => {
	const $ = cheerio.load(request.data);

	plugins.forEach(async (plugin) => {
		const grade = await plugin.analyze({ dom: $ });
		console.log(`Plugin '${plugin.name}' returned grade: ${grade}`);
	});
});
