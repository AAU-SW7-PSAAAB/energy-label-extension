import { test } from "node:test";
import assert from "node:assert";

import * as cheerio from "cheerio";
import FormatPlugin from "../../source/plugins/format.ts";
import { Document, PluginInput } from "../../source/lib/pluginTypes.ts";
import type { RequestDetails } from "../../source/lib/communication.ts";

test("No media", async () => {
	const input = new PluginInput({
		network: {},
		document: new Document({
			css: undefined,
			dom: cheerio.load(`<p>Paragraph</p>`),
		}),
	});

	let actual: number | undefined;
	await FormatPlugin.analyze(async (result) => {
		actual = result.score;
	}, input);
	const expected = 100;

	assert.strictEqual(actual, expected);
});

test("One good format", async () => {
	const input = new PluginInput({
		network: {
			"https://example.com/image.avif": {
				url: "https://example.com/image.avif",
				type: "image",
				responseHeaders: [
					{ name: "content-type", value: "image/avif" },
				],
			} as RequestDetails,
		},
		document: new Document({
			css: undefined,
			dom: cheerio.load(`<img src="https://example.com/image.avif">`),
		}),
	});

	let actual: number | undefined;
	await FormatPlugin.analyze(async (result) => {
		actual = result.score;
	}, input);
	const expected = 100;

	assert.strictEqual(actual, expected);
});

test("One bad format", async () => {
	const input = new PluginInput({
		network: {
			"https://example.com/image.jpg": {
				url: "https://example.com/image.jpg",
				type: "image",
				responseHeaders: [
					{ name: "content-type", value: "image/jpeg" },
				],
			} as RequestDetails,
		},
		document: new Document({
			css: undefined,
			dom: cheerio.load(`<img src="https://example.com/image.jpg">`),
		}),
	});

	let actual: number | undefined;
	await FormatPlugin.analyze(async (result) => {
		actual = result.checks.find((check) => check.name === "Images")?.score;
	}, input);
	const expected = 25;

	assert.strictEqual(actual, expected);
});

test("One unknown format", async () => {
	const input = new PluginInput({
		network: {
			"https://example.com/image.psaaab": {
				url: "https://example.com/image.psaaab",
				type: "image",
			} as RequestDetails,
		},
		document: new Document({
			css: undefined,
			dom: cheerio.load(`<img src="https://example.com/image.psaaab">`),
		}),
	});

	let actual: number | undefined;
	await FormatPlugin.analyze(async (result) => {
		actual = result.checks.find(
			(check) => check.name === "Unknown files",
		)?.score;
	}, input);
	const expected = 0;

	assert.strictEqual(actual, expected);
});

test("Data URL", async () => {
	const input = new PluginInput({
		network: {},
		document: new Document({
			css: undefined,
			// SVG taken from https://css-tricks.com/lodge/svg/09-svg-data-uris/
			dom: cheerio.load(
				`<img src="data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve" height="100px" width="100px">%0A<g>%0A%09<path d="M28.1,36.6c4.6,1.9,12.2,1.6,20.9,1.1c8.9-0.4,19-0.9,28.9,0.9c6.3,1.2,11.9,3.1,16.8,6c-1.5-12.2-7.9-23.7-18.6-31.3   c-4.9-0.2-9.9,0.3-14.8,1.4C47.8,17.9,36.2,25.6,28.1,36.6z"/>%0A%09<path d="M70.3,9.8C57.5,3.4,42.8,3.6,30.5,9.5c-3,6-8.4,19.6-5.3,24.9c8.6-11.7,20.9-19.8,35.2-23.1C63.7,10.5,67,10,70.3,9.8z"/>%0A%09<path d="M16.5,51.3c0.6-1.7,1.2-3.4,2-5.1c-3.8-3.4-7.5-7-11-10.8c-2.1,6.1-2.8,12.5-2.3,18.7C9.6,51.1,13.4,50.2,16.5,51.3z"/>%0A%09<path d="M9,31.6c3.5,3.9,7.2,7.6,11.1,11.1c0.8-1.6,1.7-3.1,2.6-4.6c0.1-0.2,0.3-0.4,0.4-0.6c-2.9-3.3-3.1-9.2-0.6-17.6   c0.8-2.7,1.8-5.3,2.7-7.4c-5.2,3.4-9.8,8-13.3,13.7C10.8,27.9,9.8,29.7,9,31.6z"/>%0A%09<path d="M15.4,54.7c-2.6-1-6.1,0.7-9.7,3.4c1.2,6.6,3.9,13,8,18.5C13,69.3,13.5,61.8,15.4,54.7z"/>%0A%09<path d="M39.8,57.6C54.3,66.7,70,73,86.5,76.4c0.6-0.8,1.1-1.6,1.7-2.5c4.8-7.7,7-16.3,6.8-24.8c-13.8-9.3-31.3-8.4-45.8-7.7   c-9.5,0.5-17.8,0.9-23.2-1.7c-0.1,0.1-0.2,0.3-0.3,0.4c-1,1.7-2,3.4-2.9,5.1C28.2,49.7,33.8,53.9,39.8,57.6z"/>%0A%09<path d="M26.2,88.2c3.3,2,6.7,3.6,10.2,4.7c-3.5-6.2-6.3-12.6-8.8-18.5c-3.1-7.2-5.8-13.5-9-17.2c-1.9,8-2,16.4-0.3,24.7   C20.6,84.2,23.2,86.3,26.2,88.2z"/>%0A%09<path d="M30.9,73c2.9,6.8,6.1,14.4,10.5,21.2c15.6,3,32-2.3,42.6-14.6C67.7,76,52.2,69.6,37.9,60.7C32,57,26.5,53,21.3,48.6   c-0.6,1.5-1.2,3-1.7,4.6C24.1,57.1,27.3,64.5,30.9,73z"/>%0A</g>%0A</svg>">`,
			),
		}),
	});

	let actual: number | undefined;
	await FormatPlugin.analyze(async (result) => {
		actual = result.checks.find((check) => check.name === "Images")?.score;
	}, input);
	const expected = 100 / 2;

	assert.strictEqual(actual, expected);
});

