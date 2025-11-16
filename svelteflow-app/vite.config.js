import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "path";

export default defineConfig({
  plugins: [svelte()],
  server: {
    // // optional: auto-open browser
    // open: true,
    // // optional: customize HMR
    // hmr: {
    //   overlay: true,
    // },
    watch: {
      usePolling: true,
    },
  },
  resolve: {
    alias: {
      "@graph-ui": path.resolve(__dirname, "../shared-graph-ui"),
    },
  },
});
