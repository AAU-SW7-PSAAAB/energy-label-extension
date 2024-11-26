import { test, expect } from "./fixtures";

const pluginCount = 3;

test("all plugins by default", async ({ page, extensionId, localhost }) => {
	// Goto local.html and open the extension popup
	await page.goto(`${localhost}/local`);
	const popup = await page.context().newPage();
	await popup.goto(`chrome-extension://${extensionId}/source/popup.html`);

	// Find all input type="checkbox"
	const checkboxes = popup.locator("input[type='checkbox']");

	// Expect all checkboxes to be checked
	expect(await checkboxes.count()).toBe(pluginCount);
	for (const checkbox of await checkboxes.all()) {
		expect(checkbox).toBeChecked();
	}

	// Click the "Scan Now" button
	await popup.getByRole("button", { name: "Scan Now" }).click();

	// Click the "Continue" button
	await popup.getByRole("button", { name: "Continue" }).click();

	// Wait for the score to appear
	await popup.waitForSelector("#finished-pie");

	// Click on the text "Sort by plugin"
	await popup.getByText("Sort by plugin").click();
	const pluginHeaders = popup.locator("h3.container-header");

	// Expect all plugin headers to be present
	expect(await pluginHeaders.count()).toBe(pluginCount);
});

test("deselect all plugins but 1", async ({ page, extensionId, localhost }) => {
	// Goto local.html and open the extension popup
	await page.goto(`${localhost}/local`);
	const popup = await page.context().newPage();
	await popup.goto(`chrome-extension://${extensionId}/source/popup.html`);

	// Find all input type="checkbox"
	const checkboxes = popup.locator("input[type='checkbox']");

	// Expect all checkboxes to be checked
	expect(await checkboxes.count()).toBe(pluginCount);
	for (const checkbox of await checkboxes.all()) {
		expect(checkbox).toBeChecked();
	}

	// Uncheck all but the last checkbox
	for (let i = 0; i < pluginCount - 1; i++) {
		await checkboxes.nth(i).uncheck();
	}

	// Expect the last checkbox to be checked, and the others to be unchecked
	for (let i = 0; i < pluginCount; i++) {
		if (i === pluginCount - 1) {
			expect(checkboxes.nth(i)).toBeChecked();
		} else {
			expect(checkboxes.nth(i)).not.toBeChecked();
		}
	}

	// Click the "Scan Now" button
	await popup.getByRole("button", { name: "Scan Now" }).click();

	// Click the "Continue" button - if it exists
	const continueButton = popup.getByRole("button", {
		name: "Continue",
	});
	if ((await continueButton.count()) > 0) continueButton.click();

	// Wait for the score to appear
	await popup.waitForSelector("#finished-pie");

	// Click on the text "Sort by plugin"
	await popup.getByText("Sort by plugin").click();
	const pluginHeaders = popup.locator("h3.container-header");

	// Expect 1 plugin header to be present
	expect(await pluginHeaders.count()).toBe(1);
});
