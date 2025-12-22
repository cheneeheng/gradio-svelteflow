import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  resolve: {
    alias: {
      $shared: path.resolve(__dirname, "../svelteflow/frontend/graph"),
    },
  },
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
    fs: {
      allow: [
        "..", // allow parent directory
        path.resolve(__dirname, "../svelteflow/frontend"),
      ],
    },
  },
});
