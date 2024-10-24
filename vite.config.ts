import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
	plugins: [svelte()],
	build: {
		outDir: "dist",
		assetsDir: "assets",
		rollupOptions: {
			input: {
				options: "./source/options.html", // Options page (Options.svelte)
				popup: "./source/popup.html", // Popup page (Popup.svelte)
				devtools: "devtools.html", // Devtools page (Devtools.svelte)
				devtoolsLoader: "devtoolsLoader.html", // DevtoolsLoader page (DevtoolsLoader.svelte)
				content: "./source/content.ts", // Content script
				contentLoader: "./source/contentLoader.ts", // Content script main function
				background: "./source/background.ts", // Background script
			},
			output: {
				entryFileNames: (chunk) => {
					if (
						chunk.name === "content" ||
						chunk.name === "contentLoader"
					) {
						return "[name].js";
					}

					return chunk.name === "background"
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
