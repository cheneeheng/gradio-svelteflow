<script lang="ts">
  // ----------
  // Imports
  // ----------
  import type { LoadingStatus } from "@gradio/statustracker";
  import type { Gradio } from "@gradio/utils";
  import { onMount, setContext } from "svelte";
  import { get } from "svelte/store";
  import CustomEdgeEditPopup from "./components/CustomEdgeEditPopup.svelte";
  import CustomNodeEditPopup from "./components/CustomNodeEditPopup.svelte";
  import Dialogs from "./components/Dialogs.svelte";
  import Graph from "./components/Graph.svelte";
  import Toolbar from "./components/Toolbar.svelte";
  import { storeKey } from "./stores/context";
  import { createGraphStores, type GraphStores } from "./stores/instanceStore";
  import { theme } from "./stores/themeStore";
  import type { CustomEdge, CustomNode } from "./types/schemas";
  import { handleKeydown } from "./utils/graph/canvas";
  import {
    handleEdgeEditPopupCancel,
    handleEdgeEditPopupSave,
    handleNodeEditPopupCancel,
    handleNodeEditPopupSave,
  } from "./utils/graph/popup";

  // ----------
  // Exports
  // ----------
  export let gradio: Gradio<{
    change: { nodes: CustomNode[]; edges: CustomEdge[] };
    select: { nodes: CustomNode[]; edges: CustomEdge[] };
    submit: { nodes: CustomNode[]; edges: CustomEdge[] };
    clear_status: LoadingStatus;
  }>;
  export let value: {
    nodes: CustomNode[];
    edges: CustomEdge[];
    loaded: boolean;
  } = {
    nodes: [],
    edges: [],
    loaded: false,
  };
  export let interactive: boolean = true;
  export let toolbar_size: "extra-small" | "small" | "medium" | "large" =
    "small";
  export let toolbar_enable_save_load: boolean = false;
  export let toolbar_enable_add: boolean = false;
  export let canvas_min_height: string = "500px";

  // ----------
  // Local vars
  // ----------
  const stores = createGraphStores();
  setContext(storeKey, stores);
  const { editingEdge, editingNode, interactive: interactiveStore } = stores;

  // ----------
  // Local functions
  // ----------

  // ----------
  // Reactivity + svelte utils
  // ----------
  onMount(() => {
    interactiveStore.set(interactive);
  });

  $: if (value) {
    stores.customNodes.set(value.nodes);
    stores.customEdges.set(value.edges);
  }

  $: if (typeof document !== "undefined") {
    if ($theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  function handleNodeEditPopupSaveWrapper(
    event: CustomEvent<CustomNode>,
    stores: GraphStores
  ) {
    handleNodeEditPopupSave(event, stores);
    value.nodes = get(stores.customNodes);
    value.edges = get(stores.customEdges);
    gradio.dispatch("change", value);
  }

  function handleEdgeEditPopupSaveWrapper(
    event: CustomEvent<CustomEdge>,
    stores: GraphStores
  ) {
    handleEdgeEditPopupSave(event, stores);
    value.edges = get(stores.customEdges);
    gradio.dispatch("change", value);
  }
</script>

<svelte:window on:keydown={(e) => handleKeydown(e, stores)} />

<div class="app-container" style="min-height: {canvas_min_height};">
  <Dialogs />
  {#if $editingNode}
    <CustomNodeEditPopup
      node={$editingNode}
      on:save={(e) => handleNodeEditPopupSaveWrapper(e, stores)}
      on:cancel={() => handleNodeEditPopupCancel(stores)}
    />
  {/if}

  {#if $editingEdge}
    <CustomEdgeEditPopup
      edge={$editingEdge}
      on:save={(e) => handleEdgeEditPopupSaveWrapper(e, stores)}
      on:cancel={() => handleEdgeEditPopupCancel(stores)}
    />
  {/if}

  <Toolbar
    {gradio}
    bind:value
    size={toolbar_size}
    enable_save_load={toolbar_enable_save_load}
    enable_add={toolbar_enable_add}
  />
  <Graph {gradio} bind:value />
</div>

<style>
  /* :global(html, body) {
    background-color: var(--background);
    color: var(--text-color);
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
    overflow: auto;
  } */

  :global(html:has(.fullscreen.animating)),
  :global(body:has(.fullscreen.animating)) {
    overflow: hidden;
  }

  .app-container {
    width: 100%;
    height: 100%;
    background-color: var(--background);
    color: var(--text-color);
    position: relative;
    display: flex;
    flex-direction: column;
  }

  :global(.fullscreen.animating) {
    display: flex;
    flex-direction: column;
  }

  :global(.fullscreen.animating .app-container) {
    min-height: 0 !important;
  }
</style>
