<script lang="ts">
  // ----------
  // Imports
  // ----------
  import { onMount } from "svelte";
  import CustomEdgeEditPopup from "./components/CustomEdgeEditPopup.svelte";
  import CustomNodeEditPopup from "./components/CustomNodeEditPopup.svelte";
  import Graph from "./components/Graph.svelte";
  import Toolbar from "./components/Toolbar.svelte";
  import {
    editingEdge,
    editingNode,
    interactive as interactiveStore,
  } from "./stores/graphStore";
  import { theme } from "./stores/themeStore";
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
  export let interactive: boolean = true;
  export let toolbar_size: "extra-small" | "small" | "medium" | "large" =
    "small";

  // ----------
  // Local vars
  // ----------

  // ----------
  // Local functions
  // ----------

  // ----------
  // Reactivity + svelte utils
  // ----------
  onMount(() => {
    interactiveStore.set(interactive);
  });

  $: if (typeof document !== "undefined") {
    if ($theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="app-container">
  {#if $editingNode}
    <CustomNodeEditPopup
      node={$editingNode}
      on:save={handleNodeEditPopupSave}
      on:cancel={handleNodeEditPopupCancel}
    />
  {/if}

  {#if $editingEdge}
    <CustomEdgeEditPopup
      edge={$editingEdge}
      on:save={handleEdgeEditPopupSave}
      on:cancel={handleEdgeEditPopupCancel}
    />
  {/if}

  <Toolbar size={toolbar_size} />
  <Graph />
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

  .app-container {
    width: 100%;
    height: 100%;
    background-color: var(--background);
    color: var(--text-color);
    position: relative;
    display: flex;
  }
</style>
