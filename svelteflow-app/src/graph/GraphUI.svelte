<script lang="ts">
  // ----------
  // Imports
  // ----------
  import { onMount, setContext } from "svelte";
  import CustomEdgeEditPopup from "./components/CustomEdgeEditPopup.svelte";
  import CustomNodeEditPopup from "./components/CustomNodeEditPopup.svelte";
  import Dialogs from "./components/Dialogs.svelte";
  import Graph from "./components/Graph.svelte";
  import Toolbar from "./components/Toolbar.svelte";
  import { storeKey } from "./stores/context";
  import { createGraphStores } from "./stores/instanceStore";
  import { theme } from "./stores/themeStore";
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
  export let interactive: boolean = true;
  export let toolbar_size: "extra-small" | "small" | "medium" | "large" =
    "small";

  // ----------
  // Local vars
  // ----------
  const stores = createGraphStores();
  stores.instanceId.set(uuidv4());
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

  $: if (typeof document !== "undefined") {
    if ($theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }
</script>

<svelte:window on:keydown={(e) => handleKeydown(e, stores)} />

<div class="app-container">
  <Dialogs />
  {#if $editingNode}
    <CustomNodeEditPopup
      node={$editingNode}
      on:save={(e) => handleNodeEditPopupSave(e, stores)}
      on:cancel={() => handleNodeEditPopupCancel(stores)}
    />
  {/if}

  {#if $editingEdge}
    <CustomEdgeEditPopup
      edge={$editingEdge}
      on:save={(e) => handleEdgeEditPopupSave(e, stores)}
      on:cancel={() => handleEdgeEditPopupCancel(stores)}
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
