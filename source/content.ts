import browser from "./lib/browser";
import { MessageLiterals, SendContent } from "./lib/communication";

browser.runtime.onMessage.addListener((request) => {
	switch (request.action) {
		case MessageLiterals.StartScan: {
			const message: SendContent = {
				action: MessageLiterals.SendContent,
				data: {
					dom: document.documentElement.outerHTML,
				},
				selectedPluginNames: request.selectedPluginNames
			}

			browser.runtime.sendMessage(message);

			break;
		}
	}
});
