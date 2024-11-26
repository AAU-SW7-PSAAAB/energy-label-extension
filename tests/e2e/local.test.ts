import { test, expect } from "./fixtures";

test("localhost works", async ({ page, extensionId, localhost }) => {
	// Goto example.com and open the extension popup
	await page.goto(`${localhost}/local`);
	const popup = await page.context().newPage();
	await popup.goto(`chrome-extension://${extensionId}/source/popup.html`);

	// Click the "Scan Now" button
	await popup.getByRole("button", { name: "Scan Now" }).click();

	// TODO: for more complicated tests, we need a timeout here

	// Click the "Continue" button
	await popup.getByRole("button", { name: "Continue" }).click();

	// Wait for the score to appear
	await popup.waitForSelector(".score");

	// Find format, find the next div, and find the h4 within that div
	const formatImages = popup.locator(
		`details[data-check-name="Format - Images"]`,
	);
	const formatImagesScoreSummary = await formatImages
		.locator("summary")
		.textContent();

	// Assert that the score is 100
	expect(formatImagesScoreSummary).toBe("Format - Images - 100");
});