test("Subtypes in content-type", async () => {
	const input = new PluginInput({
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
		document: new Document({
			css: undefined,
			dom: cheerio.load(`<img src="https://example.com/image.svg">
				<img src="https://example.com/image.gif">`),
		}),
	});

	let actual: number | undefined;
	await FormatPlugin.analyze(async (result) => {
		actual = result.checks.find((check) => check.name === "Images")?.score;
	}, input);
	const expected = (100 + 25) / 2;

	assert.strictEqual(actual, expected);
});

test("Parameters in content-type", async () => {
	const input = new PluginInput({
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
		document: new Document({
			css: undefined,
			dom: cheerio.load(`<img src="https://example.com/image.jpeg">`),
		}),
	});

	let actual: number | undefined;
	await FormatPlugin.analyze(async (result) => {
		actual = result.checks.find((check) => check.name === "Images")?.score;
	}, input);
	const expected = 25;

	assert.strictEqual(actual, expected);
});

test("Works for src", async () => {
	const input = new PluginInput({
		network: {
			"https://example.com/image.gif": {
				url: "https://example.com/image.gif",
				type: "image",
				responseHeaders: [{ name: "content-type", value: "image/gif" }],
			} as RequestDetails,
		},
		document: new Document({
			css: undefined,
			dom: cheerio.load(`<img src="https://example.com/image.gif">`),
		}),
	});

	let actual: number | undefined;
	await FormatPlugin.analyze(async (result) => {
		actual = result.checks.find((check) => check.name === "Images")?.score;
	}, input);
	const expected = 25;

	assert.strictEqual(actual, expected);
});

// TODO: this is not different from video not working, fix that.
test("Works for element source", async () => {
	const input = new PluginInput({
		network: {
			"https://example.com/video.webm": {
				url: "https://example.com/video.webm",
				type: "media",
				responseHeaders: [
					{ name: "content-type", value: "video/webm" },
				],
			} as RequestDetails,
		},
		document: new Document({
			css: undefined,
			dom: cheerio.load(
				`<video><source src="https://example.com/video.webm"></video>`,
			),
		}),
	});

	let actual: number | undefined;
	await FormatPlugin.analyze(async (result) => {
		actual = result.checks.find((check) => check.name === "Videos")?.score;
	}, input);
	const expected = 100;

	assert.strictEqual(actual, expected);
});

