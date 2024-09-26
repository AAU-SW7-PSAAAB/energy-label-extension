#!/usr/bin/env node

import { parseArgs } from "node:util";
import fs from "fs-extra";
import glob from "tiny-glob";
import spawn from "nano-spawn";
import AdmZip from "adm-zip";

type BuildMode = "dev" | "prod";

const args = parseArgs({
	args: process.argv.slice(2),
	allowPositionals: true,
});

const buildMode = args.positionals[0] ?? ("dev" as BuildMode);

console.log(`Building extension in ${buildMode} mode.`);

const sourceDir = "source/";

const builds = [
	{
		id: "firefox",
		custom: async () => {
			// Firefox does not use the fallback PNG's and they bloat the zip file, so remove them
			const imageEntries = await fs.readdir("public/firefox/images");
			for (const imageEntry of imageEntries) {
				if (imageEntry.endsWith(".png") || imageEntry.endsWith(".md")) {
					await fs.remove("public/firefox/images/" + imageEntry);
				}
			}
		},
	},
	{
		id: "chrome",
		custom: async () => {
			const manifest = await fs.readJson("public/chrome/manifest.json");
			// Chrome does not support SVG icons, so use PNG instead
			for (const [key, path] of Object.entries(
				manifest.icons,
			) as string[][]) {
				manifest.icons[key] = path.replace(".svg", `-${key}.png`);
			}
			// Chrome does not need to know about Firefox-specific settings
			delete manifest.browser_specific_settings;
			await fs.writeJson("public/chrome/manifest.json", manifest, {
				spaces: "\t",
			});
		},
	},
	{
		id: "safari",
	},
];

const prodDebug = `
export default new Proxy({}, {
	get: () => (()=>{})
});
`;

await fs.emptyDir("public/");

await Promise.all(
	builds.map(async (build) => {
		const buildDir = `public/${build.id}/`;
		const buildZip = `public/${build.id}.zip`;

		await fs.emptyDir(buildDir);
		await fs.copy(sourceDir, buildDir);

		await build.custom?.();

		// Build the typescript project
		const tscArgs = ["--project", buildDir];
		if (buildMode === "dev") tscArgs.push("--sourceMap");
		await spawn("tsc", tscArgs);
		if (buildMode !== "dev") {
			for (const filePath of await glob(`${buildDir}**/*.ts`)) {
				await fs.remove(filePath);
			}
		}
		await fs.remove(`${buildDir}tsconfig.json`);

		// Replace the debugger
		if (buildMode !== "dev") {
			await fs.writeFile(`${buildDir}lib/debug.js`, prodDebug);
		}

		// Create zip file copies
		const zip = new AdmZip();
		zip.addLocalFolder(buildDir);
		zip.writeZip(buildZip);
	}),
);
