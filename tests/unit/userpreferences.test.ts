import { test } from "node:test";
import assert from "node:assert";

import * as cheerio from "cheerio";
import { Document, PluginInput } from "../../source/lib/pluginTypes.ts";
import userpreferences from "../../source/plugins/userpreferences.ts";

test(" no styling ", async () => {
	const input = new PluginInput({
		network: {},
		document: new Document({
			css: undefined,
			dom: cheerio.load("<body></body>"),
		}),
	});
	const actual = await userpreferences.analyze(input);
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
	const actual = await userpreferences.analyze(input);
	const expected = (100 / 3) * 1;
	assert.strictEqual(actual, expected);
});

test("Prefers contrast set", async () => {
	const input = new PluginInput({
		network: {},
		document: new Document({
			css: "@media (prefers-contrast: high)",
			dom: cheerio.load(
				"<body style='background:rgb(255,255,255)'></body>",
			),
		}),
	});
	const actual = await userpreferences.analyze(input);
	const expected = (100 / 3) * 1;
	assert.strictEqual(actual, expected);
});

test("prefers reduced motion set", async () => {
	const input = new PluginInput({
		network: {},
		document: new Document({
			css: "@media (prefers-reduced-motion)",

			dom: cheerio.load("<body></body>"),
		}),
	});
	const actual = await userpreferences.analyze(input);
	const expected = (100 / 3) * 1;
	assert.strictEqual(actual, expected);
});

test("2 prefrences set", async () => {
	const input = new PluginInput({
		network: {},
		document: new Document({
			css: `@media (prefers-color-scheme: dark)
				{
				}
				@media (prefers-contrast: high)
				{
				}
				`,
			dom: cheerio.load("<body></body>"),
		}),
	});
	const actual = await userpreferences.analyze(input);
	const expected = (100 / 3) * 2;
	assert.strictEqual(actual, expected);
});

test("3 prefrences set", async () => {
	const input = new PluginInput({
		network: {},
		document: new Document({
			css: `@media (prefers-color-scheme: dark)
				{
				}
				@media (prefers-contrast: high)
				{
				}
				@media (prefers-reduced-motion)
				{}
				`,

			dom: cheerio.load("<body></body>"),
		}),
	});

	const actual = await userpreferences.analyze(input);
	const expected = (100 / 3) * 3;
	assert.strictEqual(actual, expected);
});
