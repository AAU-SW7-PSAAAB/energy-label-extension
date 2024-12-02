import { test, expect } from "../e2e/fixtures";
import { getLinks, exportTimeDifferenceCsv } from "./createLinksFile";

test.describe.configure({ mode: 'serial' });

// Create an array to store time differences
const timeDifferences: number[] = [];
const links = getLinks(1000)

links.forEach((link) => {
	test(`Can analyze ${link}`, async ({ page, extensionId }) => {
		// Goto example.com and open the extension popup

		try {
			await page.goto(`https://${link}`, { timeout: 10000 });
		} catch (e) {
			test.skip(true, "Could not load page: " + e)
		}
		const popup = await page.context().newPage();
		await popup.goto(`chrome-extension://${extensionId}/source/popup.html`);

		// Click the "Scan Now" button
		await popup.getByRole("button", { name: "Scan Now" }).click();

		// Click the "Continue" button
		await popup.getByRole("button", { name: "Continue" }).click();

		// Record the time when the "Continue" button is pressed
		const continueButtonPressedTime = Date.now();

		// Wait for the results box to appear
		const resultBox = await popup.waitForSelector(".results-box-container");

		// Wait for the resultBox to have children within 10 seconds
		await popup.waitForFunction(
			(box) => box && box.children.length > 0,
			resultBox,
			{ timeout: 10000 }
		);

		// Record the time when the first child appears
		const firstChildAppearedTime = Date.now();

		// Calculate the time difference in seconds
		const timeDifferenceInSeconds = (firstChildAppearedTime - continueButtonPressedTime) / 1000;
		console.log(`Time difference: ${timeDifferenceInSeconds} seconds`);
		timeDifferences.push(timeDifferenceInSeconds)

		// Assert that the resultBox has children
		const childrenCount = await resultBox.evaluate((box) => box.children.length);
		expect(childrenCount).toBeGreaterThan(0);
	});
})

test.afterAll(() => {
	if (timeDifferences.length === 0) return;
	const totalTime = timeDifferences.reduce((acc, curr) => acc + curr, 0)
	const averageTime = totalTime / timeDifferences.length
	console.log(`Average time difference: ${averageTime.toFixed(2)} seconds`);

	// Save data
	exportTimeDifferenceCsv(timeDifferences)
})
