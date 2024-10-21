import browser from "./lib/browser.ts";
import { MessageLiterals } from "./lib/communication.ts";

browser.runtime.onMessage.addListener((message) => {
	switch (message.action) {
		case MessageLiterals.StartScan: {
			browser.runtime.sendMessage({
				data: document.documentElement.outerHTML,
			});

			break;
		}
	}
});
