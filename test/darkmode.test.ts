import { test } from "node:test";
import assert from "node:assert";

import * as cheerio from "cheerio";
import { Document, PluginInput } from "../source/lib/pluginTypes.ts";
import darkmode from "../source/plugins/darkmode.ts";

test(" no styling - no darkmode", async () => {
	const input = new PluginInput({
		network: {},
		document: new Document({
			css: undefined,
			dom: cheerio.load("<body></body>"),
		}),
	});
	const actual = await darkmode.analyze(input);
	const expected = 0;
	assert.strictEqual(actual, expected);
});

test("Inline background styling - darkmode", async () => {
	const input = new PluginInput({
		network: {},
		document: new Document({
			css: undefined,
			dom: cheerio.load("<body style='background:rgb(0,0,0)'></body>"),
		}),
	});
	const actual = await darkmode.analyze(input);
	const expected = 100;
	assert.strictEqual(actual, expected);
});

test("Inline background styling - not darkmode", async () => {
	const input = new PluginInput({
		network: {},
		document: new Document({
			css: undefined,
			dom: cheerio.load(
				"<body style='background:rgb(255,255,255)'></body>",
			),
		}),
	});
	const actual = await darkmode.analyze(input);
	const expected = 0;
	assert.strictEqual(actual, expected);
});

test("CSS prefers-color-scheme styling - darkmode", async () => {
	const input = new PluginInput({
		network: {},
		document: new Document({
			css: `
			@media (prefers-color-scheme: dark) {
				.body {
					background: rgb(0,0,0);
				  }
			}`,

			dom: cheerio.load("<body></body>"),
		}),
	});
	const actual = await darkmode.analyze(input);
	const expected = 100;
	assert.strictEqual(actual, expected);
});

test("CSS html[dark] styling - darkmode", async () => {
	const input = new PluginInput({
		network: {},
		document: new Document({
			css: `
			html[dark] {
				.body {
					background: rgb(0,0,0);
				  }
			}`,

			dom: cheerio.load("<body></body>"),
		}),
	});
	const actual = await darkmode.analyze(input);
	const expected = 100;
	assert.strictEqual(actual, expected);
});

test("CSS :root.dark styling - darkmode", async () => {
	const input = new PluginInput({
		network: {},
		document: new Document({
			css: `
			:root.dark {
				.body {
					background: rgb(0,0,0);
				  }
			}`,

			dom: cheerio.load("<body></body>"),
		}),
	});

	const actual = await darkmode.analyze(input);
	const expected = 100;
	assert.strictEqual(actual, expected);
});
