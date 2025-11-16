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
  import { createEventDispatcher } from "svelte";
  import GraphUI from "../../../shared-graph-ui/GraphUI.svelte";
  import type { Graph } from "../../../shared-graph-ui/types/schemas";

  // Hack: Polyfill process and Buffer at runtime
  import { Buffer } from "buffer";
  (globalThis as any).process = (globalThis as any).process || { env: {} };
  (globalThis as any).Buffer = (globalThis as any).Buffer || Buffer;

  export let gradio: Gradio<{
    change: Graph;
    select: { nodes: string[]; edges: string[] };
    submit: Graph;
    clear_status: LoadingStatus;
  }>;
  export let label = "Svelte-Flow";
  export let info: string | undefined = undefined;
  export let elem_id = "";
  export let elem_classes: string[] = [];
  export let visible: boolean | "hidden" = true;
  export let value: Graph | null = null;
  export let show_label: boolean = false;
  export let scale: number | null = null;
  export let min_width: number | undefined = undefined;
  export let loading_status: LoadingStatus | undefined = undefined;
  export let interactive: boolean = false;
  export let submit_btn: boolean = false;
  export let show_fullscreen_button = true;

  let fullscreen = false;
  const dispatch = createEventDispatcher();

  $: {
    if (value) {
      gradio.dispatch("change", value);
    }
  }

  function handleSave(event: CustomEvent<Graph>) {
    gradio.dispatch("submit", event.detail);
  }

  function handleLoad() {
    // This is handled by the backend, so we don't need to do anything here.
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
    <GraphUI bind:value on:save={handleSave} on:load={handleLoad} {interactive} />
  </div>

  {#if submit_btn}
    <div style="display: flex; justify-content: center; margin-top: 10px;">
      <button on:click={() => gradio.dispatch("submit", value)}>Submit</button>
    </div>
  {/if}
</Block>
