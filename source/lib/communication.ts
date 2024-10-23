import { z } from "zod";

export enum MessageLiterals {
	StartScan = "StartScan",
	SendContent = "SendContent",
	SendResult = "SendResult",
}

export const StartScanSchema = z.object({
	action: z.literal(MessageLiterals.StartScan),
	selectedPluginNames: z.array(z.string()),
});

export const SendContentSchema = z.object({
	action: z.literal(MessageLiterals.SendContent),
	content: z.object({
		dom: z.string(),
	}),
	selectedPluginNames: z.array(z.string()),
});

export const SendResultSchema = z.object({
	action: z.literal(MessageLiterals.SendResult),
	grades: z.map(z.string(), z.number()),
});

export type StartScan = z.infer<typeof StartScanSchema>;
export type SendContent = z.infer<typeof SendContentSchema>;
export type SendResult = z.infer<typeof SendResultSchema>;
