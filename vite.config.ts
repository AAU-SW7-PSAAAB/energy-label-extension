import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
	plugins: [svelte()],
	build: {
		rollupOptions: {
			input: {
				main: "index.html", // Main page (App.svelte)
				popup: "popup.html", // Popup page (Popup.svelte)
			},
		},
	},
});
