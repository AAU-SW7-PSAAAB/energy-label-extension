/* Source: https://playwright.dev/docs/chrome-extensions */

import { test as base, chromium, type BrowserContext } from "@playwright/test";
import path from "path";

export const test = base.extend<{
	context: BrowserContext;
	extensionId: string;
}>({
	context: async (_, use) => {
		const pathToExtension = path.join(process.cwd(), "publish/chromium");
		const context = await chromium.launchPersistentContext("", {
			headless: false,
			args: [
				`--disable-extensions-except=${pathToExtension}`,
				`--load-extension=${pathToExtension}`,
			],
		});

		await use(context);
		await context.close();
	},
	extensionId: async ({ context }, use) => {
		let [background] = context.serviceWorkers();
		if (!background)
			background = await context.waitForEvent("serviceworker");

		const extensionId = background.url().split("/")[2];

		await use(extensionId);
	},
});

export const expect = test.expect;
