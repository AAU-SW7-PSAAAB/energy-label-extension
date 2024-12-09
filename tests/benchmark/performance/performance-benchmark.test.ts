import { test, expect } from "../../e2e/fixtures";
import { exportTimeDifferenceCsv } from "./createLinksFile";
import { getLinks } from "../linksHandler";

test.describe.configure({ retries: 2 });

// Create an array to store time differences
const timeDifferences: Record<string, Record<string, number>> = {};
const links = getLinks(1000);

// Create list of plugin names
const plugins = [
	{ name: "Format", continueShown: true },
	{ name: "Text compression", continueShown: true },
	{ name: "User preference", continueShown: false },
];

const failedLinks: string[] = [];

links.forEach((link) => {
	plugins.forEach((selectedPlugin) => {
		test(`Can analyze plugin: ${selectedPlugin.name} on: ${link}`, async ({
			page,
			extensionId,
		}) => {
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
			await popup.goto(
				`chrome-extension://${extensionId}/source/popup.html`,
			);

			// Disable Plugins
			for (const plugin of plugins) {
				const checkbox = await popup.getByLabel(plugin.name);
				await checkbox.setChecked(plugin.name == selectedPlugin.name);
			}

			// Click the "Scan Now" button
			await popup.getByRole("button", { name: "Scan Now" }).click();

			// Create locator for the "Continue" button
			const continueButton = await popup.getByRole("button", {
				name: "Continue",
			});

			if (selectedPlugin.continueShown) {
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
			}

			// Record the time when the "Continue" button is pressed
			const continueButtonPressedTime = Date.now();

			// Wait for the results box to appear
			const resultBox = await popup.locator(".results-box-container");

			try {
				await Promise.race([
					resultBox.waitFor({ timeout: 10000 }),
					popup.waitForTimeout(9000).then(() => {
						throw new Error("Timeout exceeded");
					}),
				]);
			} catch (e) {
				failedLinks.push(link);
				test.skip(true, "Analysis Failed(Never Loaded): " + e);
			}

			// Wait for the resultBox to have children within 10 seconds
			await popup.waitForFunction(
				(box) => box && box.children.length > 0,
				await resultBox.elementHandle(),
				{ timeout: 10000 },
			);

			// Record the time when the first child appears
			const firstChildAppearedTime = Date.now();

			// Calculate the time difference in seconds
			const timeDifferenceInSeconds =
				(firstChildAppearedTime - continueButtonPressedTime) / 1000;
			console.log(`Time difference: ${timeDifferenceInSeconds} seconds`);

			let websiteEntry = timeDifferences[link];
			if (!websiteEntry) websiteEntry = {};

			websiteEntry[selectedPlugin.name] = timeDifferenceInSeconds;

			timeDifferences[link] = websiteEntry;

			// Assert that the resultBox has children
			const childrenCount = await resultBox.evaluate(
				(box) => box.children.length,
			);
			expect(childrenCount).toBeGreaterThan(0);
		});
	});
});

test.afterAll(() => {
	Object.entries(timeDifferences).forEach((entry) => {
		if (Object.entries(entry[1]).length !== 3) {
			console.log(`Removed data for flaky website: ${entry[0]}`);
			delete timeDifferences[entry[0]];
		}
	});

	// Save data
	exportTimeDifferenceCsv(timeDifferences);
});
