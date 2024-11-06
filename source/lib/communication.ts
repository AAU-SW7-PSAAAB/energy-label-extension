import { z } from "zod";
import { statusCodeEnum } from "energy-label-types";

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
		css: z.string(),
	}),
	selectedPluginNames: z.array(z.string()),
});

export const ResultSchema = z.object({
	name: z.string(),
	score: z.number(),
	status: statusCodeEnum,
});

export const ResultsSchema = z.array(ResultSchema);

export type StartScan = z.infer<typeof StartScanSchema>;
export type SendContent = z.infer<typeof SendContentSchema>;
export type Result = z.infer<typeof ResultSchema>;
export type Results = z.infer<typeof ResultsSchema>;
