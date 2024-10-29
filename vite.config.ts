import { defineConfig, PluginOption } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { exec } from "child_process";

// Run post run build script
const vitePlugin: PluginOption = {
	name: "Post build script",
	apply: "build",
	closeBundle() {
		return new Promise<void>((resolve, reject) => {
			exec("vite-node bin/build.ts", (error, stdout, stderr) => {
				if (error) {
					console.error(
						`Error running custom build step: ${error.message}`,
					);
					return reject(error);
				}
				if (stderr) {
					console.error(`stderr: ${stderr}`);
				}
				console.log(stdout);
				resolve();
			});
		});
	},
};

export default defineConfig({
	plugins: [svelte(), vitePlugin],
	build: {
		outDir: "dist",
		assetsDir: "assets",
		rollupOptions: {
			input: {
				options: "./source/options.html", // Options page (Options.svelte)
				popup: "./source/popup.html", // Popup page (Popup.svelte)
				devtools: "./source/devtools.html", // Devtools page (Devtools.svelte)
				devtoolsLoader: "./source/devtoolsLoader.html", // DevtoolsLoader page (DevtoolsLoader.svelte)
				content: "./source/content.ts", // Content script
				contentLoader: "./source/contentLoader.ts", // Content script main function
				background: "./source/background.ts", // Background script
			},
			output: {
				entryFileNames: (chunk) => {
					return chunk.name.includes("content") ||
						chunk.name === "background"
						? "[name].js"
						: "assets/[name].js";
				},
				chunkFileNames: "assets/[name].js",
				assetFileNames: "assets/[name].[ext]",
			},
		},

		emptyOutDir: true,
	},
});
