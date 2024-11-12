import { test } from "node:test";
import assert from "node:assert";

import * as cheerio from "cheerio";
import FormatPlugin from "../source/plugins/format.ts";
import { PluginInput } from "../source/lib/pluginTypes.ts";
import { RequestDetails } from "../source/lib/communication.ts";

test("No media", async () => {
	const input: PluginInput = {
		network: {},
		css: undefined,
		dom: cheerio.load(`<p>Paragraph</p>`),
	};

	const actual = await FormatPlugin.analyze(input);
	const expected = 100;

	assert.strictEqual(actual, expected);
});

test("One good format", async () => {
	const input: PluginInput = {
		network: {
			"https://example.com/image.avif": {
				url: "https://example.com/image.avif",
				type: "image",
				responseHeaders: [
					{ name: "content-type", value: "image/avif" },
				],
			} as RequestDetails,
		},
		css: undefined,
		dom: cheerio.load(`<img src="https://example.com/image.avif">`),
	};

	const expected = await FormatPlugin.analyze(input);
	const actual = 100;

	assert.strictEqual(actual, expected);
});

test("One bad format", async () => {
	const input: PluginInput = {
		network: {
			"https://example.com/image.jpg": {
				url: "https://example.com/image.jpg",
				type: "image",
				responseHeaders: [
					{ name: "content-type", value: "image/jpeg" },
				],
			} as RequestDetails,
		},
		css: undefined,
		dom: cheerio.load(`<img src="https://example.com/image.jpg">`),
	};

	const actual = await FormatPlugin.analyze(input);
	const expected = 25;

	assert.strictEqual(actual, expected);
});

test("Subtypes in content-type", async () => {
	const input: PluginInput = {
		network: {
			"https://example.com/image.svg": {
				url: "https://example.com/image.svg",
				type: "image",
				responseHeaders: [
					{
						name: "content-type",
						value: "image/svg+xml",
					},
				],
			} as RequestDetails,
			"https://example.com/image.gif": {
				url: "https://example.com/image.gif",
				type: "image",
				responseHeaders: [{ name: "content-type", value: "image/gif" }],
			} as RequestDetails,
		},
		css: undefined,
		dom: cheerio.load(`<img src="https://example.com/image.svg">
			<img src="https://example.com/image.gif">`),
	};

	const actual = await FormatPlugin.analyze(input);
	const expected = (100 + 25) / 2;

	assert.strictEqual(actual, expected);
});

test("Parameters in content-type", async () => {
	const input: PluginInput = {
		network: {
			"https://example.com/image.jpeg": {
				url: "https://example.com/image.jpeg",
				type: "image",
				responseHeaders: [
					{
						name: "content-type",
						value: "image/jpeg;charset=UTF-8",
					},
				],
			} as RequestDetails,
		},
		css: undefined,
		dom: cheerio.load(`<img src="https://example.com/image.jpeg">`),
	};

	const actual = await FormatPlugin.analyze(input);
	const expected = 25;

	assert.strictEqual(actual, expected);
});

test("Works for src", async () => {
	const input: PluginInput = {
		network: {
			"https://example.com/image.gif": {
				url: "https://example.com/image.gif",
				type: "image",
				responseHeaders: [{ name: "content-type", value: "image/gif" }],
			} as RequestDetails,
		},
		css: undefined,
		dom: cheerio.load(`<img src="https://example.com/image.gif">`),
	};

	const actual = await FormatPlugin.analyze(input);
	const expected = 25;

	assert.strictEqual(actual, expected);
});

test("Works for element source", async () => {
	const input: PluginInput = {
		network: {
			"https://example.com/video.webm": {
				url: "https://example.com/video.webm",
				type: "media",
				responseHeaders: [
					{ name: "content-type", value: "video/webm" },
				],
			} as RequestDetails,
			"https://example.com/image.gif": {
				url: "https://example.com/image.gif",
				type: "image",
				responseHeaders: [{ name: "content-type", value: "image/gif" }],
			} as RequestDetails,
		},
		css: undefined,
		dom: cheerio.load(
			`<video><source src="https://example.com/video.webm"></video>
			<img src="https://example.com/image.gif">`,
		),
	};

	const actual = await FormatPlugin.analyze(input);
	const expected = (100 + 25) / 2;

	assert.strictEqual(actual, expected);
});

test("Works for srcset", async () => {
	const input: PluginInput = {
		network: {
			"https://example.com/image.png": {
				url: "https://example.com/image.png",
				type: "image",
				responseHeaders: [{ name: "content-type", value: "image/png" }],
			} as RequestDetails,
		},
		css: undefined,
		dom: cheerio.load(
			`<img srcset="https://example.com/image.png 1200w, https://example.com/image.png 640w">`,
		),
	};

	const actual = await FormatPlugin.analyze(input);
	const expected = 25;

	assert.strictEqual(actual, expected);
});

