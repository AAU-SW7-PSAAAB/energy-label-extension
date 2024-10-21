#!/usr/bin/env node

import fs from "fs-extra";
import AdmZip from "adm-zip";

console.log(`Building extension for publishing.`);

const sourceDir = "dist/";
const outDir = "publish/";

const builds = [
	{
		id: "firefox",
		custom: async () => {
			// Firefox does not use the fallback PNG's and they bloat the zip file, so remove them
			const imageEntries = await fs.readdir(`${outDir}firefox/images`);
			for (const imageEntry of imageEntries) {
				if (imageEntry.endsWith(".png") || imageEntry.endsWith(".md")) {
					await fs.remove(`${outDir}firefox/images/${imageEntry}`);
				}
			}
		},
	},
	{
		id: "chrome",
		custom: async () => {
			const manifest = await fs.readJson(`${outDir}chrome/manifest.json`);
			// Chrome does not support SVG icons, so use PNG instead
			for (const [key, path] of Object.entries(
				manifest.icons,
			) as string[][]) {
				manifest.icons[key] = path.replace(".svg", `-${key}.png`);
			}
			// Chrome does not need to know about Firefox-specific settings
			delete manifest.browser_specific_settings;
			manifest.background = {
				service_worker: "background.js",
				type: "module",
			};
			await fs.writeJson(`${outDir}chrome/manifest.json`, manifest, {
				spaces: "\t",
			});
		},
	},
	{
		id: "safari",
	},
];

await fs.emptyDir(outDir);

await Promise.all(
	builds.map(async (build) => {
		const buildDir = `${outDir}${build.id}/`;
		const buildZip = `${outDir}${build.id}.zip`;

		await fs.emptyDir(buildDir);
		await fs.copy(sourceDir, buildDir);

		await build.custom?.();

		// Create zip file copies
		const zip = new AdmZip();
		zip.addLocalFolder(buildDir);
		zip.writeZip(buildZip);
	}),
);
