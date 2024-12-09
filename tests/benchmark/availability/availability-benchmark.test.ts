import { test } from "../../e2e/fixtures";
import { getLinks } from "../linksHandler";

test.describe.configure({ retries: 2, timeout: 180000 });

// Create an array to store time differences
const links = ["lowes.com"] //getLinks(1000);

const failedLinks: string[] = [];

links.forEach((link) => {
	test(`Can analyze: ${link}`, async ({ page, extensionId }) => {
		test.skip(
			failedLinks.some((element) => element === link),
			`Skipping: Test previously failed on ${link}`,
		);

		// Goto link and open the extension popup
		try {
			await page.goto(`https://${link}`, { timeout: 15000 });
		} catch (e) {
			failedLinks.push(link);
			test.skip(true, "Could not load page: " + e);
		}

		const popup = await page.context().newPage();
		await popup.goto(`chrome-extension://${extensionId}/source/popup.html`);

		// Click the "Scan Now" button
		await popup.getByRole("button", { name: "Scan Now" }).click();

		// Create locator for the "Continue" button
		const continueButton = await popup.getByRole("button", {
			name: "Continue",
		});

		// Wait for the "Continue" button to be visible, with a timeout of 10 seconds
		try {
			await page.waitForLoadState("load", { timeout: 10000 });
			await page.waitForLoadState("networkidle", {
				timeout: 10000,
			});
		} catch (e) {
			console.log(`Failed to load: ${e}`);
		}
		await continueButton.waitFor({
			state: "visible",
			timeout: 100,
		});
		await continueButton.click();

		// Wait for the resultPiechart to appear
		const resultPieChart = popup.locator("#finished-pie");
		await resultPieChart.waitFor({ timeout: 180000 });
	});
});