test("Works for src and srcset together", async () => {
	const input: PluginInput = {
		network: {
			"img_pink_flowers.jpg": {
				url: "img_pink_flowers.jpg",
				type: "image",
				responseHeaders: [{ name: "content-type", value: "image/jpg" }],
			} as RequestDetails,
			"img_white_flowers.webp": {
				url: "img_white_flowers.webp",
				type: "image",
				responseHeaders: [
					{ name: "content-type", value: "image/webp" },
				],
			} as RequestDetails,
			"img_orange_flowers.avif": {
				url: "img_orange_flowers.avif",
				type: "image",
				responseHeaders: [
					{ name: "content-type", value: "image/avif" },
				],
			} as RequestDetails,
		},
		css: undefined,
		dom: cheerio.load(
			`<picture>
				<source media="(min-width:650px)" srcset="img_pink_flowers.jpg">
				<source media="(min-width:465px)" srcset="img_white_flowers.webp">
				<img src="img_orange_flowers.avif" alt="Flowers" style="width:auto;">
			</picture>`,
		),
	};

	const actual = await FormatPlugin.analyze(input);
	const expected = (25 + 50 + 100) / 3;

	assert.strictEqual(actual, expected);
});

test("Works for src and srcset together but unused source", async () => {
	const input: PluginInput = {
		network: {
			"img_pink_flowers.jpg": {
				url: "img_pink_flowers.jpg",
				type: "image",
				responseHeaders: [{ name: "content-type", value: "image/jpg" }],
			} as RequestDetails,
			"img_orange_flowers.avif": {
				url: "img_orange_flowers.avif",
				type: "image",
				responseHeaders: [
					{ name: "content-type", value: "image/avif" },
				],
			} as RequestDetails,
		},
		css: undefined,
		dom: cheerio.load(
			`<picture>
				<source media="(min-width:650px)" srcset="img_pink_flowers.jpg">
				<source media="(min-width:465px)" srcset="img_white_flowers.webp">
				<img src="img_orange_flowers.avif" alt="Flowers" style="width:auto;">
			</picture>`,
		),
	};

	const actual = await FormatPlugin.analyze(input);
	const expected = (25 + 100) / 2;

	assert.strictEqual(actual, expected);
});

test("Works for audio", async () => {
	const input: PluginInput = {
		network: {
			"https://example.com/audio.mp3": {
				url: "https://example.com/audio.mp3",
				type: "media",
				responseHeaders: [{ name: "content-type", value: "audio/mp3" }],
			} as RequestDetails,
			"https://example.com/image.png": {
				url: "https://example.com/image.png",
				type: "image",
				responseHeaders: [{ name: "content-type", value: "image/png" }],
			} as RequestDetails,
		},
		css: undefined,
		dom: cheerio.load(`<audio><source src="https://example.com/audio.mp3"></audio>
			<img src="https://example.com/image.png">`),
	};

	const actual = await FormatPlugin.analyze(input);
	const expected = (100 + 25) / 2;

	assert.strictEqual(actual, expected);
});

test("Works for font", async () => {
	const input: PluginInput = {
		network: {
			"https://example.com/font.woff": {
				url: "https://example.com/font.woff",
				type: "font",
				responseHeaders: [{ name: "content-type", value: "font/woff" }],
			} as RequestDetails,
		},
		css: undefined,
		dom: cheerio.load(
			`<link rel="stylesheet" href="https://example.com/font.woff">`,
		),
	};

	const actual = await FormatPlugin.analyze(input);
	const expected = 50;

	assert.strictEqual(actual, expected);
});

test("Works for CSS URLs with quotation", async () => {
	const input: PluginInput = {
		network: {
			"https://example.com/image.png": {
				url: "https://example.com/image.png",
				type: "image",
				responseHeaders: [{ name: "content-type", value: "image/png" }],
			} as RequestDetails,
		},
		css: `body { background-image: url("https://example.com/image.png"); }`,
		dom: cheerio.load(`<p>Paragraph</p>`),
	};

	const actual = await FormatPlugin.analyze(input);
	const expected = 25;

	assert.strictEqual(actual, expected);
});

test("Works for CSS URLs without quotation", async () => {
	const input: PluginInput = {
		network: {
			"https://example.com/image.png": {
				url: "https://example.com/image.png",
				type: "image",
				responseHeaders: [{ name: "content-type", value: "image/png" }],
			} as RequestDetails,
		},
		css: `body { background-image: url(https://example.com/image.png); }`,
		dom: cheerio.load(`<p>Paragraph</p>`),
	};

	const actual = await FormatPlugin.analyze(input);
	const expected = 25;

	assert.strictEqual(actual, expected);
});

