import { test, expect } from "./fixtures";

test("with no query selector it finds bad image", async ({
	page,
	extensionId,
	localhost,
}) => {
	// Goto format.html and open the extension popup
	await page.goto(`${localhost}/format`);
	const popup = await page.context().newPage();
	await popup.goto(`chrome-extension://${extensionId}/source/popup.html`);

	// Click the "Scan Now" button
	await popup.getByRole("button", { name: "Scan Now" }).click();

	await page.waitForTimeout(1000); // Wait for the resource to load

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

test("query selector exclude img, it does not find bad image", async ({
	page,
	extensionId,
	localhost,
}) => {
	// Goto format.html and open the extension popup
	await page.goto(`${localhost}/format`);
	const popup = await page.context().newPage();
	await popup.goto(`chrome-extension://${extensionId}/source/popup.html`);

	// Go to DOM Selection
	await popup.getByRole("button", { name: "DOM Selection" }).click();

	// Select specify target
	await popup.getByText("Specify Target").click();

	// Click plus
	await popup.getByLabel("Add").click();

	// Select exclude
	await popup.getByText("Exclude", { exact: true }).click();

	// Fill input with img
	await popup.getByPlaceholder(".my-image-class").fill("img");

	// Click the "Scan Now" button
	await popup.getByRole("button", { name: "Scan Now" }).click();

	await page.waitForTimeout(1000); // Wait for the resource to load

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
	expect(formatImagesScoreSummary).toBe("Format - Images - 100");
});
