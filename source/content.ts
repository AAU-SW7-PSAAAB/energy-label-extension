import browser from "./lib/browser";
import debug from "./lib/debug";
import {
	MessageLiterals,
	type SendContent,
	StartScanSchema,
} from "./lib/communication";

function filterDOM(include: string[], exclude: string[]): string {
	const documentClone = document.documentElement.cloneNode(true) as Element;

	let elements: Element[] = [];

	if (include.length == 0) {
		elements.push(documentClone);
	} else {
		// Include all elements matching the "include" query selectors
		include.forEach((selector) => {
			elements.push(...documentClone.querySelectorAll(selector));
		});

		// Delete elements that are children of other added elements
		elements = elements.filter((element) => {
			return !elements.some(
				(otherElement) =>
					otherElement !== element && otherElement.contains(element),
			);
		});
	}

	// Remove the content matching the "exclude" query selectors
	exclude.forEach((selector) => {
		elements.forEach((element) => {
			element.querySelectorAll(selector).forEach((e) => e.remove());
		});
	});

	return elements.map((element) => element.outerHTML).join("");
}

// https://developer.mozilla.org/en-US/docs/Web/API/StyleSheetList
function getAllCSS() {
	return [...document.styleSheets]
		.map((styleSheet) => {
			try {
				return [...styleSheet.cssRules].map((rule) => rule.cssText).join("");
			} catch {
				console.log(
					"Access to stylesheet %s is denied. Ignoring…",
					styleSheet.href,
				);
			}
		})
		.filter(Boolean)
		.join("\n");
}

browser.runtime.onMessage.addListener((request) => {
	switch (request.action) {
		case MessageLiterals.StartScan: {
			const { success, data, error } = StartScanSchema.safeParse(request);
			if (!success) {
				debug.warn(error);
				return
			};

			const message: SendContent = {
				action: MessageLiterals.SendContent,
				content: {
					dom: filterDOM(
						data.querySelectors.include,
						data.querySelectors.exclude,
					),
					css: getAllCSS()
				},
				selectedPluginNames: request.selectedPluginNames,
			};

			browser.runtime.sendMessage(message);

			break;
		}

		default: {
			console.log("Unknown request in content.ts", request);
			break;
		}
	}
});
