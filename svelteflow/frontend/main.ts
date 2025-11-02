import Index from "./Index.svelte";

const target = document.body;

let app: Index | undefined;

if (target) {
  app = new Index({
    target,
    props: {},
  });
} else {
  console.error("No mount target found");
}

export default app;
