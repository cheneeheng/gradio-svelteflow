<script lang="ts">
  // ----------
  // Imports
  // ----------
  import { SvelteFlowProvider } from "@xyflow/svelte";
  import {
    createEventDispatcher,
    onDestroy,
    onMount,
    setContext,
  } from "svelte";
  import { get } from "svelte/store";
  import CustomEdgeEditPopup from "./components/CustomEdgeEditPopup.svelte";
  import CustomNodeEditPopup from "./components/CustomNodeEditPopup.svelte";
  import Dialogs from "./components/Dialogs.svelte";
  import Graph from "./components/Graph.svelte";
  import Toolbar from "./components/Toolbar.svelte";
  import { storeKey } from "./stores/context";
  import { createGraphStores, type GraphStores } from "./stores/instanceStore";
  import { theme } from "./stores/themeStore";
  import type { GradioLike, GraphEvents } from "./types/gradio";
  import type { CustomEdge, CustomNode, GraphValue } from "./types/schemas";
  import { deepEqual } from "./utils/deepEquals";
  import { handleKeydown } from "./utils/graph/canvas";
  import {
    handleEdgeEditPopupCancel,
    handleEdgeEditPopupSave,
    handleNodeEditPopupCancel,
    handleNodeEditPopupSave,
  } from "./utils/graph/popup";
  import { uuidv4 } from "./utils/uuid";

  // ----------
  // Exports
  // ----------
  export let gradio: GradioLike<GraphEvents> | undefined = undefined;
  export let value: GraphValue = {
    nodes: [],
    edges: [],
    loaded: false,
    zoomToNodeName: null,
  };
  export let interactive: boolean = true;
  export let toolbar_size: "extra-small" | "small" | "medium" | "large" =
    "small";
  export let toolbar_enable_save_load: boolean = false;
  export let toolbar_enable_add: boolean = false;
  export let canvas_min_height: string = "500px";

  // ----------
  // Events
  // ----------
  const dispatch = createEventDispatcher<{
    change: GraphValue;
    zoomComplete: null;
  }>();

  // ----------
  // Local vars
  // ----------
  const stores = createGraphStores();
  const instanceId = uuidv4();
  stores.instanceId.set(instanceId);
  setContext(storeKey, stores);

  const { editingEdge, editingNode, interactive: interactiveStore } = stores;

  // Track previous value for deep comparison
  let prevValueNodes: CustomNode[] = [];
  let prevValueEdges: CustomEdge[] = [];

  // Cleanup function
  let keydownHandler: ((e: KeyboardEvent) => void) | null = null;

  // ----------
  // Local functions
  // ----------
  function emitChange() {
    const newValue: GraphValue = {
      nodes: get(stores.customNodes),
      edges: get(stores.customEdges),
      loaded: value.loaded,
      zoomToNodeName: null, // Don't re-emit zoom requests
    };

    dispatch("change", newValue);

    if (gradio) {
      gradio.dispatch("change", newValue);
    }
  }

  function handleZoomComplete() {
    dispatch("zoomComplete");
  }

  // ----------
  // Reactivity + svelte utils
  // ----------
  onMount(() => {
    if (gradio) {
      document.documentElement.classList.add("gradio-active");
    }

    // Setup keydown handler with proper cleanup
    keydownHandler = (e: KeyboardEvent) => handleKeydown(e, stores);
    window.addEventListener("keydown", keydownHandler);
  });

  onDestroy(() => {
    // Cleanup event listeners
    if (keydownHandler) {
      window.removeEventListener("keydown", keydownHandler);
    }

    // Cleanup any pending timers
    if (stores.clickTimer) {
      clearTimeout(stores.clickTimer);
      stores.clickTimer = null;
    }

    // Remove gradio class
    if (gradio) {
      document.documentElement.classList.remove("gradio-active");
    }
  });

  // Update interactive state
  $: interactiveStore.set(interactive);

  // Sync value to stores only if actually changed (prevent infinite loops)
  $: {
    if (!deepEqual(value.nodes, prevValueNodes)) {
      stores.customNodes.set(value.nodes);
      prevValueNodes = value.nodes;
    }
  }

  // Sync edges
  $: {
    if (!deepEqual(value.edges, prevValueEdges)) {
      stores.customEdges.set(value.edges);
      prevValueEdges = value.edges;
    }
  }

  // Sync zoom requests
  $: {
    if (value.zoomToNodeName) {
      stores.zoomToNodeName.set(value.zoomToNodeName);
    }
  }

  // Handle theme
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
    emitChange();
  }

  function handleEdgeEditPopupSaveWrapper(
    event: CustomEvent<CustomEdge>,
    stores: GraphStores
  ) {
    handleEdgeEditPopupSave(event, stores);
    emitChange();
  }
</script>

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
    size={toolbar_size}
    enable_save_load={toolbar_enable_save_load}
    enable_add={toolbar_enable_add}
    on:change={emitChange}
  />

  <SvelteFlowProvider>
    <Graph on:change={emitChange} on:zoomComplete={handleZoomComplete} />
  </SvelteFlowProvider>
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

  /* Only lock scrolling if Gradio is active */
  :global(html.gradio-active:has(.fullscreen.animating)),
  :global(body.gradio-active:has(.fullscreen.animating)) {
    overflow: hidden;
  }

  /* Fullscreen layout styles */
  :global(html.gradio-active .fullscreen.animating) {
    display: flex;
    flex-direction: column;
  }

  :global(html.gradio-active .fullscreen.animating .app-container) {
    min-height: 0 !important;
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
</style>
