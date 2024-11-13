import { test } from "node:test";
import assert from "node:assert";

import * as cheerio from "cheerio";
import { PluginInput } from "../source/lib/pluginTypes.ts";
import darkmode from "../source/plugins/darkmode.ts";

test(" no styling - no darkmode", async () => {
	const input: PluginInput = {
		network: {},
		css: undefined,
		dom: cheerio.load("<body></body>"),
	};
	console.log("test")
	const actual = await darkmode.analyze(input);
	const expected = 0;
	assert.strictEqual(actual, expected);
});

test("Inline background styling - darkmode", async () => {
	const input: PluginInput = {
		network: {},
		css: undefined,
		dom: cheerio.load("<body style='background:rgb(0,0,0)'></body>"),
	};
	console.log("test")
	const actual = await darkmode.analyze(input);
	const expected = 100;
	assert.strictEqual(actual, expected);
});

test("Inline background styling - not darkmode", async () => {
	const input: PluginInput = {
		network: {},
		css: undefined,
		dom: cheerio.load("<body style='background:rgb(255,255,255)'></body>"),
	};
	console.log("test")
	const actual = await darkmode.analyze(input);
	const expected = 0;
	assert.strictEqual(actual, expected);
});

test("CSS prefers-color-scheme styling - darkmode", async () => {
	const input: PluginInput = {
		network: {},
		css: `
		@media (prefers-color-scheme: dark) {
			.body {
				background: rgb(0,0,0);
  			}
		}`,
		
		dom: cheerio.load("<body></body>"),
	};
	console.log("test")
	const actual = await darkmode.analyze(input);
	const expected = 100;
	assert.strictEqual(actual, expected);
});


test("CSS html[dark] styling - darkmode", async () => {
	const input: PluginInput = {
		network: {},
		css: `
		html[dark] {
			.body {
				background: rgb(0,0,0);
  			}
		}`,
		
		dom: cheerio.load("<body></body>"),
	};
	console.log("test")
	const actual = await darkmode.analyze(input);
	const expected = 100;
	assert.strictEqual(actual, expected);
});

test("CSS :root.dark styling - darkmode", async () => {
	const input: PluginInput = {
		network: {},
		css: `
		:root.dark {
			.body {
				background: rgb(0,0,0);
  			}
		}`,
		
		dom: cheerio.load("<body></body>"),
	};
	console.log("test")
	const actual = await darkmode.analyze(input);
	const expected = 100;
	assert.strictEqual(actual, expected);
});