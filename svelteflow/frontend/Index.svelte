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
  import GraphUI from "./graph/GraphUI.svelte";
  import type { CustomNode, CustomEdge } from "./graph/types/schemas";

  // Hack: Polyfill process and Buffer at runtime
  import { Buffer } from "buffer";
  (globalThis as any).process = (globalThis as any).process || { env: {} };
  (globalThis as any).Buffer = (globalThis as any).Buffer || Buffer;

  export let gradio: Gradio<{
    change: { nodes: CustomNode[]; edges: CustomEdge[] };
    select: { nodes: CustomNode[]; edges: CustomEdge[] };
    submit: { nodes: CustomNode[]; edges: CustomEdge[] };
    clear_status: LoadingStatus;
  }>;
  export let label = "Svelte-Flow";
  export let info: string | undefined = undefined;
  export let elem_id = "";
  export let elem_classes: string[] = [];
  export let visible: boolean | "hidden" = true;
  export let value: { nodes: CustomNode[]; edges: CustomEdge[] } | null = null;
  export let show_label: boolean = false;
  export let scale: number | null = null;
  export let min_width: number | undefined = undefined;
  export let loading_status: LoadingStatus | undefined = undefined;
  export let interactive: boolean = false;
  export let submit_btn: boolean = false;
  export let show_fullscreen_button = true;
  export let canvas_min_height: string = "500px";

  let fullscreen = false;

  $: graph_value = value ?? { nodes: [], edges: [] };
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

  <GraphUI
    bind:value={graph_value}
    {interactive}
    {gradio}
    {canvas_min_height}
  />
</Block>
