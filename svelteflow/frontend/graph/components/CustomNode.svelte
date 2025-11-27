<script lang="ts">
  import { Handle, Position, useUpdateNodeInternals } from "@xyflow/svelte";
  import { ChevronDown, ChevronUp } from "lucide-svelte";
  import { getContext } from "svelte";
  import { derived } from "svelte/store";
  import { storeKey } from "../stores/context";
  import type { GraphStores } from "../stores/instanceStore";
  import type { Attribute } from "../types/schemas";

  export let attributes: Attribute[] = [];

  export let id;
  export let data;
  export let type;
  export let dragging;
  export let zIndex;
  export let selectable;
  export let deletable;
  export let selected;
  export let draggable;
  export let isConnectable;
  export let positionAbsoluteX;
  export let positionAbsoluteY;

  $: ({ name, description, attributes, handles } = data);

  const stores = getContext<GraphStores>(storeKey);
  const { clickedNodes, searchedNodes } = stores;

  const updateNodeInternals = useUpdateNodeInternals();

  $: if (handles) {
    updateNodeInternals(id);
  }

  const highlightType = derived(
    [clickedNodes, searchedNodes],
    ([$clickedNodes, $searchedNodes]) => {
      if ($clickedNodes.includes(id)) return "click";
      if ($searchedNodes.includes(id)) return "search";
      return null;
    }
  );
</script>

<div
  class="custom-node"
  class:highlight-click={$highlightType === "click"}
  class:highlight-search={$highlightType === "search"}
  class:selected
>
  <button
    class="attribute-toggle collapse-toggle-btn"
    on:click={(e) => e.currentTarget.blur()}
  >
    {#if !data.collapsed}
      <ChevronUp size={16} />
    {:else}
      <ChevronDown size={16} />
    {/if}
  </button>
  <div class="node-header">{name}</div>
  <div class="node-body">
    <div class="node-description">{description}</div>
    {#if !data.collapsed && attributes.length}
      <hr class="divider" />
      <div class="attributes-grid">
        <div class="attributes-column">
          {#each attributes.filter((attr) => attr.type === "input") as attr, i}
            {#if attr.visible}
              <div class="attribute-card" style={`position: relative;`}>
                <Handle
                  type="target"
                  position={Position.Left}
                  id={attr.key}
                  style="top: 50%; left: -13px;"
                  isConnectable={attr.connectable}
                /> <span class="key">{attr.key}</span>
                <span class="value">{attr.value}</span>
              </div>
            {/if}
          {/each}
        </div>
        <div class="attributes-column">
          {#each attributes.filter((attr) => attr.type === "output") as attr, i}
            {#if attr.visible}
              <div class="attribute-card" style={`position: relative;`}>
                <Handle
                  type="source"
                  position={Position.Right}
                  id={attr.key}
                  style="top: 50%; right: -13px;"
                  isConnectable={attr.connectable}
                /> <span class="key">{attr.key}</span>
                <span class="value">{attr.value}</span>
              </div>
            {/if}
          {/each}
        </div>
      </div>
    {/if}
  </div>

  {#if data.collapsed}
    <Handle
      type="target"
      position={Position.Left}
      id="input-collapsed"
      style="top: 50%; opacity: 0.5;"
      isConnectable={true}
    />
    <Handle
      type="source"
      position={Position.Right}
      id="output-collapsed"
      style="top: 50%; opacity: 0.5;"
      isConnectable={true}
    />
  {/if}
</div>

<style>
  .custom-node {
    background: var(--node-background);
    border: 1px solid var(--node-border);
    border-radius: 8px;
    min-width: 220px;
    max-width: 300px;
    font-family: sans-serif;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
    position: relative;
    z-index: 1;
  }

  .attribute-toggle {
    position: absolute;
    top: -25px;
    right: 10px;
    background: var(--button-background);
    border: 1px solid var(--button-border);
    border-radius: 4px;
    padding: 4px;
    font-size: 0.75em;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .node-header {
    background-color: var(--header-background, var(--node-border));
    color: var(--header-text-color, var(--background));
    padding: 8px 12px;
    border-top-left-radius: 7px;
    border-top-right-radius: 7px;
    font-weight: bold;
    font-size: 1rem;
  }

  .node-body {
    padding: 12px;
  }

  .node-description {
    padding: 0 0 12px 0;
    font-size: 0.9em;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  .divider {
    border: none;
    border-top: 1px solid var(--node-border);
    margin: 0;
    opacity: 0.5;
  }

  .attributes-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    padding-top: 12px;
  }

  .attributes-column {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .attribute-card {
    background: var(--input-background);
    border: 1px solid var(--input-border);
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 0.85em;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    word-wrap: break-word;
    word-break: break-all;
  }

  .key {
    font-weight: 600;
    margin-right: 8px;
    color: var(--text-color);
    background: var(--badge-background);
    padding: 2px 6px;
    border-radius: 4px;
    white-space: normal;
  }

  .value {
    color: var(--text-color);
    opacity: 0.8;
    white-space: normal;
  }

  .highlight-click {
    border-color: var(--highlight-color);
    box-shadow: 0 0 0 3px var(--highlight-color);
  }

  .highlight-search {
    border-color: var(--search-color);
    box-shadow: 0 0 0 3px var(--search-color);
  }

  .selected {
    border-color: var(--selection-color);
    box-shadow: 0 0 0 3px var(--selection-color);
  }
</style>
