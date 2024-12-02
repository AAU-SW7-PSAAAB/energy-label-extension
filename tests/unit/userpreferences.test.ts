import { test } from "node:test";
import assert from "node:assert";

import * as cheerio from "cheerio";
import {
	Document,
	PluginInput,
	type PluginResult,
} from "../../source/lib/pluginTypes.ts";
import userpreferences from "../../source/plugins/userpreferences.ts";

const pluginChecks = 1;

const originalAnalyze = userpreferences.analyze;
userpreferences.analyze = async (sink, input) => {
	const wrappedSink = async (result: PluginResult) => {
		if (result.progress < 0 || result.progress > 100) {
			throw new Error(`Invalid progress value: ${result.progress}`);
		}

		await sink(result);
	};

	await originalAnalyze(wrappedSink, input);
};

test("no styling", async () => {
	const input = new PluginInput({
		network: {},
		document: new Document({
			css: undefined,
			dom: cheerio.load("<body></body>"),
		}),
	});
	let actual: number | undefined;
	await userpreferences.analyze(async (result) => {
		actual = result.score;
	}, input);
	const expected = 0;
	assert.strictEqual(actual, expected);
});

test("prefers color scheme set", async () => {
	const input = new PluginInput({
		network: {},
		document: new Document({
			css: "@media (prefers-color-scheme: dark)",
			dom: cheerio.load("<body></body>"),
		}),
	});
	let actual: number | undefined;
	await userpreferences.analyze(async (result) => {
		actual = result.score;
	}, input);
	const expected = (100 / pluginChecks) * 1;
	assert.strictEqual(actual, expected);
});

// test("Prefers contrast set", async () => {
// 	const input = new PluginInput({
// 		network: {},
// 		document: new Document({
// 			css: "@media (prefers-contrast: high)",
// 			dom: cheerio.load(
// 				"<body style='background:rgb(255,255,255)'></body>",
// 			),
// 		}),
// 	});
// 	let actual: number | undefined;
// 	await userpreferences.analyze(async (result) => {
// 		actual = result.score;
// 	}, input);
// 	const expected = (100 / pluginChecks) * 1;
// 	assert.strictEqual(actual, expected);
// });

test("color scheme set", async () => {
	const input = new PluginInput({
		network: {},
		document: new Document({
			css: ":root { color-scheme : light dark }",

			dom: cheerio.load("<body></body>"),
		}),
	});
	let actual: number | undefined;
	await userpreferences.analyze(async (result) => {
		actual = result.score;
	}, input);
	const expected = (100 / pluginChecks) * 1;
	assert.strictEqual(actual, expected);
});

// test("2 prefrences set", async () => {
// 	const input = new PluginInput({
// 		network: {},
// 		document: new Document({
// 			css: `@media (prefers-color-scheme: dark)
// 				{
// 				}
// 				@media (prefers-contrast: high)
// 				{
// 				}
// 				`,
// 			dom: cheerio.load("<body></body>"),
// 		}),
// 	});
// 	let actual: number | undefined;
// 	await userpreferences.analyze(async (result) => {
// 		actual = result.score;
// 	}, input);
// 	const expected = (100 / pluginChecks) * 2;
// 	assert.strictEqual(actual, expected);
// });

test("aau's color scheme unset", async () => {
	const input = new PluginInput({
		network: {},
		document: new Document({
			css: `color-scheme: unset; lighting-color: red;`,
			dom: cheerio.load("<body></body>"),
		}),
	});
	let actual: number | undefined;
	await userpreferences.analyze(async (result) => {
		actual = result.score;
	}, input);
	const expected = 0;
	assert.strictEqual(actual, expected);
});

test("custom color scheme property variable thing is not ok!", async () => {
	const input = new PluginInput({
		network: {},
		document: new Document({
			css: `custom-color-scheme: light dark;`,
			dom: cheerio.load("<body></body>"),
		}),
	});
	let actual: number | undefined;
	await userpreferences.analyze(async (result) => {
		actual = result.score;
	}, input);
	const expected = 0;
	assert.strictEqual(actual, expected);
});
