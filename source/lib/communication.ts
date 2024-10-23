/**
 * Intra communication message literals
 */
export enum MessageLiterals {
	StartScan = "StartScan",
	SendContent = "SendContent",
}

type Message = {
	action: MessageLiterals;
}

export interface StartScan extends Message {
	selectedPluginNames: string[];
}

export interface SendContent extends Message {
	data: {
		dom: string;
	}
	selectedPluginNames: string[];
}

export type AllMessages = StartScan | SendContent;

export function isSendContent(message: any): message is SendContent {
	const dataCheck = "data" in message && typeof message.data === "object" && message.data !== null;
	const pluginCheck = "selectedPluginNames" in message && Array.isArray(message.selectedPluginNames);

	return dataCheck && pluginCheck;
}
