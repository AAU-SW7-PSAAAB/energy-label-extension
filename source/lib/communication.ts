import { z } from "zod";

export enum MessageLiterals {
	StartScan = "StartScan",
	SendContent = "SendContent",
	SendResult = "SendResult",
}

export const StartScanSchema = z.object({
	action: z.literal(MessageLiterals.StartScan),
	selectedPluginNames: z.array(z.string()),
	querySelectors: z.object({
		include: z.array(z.string()),
		exclude: z.array(z.string()),
	}),
});

export const SendContentSchema = z.object({
	action: z.literal(MessageLiterals.SendContent),
	content: z.object({
		dom: z.string(),
	}),
	selectedPluginNames: z.array(z.string()),
});

export const ResultsSchema = z.array(
	z.object({
		name: z.string(),
		score: z.number(),
		success: z.boolean(),
	}),
);

export type StartScan = z.infer<typeof StartScanSchema>;
export type SendContent = z.infer<typeof SendContentSchema>;
export type Results = z.infer<typeof ResultsSchema>;
