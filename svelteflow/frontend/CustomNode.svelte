<script lang="ts">
  import {
    Handle,
    Position,
    useUpdateNodeInternals,
    type NodeProps,
    type Node,
  } from "@xyflow/svelte";
  import type { CustomNodeData } from "./CustomNodeData.js";

  // SvelteFlow passes a single "props" object
  export let props: NodeProps<Node<CustomNodeData>>;

  // Derive reactive locals from props
  $: id = props.id;
  $: data = props.data;

  const updateNodeInternals = useUpdateNodeInternals();

  // collapsed/expanded state
  let collapsed = false;
  function toggleCollapse() {
    collapsed = !collapsed;
    updateNodeInternals(id); // recalc handles/size when user toggles
  }

  function topPositionInPercentage(index: number, count: number): string {
    if (count <= 0) return "50%";
    return `${((index + 1) / (count + 1)) * 100}%`;
  }

  // React to data changes; recompute offsets and reflow handles only when relevant
  $: sideOffset = (data?.sideOffsetPx ?? 8);
  $: topOffset = (data?.topOffsetPx ?? 0);

  // Call updateNodeInternals only when handle layout can change:
  // - collapsed state toggles visibility
  // - sources/targets count changes
  $: {
    const sourceCount = (data?.sources ?? []).length;
    const targetCount = (data?.targets ?? []).length;
    // Guard against undefined id
    if (id) {
      updateNodeInternals(id);
    }
  }
</script>

<div class="custom-node">
  <!-- Header with node ID -->
  <button class="node-header" type="button" on:click={toggleCollapse}>
    {id}
    {collapsed ? "▸" : "▾"}
  </button>

  {#if !collapsed}
    <hr class="divider" />
    <!-- Label section -->
    <div class="node-label">{data?.label ?? "Custom Node"}</div>
  {/if}

  <!-- Sources on the left -->
  {#each data?.sources ?? [] as s, i}
    <Handle
      id={s.id}
      type="source"
      position={Position.Left}
      style={`top: calc(${topPositionInPercentage(i, (data?.sources ?? []).length)} + ${topOffset}px);
              left: -${sideOffset}px;
              transform: translateY(-50%);`}
    />
  {/each}

  <!-- Targets on the right -->
  {#each data?.targets ?? [] as t, j}
    <Handle
      id={t.id}
      type="target"
      position={Position.Right}
      style={`top: calc(${topPositionInPercentage(j, (data?.targets ?? []).length)} + ${topOffset}px);
              right: -${sideOffset}px;
              transform: translateY(-50%);`}
    />
  {/each}
</div>

<style>
  .custom-node {
    position: relative;
    padding: 12px 20px;
    border: 1px solid #999;
    border-radius: 6px;
    background: white;
    min-height: 40px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    cursor: pointer;
  }
  .node-header {
    font-weight: bold;
    font-size: 0.9rem;
    text-align: center;
    color: #444;
    margin-bottom: 4px;
    background: none;
    border: none;
    cursor: pointer;
  }
  .node-header:focus {
    outline: 2px solid #007acc;
  }
  .divider {
    border: none;
    border-top: 1px solid #ccc;
    margin: 0 0 8px 0;
  }
  .node-label {
    text-align: left;
    font-weight: 500;
    margin-bottom: 8px;
  }
</style>
