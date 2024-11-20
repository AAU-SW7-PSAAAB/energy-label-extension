import { test, expect } from "./fixtures";

test("can analyze example.com", async ({ page, extensionId }) => {
	// Goto example.com and open the extension popup
	await page.goto("https://example.com/");
	const popup = await page.context().newPage();
	await popup.goto(`chrome-extension://${extensionId}/source/popup.html`);

	// Click the "Scan Now" button
	await popup.getByRole("button", { name: "Scan Now" }).click();

	// Wait for the score to appear
	await popup.waitForSelector(".score");

	// Find format, find the next div, and find the h4 within that div
	const format = popup.locator(`details[data-check-name="Format - Images"]`);
	console.log("format", format);
	const formatScoreH4 = await format.locator("summary").textContent();
	console.log("score", formatScoreH4);

	// Assert that the score is 100
	expect(formatScoreH4).toBe("Format - Images - 100");
});
