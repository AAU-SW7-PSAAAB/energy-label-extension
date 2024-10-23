import { MessageLiterals, type SendContent } from "./lib/communication";

chrome.runtime.onMessage.addListener((request) => {
    switch (request.action) {
        case MessageLiterals.StartScan: {
            const message: SendContent = {
                action: MessageLiterals.SendContent,
                data: {
                    dom: document.documentElement.outerHTML,
                },
                selectedPluginNames: request.selectedPluginNames
            }

            chrome.runtime.sendMessage(message);

            break;
        }
    }
});
