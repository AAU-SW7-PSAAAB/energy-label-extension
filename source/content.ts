import browser from "./lib/browser.ts";
import { MessageLiterals, storage } from "./lib/communication.ts";
import debug from "./lib/debug.ts";
import { scanState, ScanStates } from "./lib/ScanState.ts";

window.addEventListener("load", () => {
	browser.runtime.sendMessage({ action: MessageLiterals.SiteLoaded });
});

if (document.readyState === "complete") {
	browser.runtime.sendMessage({ action: MessageLiterals.SiteLoaded });
}

function filterDOM(
	fullScan: boolean,
	include: string[],
	exclude: string[],
): string {
	const documentClone = document.documentElement.cloneNode(true) as Element;
	let elements: Element[] = [];

	// If it is a full scan, include the base document and do nothing else
	if (fullScan) {
		elements.push(documentClone);
	} else {
		// Include all elements matching the "include" query selectors
		if (include.length === 0) {
			elements.push(documentClone);
		} else {
			include.forEach((selector) => {
				elements.push(...documentClone.querySelectorAll(selector));
			});
		}

		// Delete elements that are children of other added elements
		elements = elements.filter((element) => {
			return !elements.some(
				(otherElement) =>
					otherElement !== element && otherElement.contains(element),
			);
		});

		// Remove the content matching the "exclude" query selectors
		exclude.forEach((selector) => {
			elements.forEach((element) => {
				element.querySelectorAll(selector).forEach((e) => e.remove());
			});
		});
	}

	return elements.map((element) => element.outerHTML).join("");
}

// https://developer.mozilla.org/en-US/docs/Web/API/StyleSheetList
function getAllCSS() {
	return [...document.styleSheets]
		.map((styleSheet) => {
			try {
				return [...styleSheet.cssRules]
					.map((rule) => rule.cssText)
					.join("");
			} catch {
				debug.warn(
					"Access to stylesheet %s is denied. Ignoring…",
					styleSheet.href,
				);
			}
		})
		.filter(Boolean)
		.join("\n");
}

scanState.initAndUpdate(async (state: ScanStates) => {
	switch (state) {
		case ScanStates.LoadContent: {
			const querySelectors = (await storage.querySelectors.get()) || {
				fullScan: true,
				include: [],
				exclude: [],
			};

			await storage.pageContent.set({
				dom: filterDOM(
					querySelectors.fullScan,
					querySelectors.include,
					querySelectors.exclude,
				),
				css: getAllCSS(),
			});

			await scanState.set(ScanStates.LoadContentFinished);

			break;
		}
	}
});
