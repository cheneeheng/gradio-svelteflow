<script lang="ts">
  import { Handle, Position, type NodeProps } from "@xyflow/svelte";
  import { derived } from "svelte/store";
  import { clickedNodes, searchedNodes } from "../stores/highlightStore";

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
>
  <div class="node-name">{name}</div>
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
  {#each handles as handle}
    <Handle
      type={handle.type === "input" ? "target" : "source"}
      position={handle.type === "input" ? Position.Left : Position.Right}
      id={handle.id}
    />
  {/each}
</div>

<style>
  .custom-node {
    background: #f0f0f0;
    border: 1px solid #333;
    border-radius: 5px;
    padding: 10px;
    min-width: 150px;
  }
  .node-name {
    font-weight: bold;
    margin-bottom: 5px;
  }
  .attributes {
    font-size: 0.8em;
  }
  .attribute {
    display: flex;
    justify-content: space-between;
  }
  .key {
    font-weight: bold;
    margin-right: 5px;
  }
  .highlight-click {
    border-color: blue;
    box-shadow: 0 0 0 2px blue;
  }
  .highlight-search {
    border-color: yellow;
    box-shadow: 0 0 0 2px yellow;
  }
</style>
