import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import css from "rollup-plugin-css-only";
import replace from "@rollup/plugin-replace";
import typescript from "@rollup/plugin-typescript";
import sveltePreprocess from "svelte-preprocess";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const production = !process.env.ROLLUP_WATCH;

export default {
  input: path.resolve(__dirname, "main.ts"),
  output: {
    sourcemap: true,
    format: "iife",
    name: "app",
    file: path.resolve(
      __dirname,
      "../backend/gradio_svelteflow/templates/component/index.js"
    ),
  },
  external: [
    "@gradio/atoms",
    "@gradio/statustracker",
    "@gradio/icons",
    "@gradio/utils",
  ],
  plugins: [
    svelte({
      preprocess: sveltePreprocess({ sourceMap: !production }),
      compilerOptions: { dev: !production },
    }),
    css({ output: "index.css" }),
    resolve({
      browser: true,
      dedupe: ["svelte"],
      exportConditions: ["svelte"],
    }),
    commonjs(),
    typescript({
      tsconfig: "./tsconfig.json",
      sourceMap: !production,
      noEmitOnError: false,
      outputToFilesystem: false,
    }),
    replace({
      preventAssignment: true,
      "process.env.NODE_ENV": JSON.stringify(
        production ? "production" : "development"
      ),
    }),
  ],
  watch: { clearScreen: false },
};
