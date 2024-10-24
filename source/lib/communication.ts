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

const ResultSchema = z.object({
	name: z.string(),
	score: z.number(),
	success: z.boolean(),
});

export const ResultsSchema = z.array(ResultSchema);

export const SendResultSchema = z.object({
	action: z.literal(MessageLiterals.SendResult),
	results: z.map(z.string(), ResultSchema),
});

export type StartScan = z.infer<typeof StartScanSchema>;
export type SendContent = z.infer<typeof SendContentSchema>;
export type Result = z.infer<typeof ResultSchema>;
export type Results = z.infer<typeof ResultsSchema>;
export type SendResult = z.infer<typeof SendResultSchema>;
