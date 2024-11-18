// vite.config.ts
import { defineConfig } from "file:///C:/Users/st/OneDrive/Documents/sw7/project/energy-label-extension/node_modules/vite/dist/node/index.js";
import { svelte } from "file:///C:/Users/st/OneDrive/Documents/sw7/project/energy-label-extension/node_modules/@sveltejs/vite-plugin-svelte/src/index.js";
import { exec } from "child_process";
var postBuildScript = {
  name: "Post build script",
  apply: "build",
  closeBundle() {
    return new Promise((resolve, reject) => {
      exec("vite-node bin/build.ts", (error, stdout, stderr) => {
        if (error) {
          console.error(
            `Error running custom build step: ${error.message}`
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
  }
};
var vite_config_default = defineConfig({
  plugins: [svelte(), postBuildScript],
  build: {
    minify: false,
    outDir: "dist",
    assetsDir: "assets",
    rollupOptions: {
      input: {
        options: "./source/options.html",
        // Options page (Options.svelte)
        popup: "./source/popup.html",
        // Popup page (Popup.svelte)
        devtools: "./source/devtools.html",
        // Devtools page (Devtools.svelte)
        devtoolsLoader: "./source/devtoolsLoader.html",
        // DevtoolsLoader page (DevtoolsLoader.svelte)
        content: "./source/content.ts",
        // Content script
        contentLoader: "./source/contentLoader.ts",
        // Content script main function
        background: "./source/background.ts"
        // Background script
      },
      output: {
        entryFileNames: (chunk) => {
          return chunk.name.includes("content") || chunk.name === "background" ? "[name].js" : "assets/[name].js";
        },
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name].[ext]"
      }
    },
    emptyOutDir: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxzdFxcXFxPbmVEcml2ZVxcXFxEb2N1bWVudHNcXFxcc3c3XFxcXHByb2plY3RcXFxcZW5lcmd5LWxhYmVsLWV4dGVuc2lvblwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcc3RcXFxcT25lRHJpdmVcXFxcRG9jdW1lbnRzXFxcXHN3N1xcXFxwcm9qZWN0XFxcXGVuZXJneS1sYWJlbC1leHRlbnNpb25cXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL3N0L09uZURyaXZlL0RvY3VtZW50cy9zdzcvcHJvamVjdC9lbmVyZ3ktbGFiZWwtZXh0ZW5zaW9uL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBQbHVnaW5PcHRpb24gfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHsgc3ZlbHRlIH0gZnJvbSBcIkBzdmVsdGVqcy92aXRlLXBsdWdpbi1zdmVsdGVcIjtcbmltcG9ydCB7IGV4ZWMgfSBmcm9tIFwiY2hpbGRfcHJvY2Vzc1wiO1xuXG4vLyBSdW4gcG9zdCBydW4gYnVpbGQgc2NyaXB0XG5jb25zdCBwb3N0QnVpbGRTY3JpcHQ6IFBsdWdpbk9wdGlvbiA9IHtcblx0bmFtZTogXCJQb3N0IGJ1aWxkIHNjcmlwdFwiLFxuXHRhcHBseTogXCJidWlsZFwiLFxuXHRjbG9zZUJ1bmRsZSgpIHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdFx0ZXhlYyhcInZpdGUtbm9kZSBiaW4vYnVpbGQudHNcIiwgKGVycm9yLCBzdGRvdXQsIHN0ZGVycikgPT4ge1xuXHRcdFx0XHRpZiAoZXJyb3IpIHtcblx0XHRcdFx0XHRjb25zb2xlLmVycm9yKFxuXHRcdFx0XHRcdFx0YEVycm9yIHJ1bm5pbmcgY3VzdG9tIGJ1aWxkIHN0ZXA6ICR7ZXJyb3IubWVzc2FnZX1gLFxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0cmV0dXJuIHJlamVjdChlcnJvcik7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHN0ZGVycikge1xuXHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoYHN0ZGVycjogJHtzdGRlcnJ9YCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y29uc29sZS5sb2coc3Rkb3V0KTtcblx0XHRcdFx0cmVzb2x2ZSgpO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdH0sXG59O1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuXHRwbHVnaW5zOiBbc3ZlbHRlKCksIHBvc3RCdWlsZFNjcmlwdF0sXG5cdGJ1aWxkOiB7XG5cdFx0bWluaWZ5OiBmYWxzZSxcblx0XHRvdXREaXI6IFwiZGlzdFwiLFxuXHRcdGFzc2V0c0RpcjogXCJhc3NldHNcIixcblx0XHRyb2xsdXBPcHRpb25zOiB7XG5cdFx0XHRpbnB1dDoge1xuXHRcdFx0XHRvcHRpb25zOiBcIi4vc291cmNlL29wdGlvbnMuaHRtbFwiLCAvLyBPcHRpb25zIHBhZ2UgKE9wdGlvbnMuc3ZlbHRlKVxuXHRcdFx0XHRwb3B1cDogXCIuL3NvdXJjZS9wb3B1cC5odG1sXCIsIC8vIFBvcHVwIHBhZ2UgKFBvcHVwLnN2ZWx0ZSlcblx0XHRcdFx0ZGV2dG9vbHM6IFwiLi9zb3VyY2UvZGV2dG9vbHMuaHRtbFwiLCAvLyBEZXZ0b29scyBwYWdlIChEZXZ0b29scy5zdmVsdGUpXG5cdFx0XHRcdGRldnRvb2xzTG9hZGVyOiBcIi4vc291cmNlL2RldnRvb2xzTG9hZGVyLmh0bWxcIiwgLy8gRGV2dG9vbHNMb2FkZXIgcGFnZSAoRGV2dG9vbHNMb2FkZXIuc3ZlbHRlKVxuXHRcdFx0XHRjb250ZW50OiBcIi4vc291cmNlL2NvbnRlbnQudHNcIiwgLy8gQ29udGVudCBzY3JpcHRcblx0XHRcdFx0Y29udGVudExvYWRlcjogXCIuL3NvdXJjZS9jb250ZW50TG9hZGVyLnRzXCIsIC8vIENvbnRlbnQgc2NyaXB0IG1haW4gZnVuY3Rpb25cblx0XHRcdFx0YmFja2dyb3VuZDogXCIuL3NvdXJjZS9iYWNrZ3JvdW5kLnRzXCIsIC8vIEJhY2tncm91bmQgc2NyaXB0XG5cdFx0XHR9LFxuXHRcdFx0b3V0cHV0OiB7XG5cdFx0XHRcdGVudHJ5RmlsZU5hbWVzOiAoY2h1bmspID0+IHtcblx0XHRcdFx0XHRyZXR1cm4gY2h1bmsubmFtZS5pbmNsdWRlcyhcImNvbnRlbnRcIikgfHxcblx0XHRcdFx0XHRcdGNodW5rLm5hbWUgPT09IFwiYmFja2dyb3VuZFwiXG5cdFx0XHRcdFx0XHQ/IFwiW25hbWVdLmpzXCJcblx0XHRcdFx0XHRcdDogXCJhc3NldHMvW25hbWVdLmpzXCI7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGNodW5rRmlsZU5hbWVzOiBcImFzc2V0cy9bbmFtZV0uanNcIixcblx0XHRcdFx0YXNzZXRGaWxlTmFtZXM6IFwiYXNzZXRzL1tuYW1lXS5bZXh0XVwiLFxuXHRcdFx0fSxcblx0XHR9LFxuXG5cdFx0ZW1wdHlPdXREaXI6IHRydWUsXG5cdH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBcVksU0FBUyxvQkFBa0M7QUFDaGIsU0FBUyxjQUFjO0FBQ3ZCLFNBQVMsWUFBWTtBQUdyQixJQUFNLGtCQUFnQztBQUFBLEVBQ3JDLE1BQU07QUFBQSxFQUNOLE9BQU87QUFBQSxFQUNQLGNBQWM7QUFDYixXQUFPLElBQUksUUFBYyxDQUFDLFNBQVMsV0FBVztBQUM3QyxXQUFLLDBCQUEwQixDQUFDLE9BQU8sUUFBUSxXQUFXO0FBQ3pELFlBQUksT0FBTztBQUNWLGtCQUFRO0FBQUEsWUFDUCxvQ0FBb0MsTUFBTSxPQUFPO0FBQUEsVUFDbEQ7QUFDQSxpQkFBTyxPQUFPLEtBQUs7QUFBQSxRQUNwQjtBQUNBLFlBQUksUUFBUTtBQUNYLGtCQUFRLE1BQU0sV0FBVyxNQUFNLEVBQUU7QUFBQSxRQUNsQztBQUNBLGdCQUFRLElBQUksTUFBTTtBQUNsQixnQkFBUTtBQUFBLE1BQ1QsQ0FBQztBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0Y7QUFDRDtBQUVBLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzNCLFNBQVMsQ0FBQyxPQUFPLEdBQUcsZUFBZTtBQUFBLEVBQ25DLE9BQU87QUFBQSxJQUNOLFFBQVE7QUFBQSxJQUNSLFFBQVE7QUFBQSxJQUNSLFdBQVc7QUFBQSxJQUNYLGVBQWU7QUFBQSxNQUNkLE9BQU87QUFBQSxRQUNOLFNBQVM7QUFBQTtBQUFBLFFBQ1QsT0FBTztBQUFBO0FBQUEsUUFDUCxVQUFVO0FBQUE7QUFBQSxRQUNWLGdCQUFnQjtBQUFBO0FBQUEsUUFDaEIsU0FBUztBQUFBO0FBQUEsUUFDVCxlQUFlO0FBQUE7QUFBQSxRQUNmLFlBQVk7QUFBQTtBQUFBLE1BQ2I7QUFBQSxNQUNBLFFBQVE7QUFBQSxRQUNQLGdCQUFnQixDQUFDLFVBQVU7QUFDMUIsaUJBQU8sTUFBTSxLQUFLLFNBQVMsU0FBUyxLQUNuQyxNQUFNLFNBQVMsZUFDYixjQUNBO0FBQUEsUUFDSjtBQUFBLFFBQ0EsZ0JBQWdCO0FBQUEsUUFDaEIsZ0JBQWdCO0FBQUEsTUFDakI7QUFBQSxJQUNEO0FBQUEsSUFFQSxhQUFhO0FBQUEsRUFDZDtBQUNELENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
