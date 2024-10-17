import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
	plugins: [svelte()],
	build: {
		rollupOptions: {
			input: {
				options: "source/options.html", // Options page (Options.svelte)
				popup: "source/popup.html", // Popup page (Popup.svelte)
				content: "source/content-script.ts", // Content script (content-script.ts)
			},
			output: {
				entryFileNames: (chunkInfo) => {
					if (chunkInfo.name === "content") {
						return "assets/content-script.js";
					}
					return `assets/[name].js`;
				},
			},
		},
	},
});
