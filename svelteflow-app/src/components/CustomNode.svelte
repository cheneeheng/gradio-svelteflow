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

  $: ({ name, attributes, handles } = data);

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

  function getHandlePosition(type: "input" | "output", index: number, total: number) {
    const offset = 100 / (total + 1);
    return `${(index + 1) * offset}%`;
  }
</script>

<div
  class="custom-node"
  class:highlight-click={$highlightType === "click"}
  class:highlight-search={$highlightType === "search"}
  class:selected
>
  <div class="node-header">{name}</div>
  <div class="node-body">
    {#if attributes.length}
      <div class="attributes">
        {#each attributes as attr}
          {#if attr.visible}
            <div class="attribute">
              <span class="key">{attr.key}:</span>
              <span class="value">{attr.value}</span>
            </div>
          {/if}
        {/each}
      </div>
    {/if}
  </div>

  {#each handles.filter(h => h.type === 'input') as handle, i}
    <Handle
      type="target"
      position={Position.Left}
      id={handle.id}
      style={`top: ${getHandlePosition('input', i, handles.filter(h => h.type === 'input').length)}`}
    />
  {/each}
  {#each handles.filter(h => h.type === 'output') as handle, i}
    <Handle
      type="source"
      position={Position.Right}
      id={handle.id}
      style={`top: ${getHandlePosition('output', i, handles.filter(h => h.type === 'output').length)}`}
    />
  {/each}
</div>

<style>
  .custom-node {
    background: var(--node-background);
    border: 1px solid var(--node-border);
    border-radius: 8px;
    min-width: 180px;
    font-family: sans-serif;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
  }

  .node-header {
    background-color: var(--node-border);
    color: var(--background);
    padding: 8px 12px;
    border-top-left-radius: 7px;
    border-top-right-radius: 7px;
    font-weight: bold;
    font-size: 1rem;
  }

  .node-body {
    padding: 12px;
  }

  .attributes {
    font-size: 0.9em;
  }

  .attribute {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
  }

  .key {
    font-weight: 600;
    margin-right: 8px;
    color: var(--text-color);
  }

  .value {
    color: var(--text-color);
  }

  .highlight-click {
    border-color: blue;
    box-shadow: 0 0 0 2px blue, 0 4px 12px rgba(0, 0, 255, 0.2);
  }

  .highlight-search {
    border-color: yellow;
    box-shadow: 0 0 0 2px yellow, 0 4px 12px rgba(255, 255, 0, 0.2);
  }

  .selected {
    border-color: tomato;
    box-shadow: 0 0 0 2px tomato, 0 4px 12px rgba(255, 99, 71, 0.2);
  }
</style>
