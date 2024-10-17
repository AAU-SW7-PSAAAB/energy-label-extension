import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
	plugins: [svelte()],
	build: {
		rollupOptions: {
			input: {
				options: "options.html", // Options page (Options.svelte)
				popup: "popup.html", // Popup page (Popup.svelte)
			},
		},
	},
});
