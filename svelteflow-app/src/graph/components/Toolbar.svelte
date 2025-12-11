<script lang="ts">
  // ----------
  // Imports
  // ----------
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
  import { createEventDispatcher, getContext } from "svelte";
  import { get } from "svelte/store";
  import { storeKey } from "../stores/context";
  import type { GraphStores } from "../stores/instanceStore";
  import { theme } from "../stores/themeStore";
  import { handleAddNode } from "../utils/graph/node";
  import { handleLayout, type LayoutDirection } from "../utils/layout";
  import { triggerLoad } from "../utils/toolbar/load";
  import { handleSaveGraph } from "../utils/toolbar/save";
  import { debouncedSearch } from "../utils/toolbar/search";
  import { toggleTheme } from "../utils/toolbar/theme";

  // ----------
  // Exports
  // ----------
  export let size: "extra-small" | "small" | "medium" | "large" = "medium";
  export let enable_save_load: boolean = false;
  export let enable_add: boolean = false;

  // ----------
  // Events
  // ----------
  const dispatch = createEventDispatcher<{
    change: null;
  }>();

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
  function emitChange() {
    dispatch("change");
  }

  function handleLayoutWrapper(
    layoutDirection: LayoutDirection,
    stores: GraphStores
  ) {
    handleLayout(layoutDirection, stores);
    emitChange();
  }

  function handleAddNodeWrapper(stores: GraphStores) {
    handleAddNode(stores);
    emitChange();
  }

  function triggerLoadWrapper(stores: GraphStores) {
    triggerLoad(stores);
    emitChange();
  }

  // Watch layout direction changes and trigger re-layout
  let previousLayoutDirection: LayoutDirection = get(layoutDirection);
  $: if ($layoutDirection !== previousLayoutDirection) {
    previousLayoutDirection = $layoutDirection;
    handleLayoutWrapper($layoutDirection, stores);
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
  role="toolbar"
  aria-label="Graph editing toolbar"
  style="--toolbar-padding: {currentPadding}; --toolbar-font-size: {currentFontSize};"
>
  <div class="search-bar" style="padding: var(--toolbar-padding);">
    <Search size={currentIconSize} aria-hidden="true" />
    <input
      type="text"
      bind:value={$searchQuery}
      on:input={search}
      placeholder="Search nodes..."
      aria-label="Search nodes by name"
      style="font-size: var(--toolbar-font-size);"
    />
  </div>

  {#if enable_add}
    <button
      class="toolbar-button"
      on:click={() => handleAddNodeWrapper(stores)}
      aria-label="Add a new node"
      title="Add a new node"
    >
      <Plus size={currentIconSize} aria-hidden="true" />
    </button>
  {/if}

  {#if enable_save_load}
    <button
      class="toolbar-button"
      on:click={async () => await handleSaveGraph(stores)}
      aria-label="Save graph"
      title="Save graph"
    >
      <Save size={currentIconSize} aria-hidden="true" />
    </button>
    <button
      class="toolbar-button"
      on:click={() => triggerLoadWrapper(stores)}
      aria-label="Load graph"
      title="Load graph"
    >
      <FolderOpen size={currentIconSize} aria-hidden="true" />
    </button>
  {/if}

  <button
    class="toolbar-button"
    on:click={() => handleLayoutWrapper($layoutDirection, stores)}
    aria-label="Relayout nodes"
    title="Relayout nodes"
  >
    <LayoutDashboard size={currentIconSize} aria-hidden="true" />
  </button>

  <label for="layout-direction" class="sr-only">Layout direction</label>
  <select
    id="layout-direction"
    bind:value={$layoutDirection}
    aria-label="Layout direction"
  >
    <option value="TB">Vertical</option>
    <option value="LR">Horizontal</option>
  </select>

  <button class="toolbar-button" aria-label="Settings" title="Settings">
    <Settings size={currentIconSize} aria-hidden="true" />
  </button>

  <button class="toolbar-button" aria-label="More options" title="More options">
    <Ellipsis size={currentIconSize} aria-hidden="true" />
  </button>

  <button
    class="toolbar-button"
    on:click={toggleTheme}
    aria-label="Toggle theme"
    title="Toggle theme"
  >
    {#if $theme === "light"}
      <Moon size={currentIconSize} aria-hidden="true" />
    {:else}
      <Sun size={currentIconSize} aria-hidden="true" />
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
    transition: background-color 0.2s;
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
    cursor: pointer;
  }
</style>