test("Works for srcset", async () => {
	const input = new PluginInput({
		network: {
			"https://example.com/image.png": {
				url: "https://example.com/image.png",
				type: "image",
				responseHeaders: [{ name: "content-type", value: "image/png" }],
			} as RequestDetails,
		},
		document: new Document({
			css: undefined,
			dom: cheerio.load(
				`<img srcset="https://example.com/image.png 1200w, https://example.com/image.png 640w">`,
			),
		}),
	});

	let actual: number | undefined;
	await FormatPlugin.analyze(async (result) => {
		actual = result.checks.find((check) => check.name === "Images")?.score;
	}, input);
	const expected = 25;

	assert.strictEqual(actual, expected);
});

test("Works for src and srcset together", async () => {
	const input = new PluginInput({
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
		document: new Document({
			css: undefined,
			dom: cheerio.load(
				`<picture>
					<source media="(min-width:650px)" srcset="img_pink_flowers.jpg">
					<source media="(min-width:465px)" srcset="img_white_flowers.webp">
					<img src="img_orange_flowers.avif" alt="Flowers" style="width:auto;">
				</picture>`,
			),
		}),
	});

	let actual: number | undefined;
	await FormatPlugin.analyze(async (result) => {
		actual = result.checks.find((check) => check.name === "Images")?.score;
	}, input);
	const expected = (25 + 50 + 100) / 3;

	assert.strictEqual(actual, expected);
});

test("Works for src and srcset together but unused source", async () => {
	const input = new PluginInput({
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
		document: new Document({
			css: undefined,
			dom: cheerio.load(
				`<picture>
					<source media="(min-width:650px)" srcset="img_pink_flowers.jpg">
					<source media="(min-width:465px)" srcset="img_white_flowers.webp">
					<img src="img_orange_flowers.avif" alt="Flowers" style="width:auto;">
				</picture>`,
			),
		}),
	});

	let actual: number | undefined;
	await FormatPlugin.analyze(async (result) => {
		actual = result.checks.find((check) => check.name === "Images")?.score;
	}, input);
	const expected = (25 + 100) / 2;

	assert.strictEqual(actual, expected);
});

// TODO: this is not different from audio not working, fix that.
test("Works for audio", async () => {
	const input = new PluginInput({
		network: {
			"https://example.com/audio.mp3": {
				url: "https://example.com/audio.mp3",
				type: "media",
				responseHeaders: [{ name: "content-type", value: "audio/mp3" }],
			} as RequestDetails,
		},
		document: new Document({
			css: undefined,
			dom: cheerio.load(
				`<audio><source src="https://example.com/audio.mp3"></audio>`,
			),
		}),
	});

	let actual: number | undefined;
	await FormatPlugin.analyze(async (result) => {
		actual = result.checks.find(
			(check) => check.name === "Font files",
		)?.score;
	}, input);
	const expected = 100;

	assert.strictEqual(actual, expected);
});

test("Works for font", async () => {
	const input = new PluginInput({
		network: {
			"https://example.com/font.woff": {
				url: "https://example.com/font.woff",
				type: "font",
				responseHeaders: [{ name: "content-type", value: "font/woff" }],
			} as RequestDetails,
		},
		document: new Document({
			css: undefined,
			dom: cheerio.load(
				`<link rel="stylesheet" href="https://example.com/font.woff">`,
			),
		}),
	});

	let actual: number | undefined;
	await FormatPlugin.analyze(async (result) => {
		actual = result.checks.find(
			(check) => check.name === "Font files",
		)?.score;
	}, input);
	const expected = 50;

	assert.strictEqual(actual, expected);
});

test("Works for CSS URLs with quotation", async () => {
	const input = new PluginInput({
		network: {
			"https://example.com/image.png": {
				url: "https://example.com/image.png",
				type: "image",
				responseHeaders: [{ name: "content-type", value: "image/png" }],
			} as RequestDetails,
		},
		document: new Document({
			css: `body { background-image: url("https://example.com/image.png"); }`,
			dom: cheerio.load(`<p>Paragraph</p>`),
		}),
	});

	let actual: number | undefined;
	await FormatPlugin.analyze(async (result) => {
		actual = result.checks.find((check) => check.name === "Images")?.score;
	}, input);
	const expected = 25;

	assert.strictEqual(actual, expected);
});

test("Works for CSS URLs without quotation", async () => {
	const input = new PluginInput({
		network: {
			"https://example.com/image.png": {
				url: "https://example.com/image.png",
				type: "image",
				responseHeaders: [{ name: "content-type", value: "image/png" }],
			} as RequestDetails,
		},
		document: new Document({
			css: `body { background-image: url(https://example.com/image.png); }`,
			dom: cheerio.load(`<p>Paragraph</p>`),
		}),
	});

	let actual: number | undefined;
	await FormatPlugin.analyze(async (result) => {
		actual = result.checks.find((check) => check.name === "Images")?.score;
	}, input);
	const expected = 25;

	assert.strictEqual(actual, expected);
});

