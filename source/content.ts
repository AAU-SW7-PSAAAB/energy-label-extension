import browser from "./lib/browser";
import { MessageLiterals, type SendContent } from "./lib/communication";

browser.runtime.onMessage.addListener((request) => {
	switch (request.action) {
		case MessageLiterals.StartScan: {
			const message: SendContent = {
				action: MessageLiterals.SendContent,
				content: {
					dom: document.documentElement.outerHTML,
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