test("One good format and one bad format", async () => {
	const input: PluginInput = {
		network: {
			"https://example.com/image.avif": {
				url: "https://example.com/image.avif",
				type: "image",
				responseHeaders: [
					{ name: "content-type", value: "image/avif" },
				],
			} as RequestDetails,
			"https://example.com/image.jpg": {
				url: "https://example.com/image.jpg",
				type: "image",
				responseHeaders: [
					{ name: "content-type", value: "image/jpeg" },
				],
			} as RequestDetails,
		},
		css: undefined,
		dom: cheerio.load(`<img src="https://example.com/image.avif">
			<img src="https://example.com/image.jpg">`),
	};

	const actual = await FormatPlugin.analyze(input);
	const expected = (100 + 25) / 2;

	assert.strictEqual(actual, expected);
});

test("Valid redirected URL", async () => {
	const input: PluginInput = {
		network: {
			"https://example.com/video.mp4": {
				url: "https://example.com/video.mp4",
				redirectUrl:
					"https://example.com/21ffdba7-59dc-4ab4-9a3e-2389442119f8.mp4",
				type: "media",
				statusCode: 302,
			} as RequestDetails,
			"https://example.com/21ffdba7-59dc-4ab4-9a3e-2389442119f8.mp4": {
				url: "https://example.com/21ffdba7-59dc-4ab4-9a3e-2389442119f8.mp4",
				type: "media",
				responseHeaders: [{ name: "content-type", value: "image/mp4" }],
			} as RequestDetails,
			"https://example.com/image.png": {
				url: "https://example.com/image.png",
				type: "image",
				responseHeaders: [{ name: "content-type", value: "image/png" }],
			} as RequestDetails,
		},
		css: undefined,
		dom: cheerio.load(`<img src="https://example.com/video.mp4">
			<img src="https://example.com/image.png">`),
	};

	const actual = await FormatPlugin.analyze(input);
	const expected = (100 + 25) / 2;

	assert.strictEqual(actual, expected);
});

test("Invalid redirected URL", async () => {
	const input: PluginInput = {
		network: {
			"https://example.com/video.mp4": {
				url: "https://example.com/video.mp4",
				redirectUrl:
					"https://example.com/21ffdba7-59dc-4ab4-9a3e-2389442119f8.mp4",
				type: "media",
				statusCode: 302,
			} as RequestDetails,
			"https://example.com/image.png": {
				url: "https://example.com/image.png",
				type: "image",
				responseHeaders: [{ name: "content-type", value: "image/png" }],
			} as RequestDetails,
		},
		css: undefined,
		dom: cheerio.load(`<img src="https://example.com/video.mp4">
			<img src="https://example.com/image.png">`),
	};

	const actual = await FormatPlugin.analyze(input);
	// The video.mp4 is not found in network requests, so it is not counted
	const expected = (0 + 25) / 1;

	assert.strictEqual(actual, expected);
});

test("Detects redirect loop", async () => {
	const input: PluginInput = {
		network: {
			"https://example.com/video.mp4": {
				url: "https://example.com/video.mp4",
				redirectUrl:
					"https://example.com/21ffdba7-59dc-4ab4-9a3e-2389442119f8.mp4",
				type: "media",
				statusCode: 302,
			} as RequestDetails,
			"https://example.com/21ffdba7-59dc-4ab4-9a3e-2389442119f8.mp4": {
				url: "https://example.com/21ffdba7-59dc-4ab4-9a3e-2389442119f8.mp4",
				redirectUrl: "https://example.com/video.mp4",
				type: "media",
				statusCode: 302,
			} as RequestDetails,
			"https://example.com/image.png": {
				url: "https://example.com/image.png",
				type: "image",
				responseHeaders: [{ name: "content-type", value: "image/png" }],
			} as RequestDetails,
		},
		css: undefined,
		dom: cheerio.load(`<img src="https://example.com/video.mp4">
			<img src="https://example.com/image.png">`),
	};

	const actual = await FormatPlugin.analyze(input);
	// Infinite loop detected, so the video.mp4 is not counted, but plugin continues
	const expected = (0 + 25) / 1;

	assert.strictEqual(actual, expected);
});

test("Fallback from content-type to URL", async () => {
	const input: PluginInput = {
		network: {
			"https://example.com/image.jxl": {
				url: "https://example.com/image.jxl",
				type: "image",
			} as RequestDetails,
		},
		css: undefined,
		dom: cheerio.load(`<img src="https://example.com/image.jxl">`),
	};

	const actual = await FormatPlugin.analyze(input);
	const expected = 75;

	assert.strictEqual(actual, expected);
});

test("Fallback from content-type to URL with parameters and fragments", async () => {
	const input: PluginInput = {
		network: {
			"https://example.com/image.jxl?key=value": {
				url: "https://example.com/image.jxl?key=value",
				type: "image",
			} as RequestDetails,
			"https://example.com/image.webp#frag": {
				url: "https://example.com/image.webp#frag",
				type: "image",
			} as RequestDetails,
		},
		css: undefined,
		dom: cheerio.load(`<img src="https://example.com/image.jxl?key=value">
			<img src="https://example.com/image.webp#frag">`),
	};

	const actual = await FormatPlugin.analyze(input);
	const expected = (75 + 50) / 2;

	assert.strictEqual(actual, expected);
});