test("One good format and one bad format", async () => {
	const input = new PluginInput({
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
		document: new Document({
			css: undefined,
			dom: cheerio.load(`<img src="https://example.com/image.avif">
				<img src="https://example.com/image.jpg">`),
		}),
	});

	let actual: number | undefined;
	await FormatPlugin.analyze(async (result) => {
		actual = result.checks.find((check) => check.name === "Images")?.score;
	}, input);
	const expected = (100 + 25) / 2;

	assert.strictEqual(actual, expected);
});

test("Valid redirected URL", async () => {
	const input = new PluginInput({
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
		document: new Document({
			css: undefined,
			dom: cheerio.load(`<img src="https://example.com/video.mp4">
				<img src="https://example.com/image.png">`),
		}),
	});

	let actualVideos: number | undefined;
	let actualImages: number | undefined;
	await FormatPlugin.analyze(async (result) => {
		actualVideos = result.checks.find(
			(check) => check.name === "Videos",
		)?.score;
		actualImages = result.checks.find(
			(check) => check.name === "Images",
		)?.score;
	}, input);
	const expectedVideos = 100;
	const expectedImages = 25;

	assert.strictEqual(actualVideos, expectedVideos);
	assert.strictEqual(actualImages, expectedImages);
});

// TODO: this test is not different from the "valid test" fix that.
test("Invalid redirected URL", async () => {
	const input = new PluginInput({
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
		document: new Document({
			css: undefined,
			dom: cheerio.load(`<img src="https://example.com/video.mp4">
				<img src="https://example.com/image.png">`),
		}),
	});

	let actualVideos: number | undefined;
	let actualImages: number | undefined;
	await FormatPlugin.analyze(async (result) => {
		actualVideos = result.checks.find(
			(check) => check.name === "Videos",
		)?.score;
		actualImages = result.checks.find(
			(check) => check.name === "Images",
		)?.score;
	}, input);
	// The video.mp4 is not found in network requests, so it is not counted
	const expectedVideos = 100;
	const expectedImages = 25;

	assert.strictEqual(actualVideos, expectedVideos);
	assert.strictEqual(actualImages, expectedImages);
});

test("Detects redirect loop", async () => {
	const input = new PluginInput({
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
		document: new Document({
			css: undefined,
			dom: cheerio.load(`<img src="https://example.com/video.mp4">
				<img src="https://example.com/image.png">`),
		}),
	});

	let actualVideos: number | undefined;
	let actualImages: number | undefined;
	await FormatPlugin.analyze(async (result) => {
		actualVideos = result.checks.find(
			(check) => check.name === "Videos",
		)?.score;
		actualImages = result.checks.find(
			(check) => check.name === "Images",
		)?.score;
	}, input);
	// Infinite loop detected, so the video.mp4 is ignored, but plugin continues
	const expectedVideos = 100;
	const expectedImages = 25;

	assert.strictEqual(actualVideos, expectedVideos);
	assert.strictEqual(actualImages, expectedImages);
});

test("Fallback from content-type to URL", async () => {
	const input = new PluginInput({
		network: {
			"https://example.com/image.jxl": {
				url: "https://example.com/image.jxl",
				type: "image",
			} as RequestDetails,
		},
		document: new Document({
			css: undefined,
			dom: cheerio.load(`<img src="https://example.com/image.jxl">`),
		}),
	});

	let actual: number | undefined;
	await FormatPlugin.analyze(async (result) => {
		actual = result.checks.find((check) => check.name === "Images")?.score;
	}, input);
	const expected = 75;

	assert.strictEqual(actual, expected);
});

test("Fallback from content-type to URL with parameters and fragments", async () => {
	const input = new PluginInput({
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
		document: new Document({
			css: undefined,
			dom: cheerio.load(`<img src="https://example.com/image.jxl?key=value">
				<img src="https://example.com/image.webp#frag">`),
		}),
	});

	let actual: number | undefined;
	await FormatPlugin.analyze(async (result) => {
		actual = result.checks.find((check) => check.name === "Images")?.score;
	}, input);
	const expected = (75 + 50) / 2;

	assert.strictEqual(actual, expected);
});
