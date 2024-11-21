import { test } from "node:test";
import assert from "node:assert";

import TextCompressionPlugin from "../../source/plugins/textCompression.js";
import { PluginInput } from "../../source/lib/pluginTypes.js";
import type { RequestDetails } from "../../source/lib/communication.js";

const BEST_COMPRESSION_NAME = "br";
const GZIP_SCORE = 50;

test("Gzip score is not crazy", () => {
	assert.ok(GZIP_SCORE < 100);
	assert.ok(GZIP_SCORE > 0);
});

test("No connections", async () => {
	const input = new PluginInput({
		network: {},
	});

	let actual: number | undefined;
	await TextCompressionPlugin.analyze(async (result) => {
		actual = result.score;
	}, input);
	const expected = 100;

	assert.strictEqual(actual, expected);
});

test("One good connection", async () => {
	const input = new PluginInput({
		network: {
			"https://example.com/index.html": {
				statusCode: 200,
				responseHeaders: [
					{ name: "content-type", value: "text/html; charset=utf-8" },
					{ name: "content-encoding", value: BEST_COMPRESSION_NAME },
				],
			} as RequestDetails,
		},
	});

	let actual: number | undefined;
	await TextCompressionPlugin.analyze(async (result) => {
		actual = result.score;
	}, input);
	const expected = 100;

	assert.strictEqual(actual, expected);
});

test("One mediocre connection", async () => {
	const input = new PluginInput({
		network: {
			"https://example.com/index.html": {
				statusCode: 200,
				responseHeaders: [
					{ name: "content-type", value: "text/html; charset=utf-8" },
					{ name: "content-encoding", value: "gzip" },
				],
			} as RequestDetails,
		},
	});

	let actual: number | undefined;
	await TextCompressionPlugin.analyze(async (result) => {
		actual = result.score;
	}, input);
	const expected = GZIP_SCORE;

	assert.strictEqual(actual, expected);
});

test("One bad connection - no content encoding", async () => {
	const input = new PluginInput({
		network: {
			"https://example.com/index.html": {
				statusCode: 200,
				responseHeaders: [
					{ name: "content-type", value: "text/html; charset=utf-8" },
				],
			} as RequestDetails,
		},
	});

	let actual: number | undefined;
	await TextCompressionPlugin.analyze(async (result) => {
		actual = result.score;
	}, input);
	const expected = 0;

	assert.strictEqual(actual, expected);
});

test("One bad connection - content encoding", async () => {
	const input = new PluginInput({
		network: {
			"https://example.com/index.html": {
				statusCode: 200,
				responseHeaders: [
					{ name: "content-type", value: "text/html; charset=utf-8" },
					{ name: "content-encoding", value: "psaab" },
				],
			} as RequestDetails,
		},
	});

	let actual: number | undefined;
	await TextCompressionPlugin.analyze(async (result) => {
		actual = result.score;
	}, input);
	const expected = 0;

	assert.strictEqual(actual, expected);
});

test("One bad connection - content type - raster image", async () => {
	const input = new PluginInput({
		network: {
			"https://example.com/index.html": {
				responseHeaders: [
					{ name: "content-type", value: "image/jpeg" },
					{ name: "content-encoding", value: BEST_COMPRESSION_NAME },
				],
			} as RequestDetails,
		},
	});

	let actual: number | undefined;
	await TextCompressionPlugin.analyze(async (result) => {
		actual = result.score;
	}, input);
	const expected = 100;

	assert.strictEqual(actual, expected);
});

test("One bad connection - content type - zip file", async () => {
	const input = new PluginInput({
		network: {
			"https://example.com/index.html": {
				responseHeaders: [
					{ name: "content-type", value: "application/zip" },
					{ name: "content-encoding", value: BEST_COMPRESSION_NAME },
				],
			} as RequestDetails,
		},
	});

	let actual: number | undefined;
	await TextCompressionPlugin.analyze(async (result) => {
		actual = result.score;
	}, input);
	const expected = 100;

	assert.strictEqual(actual, expected);
});

test("One unknown (bad) connection - response headers", async () => {
	const input = new PluginInput({
		network: {
			"https://example.com/index.html": {
				statusCode: 200,
			} as RequestDetails,
		},
	});

	let actual: number | undefined;
	await TextCompressionPlugin.analyze(async (result) => {
		actual = result.score;
	}, input);
	const expected = 100;

	assert.strictEqual(actual, expected);
});

