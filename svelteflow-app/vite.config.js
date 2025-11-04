import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

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
});
