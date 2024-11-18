import { test, expect } from "./fixtures";

test("example test", async ({ page }) => {
	await page.goto("https://www.ekstrabladet.dk");
	expect(await page.title()).toContain("Nyheder");
});

test("popup page", async ({ page, extensionId }) => {
	await page.goto(`chrome-extension://${extensionId}/source/popup.html`);
	await expect(page.locator("h1")).toHaveText("Green Machine");
});
