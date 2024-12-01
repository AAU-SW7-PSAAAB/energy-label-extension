import { test, expect } from "./fixtures";

test("format works", async ({ page, extensionId, localhost }) => {
	// Goto format.html and open the extension popup
	await page.goto(`${localhost}/format`);
	const popup = await page.context().newPage();
	await popup.goto(`chrome-extension://${extensionId}/source/popup.html`);

	// Click the "Scan Now" button
	await popup.getByRole("button", { name: "Scan Now" }).click();

	// Wait for the resource to load
	await page.waitForTimeout(5000);

	// Click the "Continue" button
	await popup.getByRole("button", { name: "Continue" }).click();

	// Wait for the score to appear
	await popup.waitForSelector("#finished-pie");

	// Find format, find the next div, and find the h4 within that div
	const formatImages = popup.locator(
		`details[data-check-name="Format - Images"]`,
	);
	const formatImagesScoreSummary = await formatImages
		.locator("summary")
		.textContent();

	// Assert that the score is 25
	expect(formatImagesScoreSummary).toBe("Format - Images - 25");
});
