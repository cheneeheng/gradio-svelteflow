<script lang="ts">
  import { onMount } from "svelte";
  import {
    editingEdge,
    editingNode,
    interactive as interactiveStore,
  } from "./stores/graphStore";
  import EdgeEditPopup from "./components/EdgeEditPopup.svelte";
  import Graph from "./components/Graph.svelte";
  import NodeEditPopup from "./components/NodeEditPopup.svelte";
  import Toolbar from "./components/Toolbar.svelte";
  import { theme } from "./stores/themeStore";
  import {
    handleCancelEdgeEdit,
    handleCancelEdit,
    handleKeydown,
    handleSaveEdge,
    handleSaveNode,
  } from "./utils/graph";

  export let interactive: boolean = true;
  export let toolbar_size: "extra-small" | "small" | "medium" | "large" =
    "small";

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
    <NodeEditPopup
      node={$editingNode}
      on:save={handleSaveNode}
      on:cancel={handleCancelEdit}
    />
  {/if}

  {#if $editingEdge}
    <EdgeEditPopup
      edge={$editingEdge}
      on:save={handleSaveEdge}
      on:cancel={handleCancelEdgeEdit}
    />
  {/if}

  <Toolbar size={toolbar_size} />
  <Graph />
</div>

<style>
  :global(html, body) {
    background-color: var(--background);
    color: var(--text-color);
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
    overflow: auto;
  }

  .app-container {
    width: 100%;
    height: auto;
    background-color: var(--background);
    color: var(--text-color);
    display: flex;
    position: relative;
  }
</style>