test("One unknown (mediocre) connection - content type", async () => {
	const input = new PluginInput({
		network: {
			"https://example.com/index.html": {
				statusCode: 200,
				responseHeaders: [{ name: "content-encoding", value: "gzip" }],
			} as RequestDetails,
		},
	});

	let actual: number | undefined;
	await TextCompressionPlugin.analyze(async (result) => {
		actual = result.score;
	}, input);
	const expected = 100;

	assert.strictEqual(actual, expected);
});

test("One mediocre CSS connection", async () => {
	const input = new PluginInput({
		network: {
			"https://example.com/script.js": {
				statusCode: 200,
				responseHeaders: [
					{ name: "content-type", value: "text/css charset=utf-8" },
					{ name: "content-encoding", value: "gzip" },
				],
			} as RequestDetails,
		},
	});

	let actual: number | undefined;
	await TextCompressionPlugin.analyze(async (result) => {
		actual = result.score;
	}, input);
	const expected = GZIP_SCORE;

	assert.strictEqual(actual, expected);
});

test("One mediocre JS connection", async () => {
	const input = new PluginInput({
		network: {
			"https://example.com/script.js": {
				statusCode: 200,
				responseHeaders: [
					{
						name: "content-type",
						value: "text/javascript; charset=utf-8",
					},
					{ name: "content-encoding", value: "gzip" },
				],
			} as RequestDetails,
		},
	});

	let actual: number | undefined;
	await TextCompressionPlugin.analyze(async (result) => {
		actual = result.score;
	}, input);
	const expected = GZIP_SCORE;

	assert.strictEqual(actual, expected);
});

test("One mediocre JSON connection", async () => {
	const input = new PluginInput({
		network: {
			"https://example.com/script.js": {
				statusCode: 200,
				responseHeaders: [
					{
						name: "content-type",
						value: "application/json; charset=utf-8",
					},
					{ name: "content-encoding", value: "gzip" },
				],
			} as RequestDetails,
		},
	});

	let actual: number | undefined;
	await TextCompressionPlugin.analyze(async (result) => {
		actual = result.score;
	}, input);
	const expected = GZIP_SCORE;

	assert.strictEqual(actual, expected);
});

test("One mediocre SVG connection", async () => {
	const input = new PluginInput({
		network: {
			"https://example.com/script.js": {
				statusCode: 200,
				responseHeaders: [
					{
						name: "content-type",
						value: "image/svg+xml; charset=utf-8",
					},
					{ name: "content-encoding", value: "gzip" },
				],
			} as RequestDetails,
		},
	});

	let actual: number | undefined;
	await TextCompressionPlugin.analyze(async (result) => {
		actual = result.score;
	}, input);
	const expected = GZIP_SCORE;

	assert.strictEqual(actual, expected);
});

test("Two good, one bad, one unknown connection", async () => {
	const input = new PluginInput({
		network: {
			"https://example.com/index.html": {
				statusCode: 200,
				responseHeaders: [
					{ name: "content-type", value: "text/html; charset=utf-8" },
					{ name: "content-encoding", value: "br" },
				],
			} as RequestDetails,
			"https://example.com/logo.svg": {
				statusCode: 200,
				responseHeaders: [
					{
						name: "content-type",
						value: "text/svg+xml; charset=utf-8",
					},
					{ name: "content-encoding", value: "br" },
				],
			} as RequestDetails,
			"https://example.com/banner.svg": {
				statusCode: 200,
				responseHeaders: [
					{
						name: "content-type",
						value: "text/svg+xml; charset=utf-8",
					},
				],
			} as RequestDetails,
			"https://example.com/script.js": {
				statusCode: 200,
				responseHeaders: [{ name: "content-encoding", value: "gzip" }],
			} as RequestDetails,
		},
	});

	let actual: number = -Infinity;
	await TextCompressionPlugin.analyze(async (result) => {
		actual = result.score;
	}, input);
	const actualCoarse = Math.floor(Math.floor(actual) / 10) * 10;
	const expectedCoarse = 60;

	assert.strictEqual(actualCoarse, expectedCoarse);
});
