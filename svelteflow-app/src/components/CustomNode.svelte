<script lang="ts">
  import { Handle, Position, useUpdateNodeInternals } from "@xyflow/svelte";
  import { derived } from "svelte/store";
  import { clickedNodes, searchedNodes } from "../stores/highlightStore";
  import { onMount } from "svelte";

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
  let attributesVisible = true;

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

  function toggleAttributes() {
    attributesVisible = !attributesVisible;
    updateNodeInternals(id);
  }
</script>

<div
  class="custom-node"
  class:highlight-click={$highlightType === "click"}
  class:highlight-search={$highlightType === "search"}
  class:selected
>
  <button class="attribute-toggle" on:click={toggleAttributes}>
    {attributesVisible ? "Hide" : "Show"}
  </button>
  <div class="node-header">{name}</div>
  <div class="node-body">
    <div class="node-description">{description}</div>
    {#if attributesVisible && attributes.length}
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
                  style="top: 50%;"
                />
                <span class="key">{attr.key}</span>
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
                  style="top: 50%;"
                />
                <span class="key">{attr.key}</span>
                <span class="value">{attr.value}</span>
              </div>
            {/if}
          {/each}
        </div>
      </div>
    {/if}
  </div>

  {#if !attributesVisible}
    <Handle
      type="target"
      position={Position.Left}
      id="input-collapsed"
      style="top: 50%;"
    />
    <Handle
      type="source"
      position={Position.Right}
      id="output-collapsed"
      style="top: 50%;"
    />
  {/if}
</div>

<style>
  .custom-node {
    background: var(--node-background);
    border: 1px solid var(--node-border);
    border-radius: 8px;
    min-width: 220px;
    font-family: sans-serif;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
    position: relative;
  }

  .attribute-toggle {
    position: absolute;
    top: -25px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--button-background);
    border: 1px solid var(--button-border);
    border-radius: 4px;
    padding: 2px 8px;
    font-size: 0.75em;
    cursor: pointer;
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
    justify-content: space-between;
    align-items: center;
  }

  .key {
    font-weight: 600;
    margin-right: 8px;
    color: var(--text-color);
  }

  .value {
    color: var(--text-color);
    opacity: 0.8;
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
