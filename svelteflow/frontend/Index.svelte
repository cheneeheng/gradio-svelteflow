<svelte:options accessors={true} />

<script lang="ts">
  import {
    Block,
    BlockTitle,
    FullscreenButton,
    IconButtonWrapper,
  } from "@gradio/atoms";
  import type { LoadingStatus } from "@gradio/statustracker";
  import { StatusTracker } from "@gradio/statustracker";
  import type { Gradio } from "@gradio/utils";
  import { SvelteFlowProvider } from "@xyflow/svelte";
  import GraphUI from "./graph/GraphUI.svelte";
  import type { GraphEvents } from "./graph/types/gradio";
  import type { GraphValue } from "./graph/types/schemas";
  // Hack: Polyfill process and Buffer at runtime
  import { Buffer } from "buffer";
  (globalThis as any).process = (globalThis as any).process || { env: {} };
  (globalThis as any).Buffer = (globalThis as any).Buffer || Buffer;

  export let gradio: Gradio<GraphEvents>;
  export let label = "Svelte-Flow";
  export let info: string | undefined = undefined;
  export let elem_id = "";
  export let elem_classes: string[] = [];
  export let visible: boolean | "hidden" = true;
  export let value: GraphValue | null = null;
  export let show_label: boolean = false;
  export let scale: number | null = null;
  export let min_width: number | undefined = undefined;
  export let loading_status: LoadingStatus | undefined = undefined;
  export let interactive: boolean = false;
  export let show_fullscreen_button = true;
  export let toolbar_size: "extra-small" | "small" | "medium" | "large" =
    "medium";
  export let canvas_min_height: string = "500px";
  export let enable_virtualization: boolean = false;
  export let enable_grid_snap: boolean = false;
  export let grid_size: number = 20;
  export let layout_engine: "dagre" | "elkjs" = "dagre";
  export let toolbar_visibility: Record<string, boolean> = {};
  export let node_size_scale: number = 1;
  export let node_font_size: number = 14;
  export let edge_width: number = 2;
  export let edge_label_font_size: number = 12;

  let fullscreen = false;

  $: graph_value = value ?? {
    nodes: [],
    edges: [],
    loaded: false,
    zoomToNodeName: null,
  };
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

  <SvelteFlowProvider>
    <GraphUI
      {gradio}
      bind:value={graph_value}
      {interactive}
      {toolbar_size}
      {canvas_min_height}
      {enable_virtualization}
      {enable_grid_snap}
      {grid_size}
      {layout_engine}
      {toolbar_visibility}
      {node_size_scale}
      {node_font_size}
      {edge_width}
      {edge_label_font_size}
    />
  </SvelteFlowProvider>
</Block>
