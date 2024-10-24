import browser from "./lib/browser";
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

browser.runtime.onMessage.addListener((request) => {
	switch (request.action) {
		case MessageLiterals.StartScan: {
			const { success, data } = StartScanSchema.safeParse(request);
			if (!success) return;

			const message: SendContent = {
				action: MessageLiterals.SendContent,
				content: {
					dom: filterDOM(
						data.querySelectors.include,
						data.querySelectors.exclude,
					),
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
