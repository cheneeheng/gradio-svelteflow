<svelte:options accessors={true} />

<script lang="ts">
  import type { Gradio } from "@gradio/utils";
  import {
    Block,
    BlockTitle,
    FullscreenButton,
    IconButtonWrapper,
  } from "@gradio/atoms";
  import { StatusTracker } from "@gradio/statustracker";
  import type { LoadingStatus } from "@gradio/statustracker";
  import { SvelteFlow, Controls } from "@xyflow/svelte";
  import type { Node, Edge } from "@xyflow/svelte";
  import "@xyflow/svelte/dist/style.css";
  import { writable } from "svelte/store";

  export let gradio: Gradio<{
    change: { nodes: Node[]; edges: Edge[] };
    select: { nodes: Node[]; edges: Edge[] };
    submit: { nodes: Node[]; edges: Edge[] };
    clear_status: LoadingStatus;
  }>;
  export let label = "Svelte-Flow";
  export let info: string | undefined = undefined;
  export let elem_id = "";
  export let elem_classes: string[] = [];
  export let visible: boolean | "hidden" = true;
  export let value: { nodes: Node[]; edges: Edge[] } | null = null;
  export let show_label: boolean = false;
  export let scale: number | null = null;
  export let min_width: number | undefined = undefined;
  export let loading_status: LoadingStatus | undefined = undefined;
  export let interactive: boolean = false;
  export let submit_btn: boolean = false;
  export let show_fullscreen_button = true;
  let fullscreen = false;

  const nodes = writable<Node[]>([]);
  const edges = writable<Edge[]>([]);

  // Sync from parent -> local stores
  $: if (
    value &&
    (JSON.stringify(value.nodes) !== JSON.stringify($nodes) ||
      JSON.stringify(value.edges) !== JSON.stringify($edges))
  ) {
    nodes.set(value.nodes);
    edges.set(value.edges);
  }

  // Sync from local stores -> parent
  $: {
    const new_value = { nodes: $nodes, edges: $edges };
    if (!value || JSON.stringify(new_value) !== JSON.stringify(value)) {
      gradio.dispatch("change", new_value);
    }
  }

  let lastDispatched: { nodes: Node[]; edges: Edge[] } | null = null;

  $: {
    const new_value = { nodes: $nodes, edges: $edges };
    if (!isEqual(new_value, value) && !isEqual(new_value, lastDispatched)) {
      gradio.dispatch("change", new_value);
      lastDispatched = new_value;
    }
  }

  function handleNodeClick(
    e: CustomEvent<{ node: Node; event: MouseEvent | TouchEvent }>
  ) {
    if (interactive && e.detail.event instanceof MouseEvent) {
      gradio.dispatch("select", { nodes: [e.detail.node], edges: [] });
    }
  }

  function handleEdgeClick(
    e: CustomEvent<{ edge: Edge; event: MouseEvent | TouchEvent }>
  ) {
    if (interactive && e.detail.event instanceof MouseEvent) {
      gradio.dispatch("select", { nodes: [], edges: [e.detail.edge] });
    }
  }

  function handleSubmit() {
    gradio.dispatch("submit", { nodes: $nodes, edges: $edges });
  }
</script>

<Block
  {visible}
  {elem_id}
  {elem_classes}
  {scale}
  {min_width}
  allow_overflow={false}
  padding={true}
  bind:fullscreen
>
  <BlockTitle {show_label} {info}>{label}</BlockTitle>
  {#if show_fullscreen_button}
    <IconButtonWrapper>
      <FullscreenButton
        {fullscreen}
        on:fullscreen={({ detail }) => {
          fullscreen = detail;
        }}
      />
    </IconButtonWrapper>
  {/if}
  {#if loading_status}
    <StatusTracker
      autoscroll={gradio.autoscroll}
      i18n={gradio.i18n}
      {...loading_status}
      on:clear_status={() => gradio.dispatch("clear_status", loading_status)}
    />
  {/if}

  <div style="height: 500px">
    <SvelteFlow
      {nodes}
      {edges}
      on:nodeclick={handleNodeClick}
      on:edgeclick={handleEdgeClick}
      nodesDraggable={interactive}
      nodesConnectable={interactive}
      elementsSelectable={interactive}
    >
      <Controls />
    </SvelteFlow>
  </div>
  {#if submit_btn}
    <div style="display: flex; justify-content: center; margin-top: 10px;">
      <button on:click={handleSubmit}>Submit</button>
    </div>
  {/if}
</Block>
