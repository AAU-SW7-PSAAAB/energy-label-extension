import browser from "./browser";

export async function getActiveTab(): Promise<browser.tabs.Tab | undefined> {
	let activeTab: browser.tabs.Tab | undefined;
	if (
		import.meta.env?.MODE === "test" ||
		import.meta.env?.MODE === "benchmark"
	) {
		activeTab = (await browser.tabs.query({}))[1];
	} else {
		[activeTab] = await browser.tabs.query({
			active: true,
			currentWindow: true,
			windowType: "normal",
		});
	}
	return activeTab;
}
