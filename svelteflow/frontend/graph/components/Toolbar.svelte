<script lang="ts">
  // ----------
  // Imports
  // ----------
  import type { LoadingStatus } from "@gradio/statustracker";
  import type { Gradio } from "@gradio/utils";
  import {
    Ellipsis,
    FolderOpen,
    LayoutDashboard,
    Moon,
    Plus,
    Save,
    Search,
    Settings,
    Sun,
  } from "lucide-svelte";
  import { getContext } from "svelte";
  import { get } from "svelte/store";
  import { storeKey } from "../stores/context";
  import type { GraphStores } from "../stores/instanceStore";
  import { theme } from "../stores/themeStore";
  import type { CustomEdge, CustomNode, GraphValue } from "../types/schemas";
  import { handleAddNode } from "../utils/graph/node";
  import { handleLayout, type LayoutDirection } from "../utils/layout";
  import { triggerLoad } from "../utils/toolbar/load";
  import { handleSaveGraph } from "../utils/toolbar/save";
  import { debouncedSearch } from "../utils/toolbar/search";
  import { toggleTheme } from "../utils/toolbar/theme";

  // ----------
  // Exports
  // ----------
  export let gradio: Gradio<{
    change: { nodes: CustomNode[]; edges: CustomEdge[] };
    select: { nodes: CustomNode[]; edges: CustomEdge[] };
    submit: { nodes: CustomNode[]; edges: CustomEdge[] };
    clear_status: LoadingStatus;
  }>;
  export let value: GraphValue = {
    nodes: [],
    edges: [],
    loaded: false,
    zoomToNodeId: null,
  };
  export let size: "extra-small" | "small" | "medium" | "large" = "medium";
  export let enable_save_load: boolean = false;
  export let enable_add: boolean = false;

  // ----------
  // Local vars
  // ----------
  const stores = getContext<GraphStores>(storeKey);
  const { searchQuery, layoutDirection } = stores;
  const search = debouncedSearch(stores);

  // for toolbar sizing
  let currentIconSize: number;
  let currentPadding: string;
  let currentFontSize: string;

  // ----------
  // Local functions
  // ----------
  function handleLayoutWrapper(
    layoutDirection: LayoutDirection,
    stores: GraphStores
  ) {
    handleLayout(layoutDirection, stores);
    value.nodes = get(stores.customNodes);
    value.edges = get(stores.customEdges);
    gradio.dispatch("change", value);
  }

  function handleAddNodeWrapper(stores: GraphStores) {
    handleAddNode(stores);
    value.nodes = get(stores.customNodes);
    gradio.dispatch("change", value);
  }

  function triggerLoadWrapper(stores: GraphStores) {
    triggerLoad(stores);
    value.nodes = get(stores.customNodes);
    value.edges = get(stores.customEdges);
    value.loaded = true;
    gradio.dispatch("change", value);
  }

  // ----------
  // Reactivity + svelte utils
  // ----------
  $: {
    switch (size) {
      case "extra-small":
        currentIconSize = 14;
        currentPadding = "4px";
        currentFontSize = "0.625rem"; // text-xs, even smaller
        break;
      case "small":
        currentIconSize = 16;
        currentPadding = "6px";
        currentFontSize = "0.75rem"; // text-xs
        break;
      case "large":
        currentIconSize = 24;
        currentPadding = "10px";
        currentFontSize = "1.125rem"; // text-lg
        break;
      case "medium":
      default:
        currentIconSize = 18;
        currentPadding = "8px";
        currentFontSize = "0.875rem"; // text-sm
        break;
    }
  }
</script>

<div
  class="toolbar"
  style="--toolbar-padding: {currentPadding}; --toolbar-font-size: {currentFontSize};"
>
  <div class="search-bar" style="padding: var(--toolbar-padding);">
    <Search size={currentIconSize} />
    <input
      type="text"
      bind:value={$searchQuery}
      on:input={search}
      placeholder="Search nodes..."
      style="font-size: var(--toolbar-font-size);"
    />
  </div>
  {#if enable_add}
    <button
      class="toolbar-button"
      on:click={() => handleAddNodeWrapper(stores)}
      title="Add a new node"><Plus size={currentIconSize} /></button
    >
  {/if}
  {#if enable_save_load}
    <button
      class="toolbar-button"
      on:click={async () => await handleSaveGraph(stores)}
      title="Save graph"><Save size={currentIconSize} /></button
    >
    <button
      class="toolbar-button"
      on:click={() => triggerLoadWrapper(stores)}
      title="Load graph"><FolderOpen size={currentIconSize} /></button
    >
  {/if}
  <button
    class="toolbar-button"
    on:click={() => handleLayoutWrapper($layoutDirection, stores)}
    title="Relayout nodes"><LayoutDashboard size={currentIconSize} /></button
  >
  <select bind:value={$layoutDirection} title="Layout direction">
    <option value="TB">Vertical</option>
    <option value="LR">Horizontal</option>
  </select>
  <button class="toolbar-button" title="Settings"
    ><Settings size={currentIconSize} /></button
  >
  <button class="toolbar-button" title="More options"
    ><Ellipsis size={currentIconSize} /></button
  >
  <button class="toolbar-button" on:click={toggleTheme} title="Toggle theme">
    {#if $theme === "light"}
      <Moon size={currentIconSize} />
    {:else}
      <Sun size={currentIconSize} />
    {/if}
  </button>
</div>

<style>
  .toolbar {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--controls-background);
    border: 1px solid var(--controls-border);
    border-radius: 8px;
    padding: var(--toolbar-padding);
    display: flex;
    gap: 8px; /* Consider making this gap dynamic based on size as well */
    align-items: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    z-index: 10;
  }

  .search-bar {
    display: flex;
    align-items: center;
    background: var(--input-background);
    border: 1px solid var(--input-border);
    border-radius: 6px;
  }

  .search-bar input {
    border: none;
    background: transparent;
    color: var(--text-color);
    font-size: var(--toolbar-font-size);
    line-height: 1; /* ensures line box = font size */
  }

  .search-bar input:focus {
    outline: none;
  }

  .toolbar-button {
    background: transparent;
    border: none;
    color: var(--text-color);
    cursor: pointer;
    padding: var(--toolbar-padding);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .toolbar-button:hover {
    background: var(--button-hover-background);
  }

  select {
    background-color: var(--input-background);
    color: var(--text-color);
    border: 1px solid var(--input-border);
    border-radius: 6px;
    padding: var(--toolbar-padding);
    font-size: var(--toolbar-font-size);
    line-height: 1; /* ensures line box = font size */
    padding-right: 2em;
  }
</style>
