<!--
THIS IS THE EXPECTED DATA STRUCTURE FOR THIS CUSTOM NODE:

const node: Node<DynamicNodeData> = {
  id: "node-1",
  type: "dynamic", // must match nodeTypes = { dynamic: DynamicHandlesNode }
  position: { x: 200, y: 150 },
  data: {
    label: "My Node",
    sources: [
      { id: "node-1-s1" },
      { id: "node-1-s2" }
    ],
    targets: [
      { id: "node-1-t1" }
    ]
  }
};
-->

<script lang="ts">
  import {
    Handle,
    Position,
    useUpdateNodeInternals,
    type NodeProps,
    type Node,
  } from "@xyflow/svelte";
  import type { DynamicNodeData } from "./DynamicNodeData.ts";

  export let props: NodeProps<Node<DynamicNodeData>>;
  const { id, data } = props; // destructure what you need
  // export let id: string;
  // export let data: DynamicNodeData;

  const updateNodeInternals = useUpdateNodeInternals();

  // Recalculate bounds when counts change
  $: updateNodeInternals(id);

  // Compute percentage positions: (index + 1) / (count + 1) * 100
  function pctAt(index: number, count: number): string {
    if (count <= 0) return "50%";
    return `${((index + 1) / (count + 1)) * 100}%`;
  }

  const sideOffset = data?.sideOffsetPx ?? 8; // tweak if needed
  const topOffset = data?.topOffsetPx ?? 0;
</script>

<div class="dynamic-node">
  <div class="label">{data?.label ?? "Dynamic Node"}</div>

  <!-- Sources on the left, centered and evenly spaced -->
  {#each data?.sources ?? [] as s, i}
    <Handle
      id={s.id}
      type="source"
      position={Position.Left}
      style={`top: calc(${pctAt(i, (data?.sources ?? []).length)} + ${topOffset}px);
              left: -${sideOffset}px;
              transform: translateY(-50%);`}
    />
  {/each}

  <!-- Targets on the right, centered and evenly spaced -->
  {#each data?.targets ?? [] as t, j}
    <Handle
      id={t.id}
      type="target"
      position={Position.Right}
      style={`top: calc(${pctAt(j, (data?.targets ?? []).length)} + ${topOffset}px);
              right: -${sideOffset}px;
              transform: translateY(-50%);`}
    />
  {/each}
</div>

<style>
  .dynamic-node {
    position: relative; /* required for absolute handle positioning */
    padding: 12px 20px;
    border: 1px solid #999;
    border-radius: 6px;
    background: white;
    min-height: 120px; /* ensures room to space handles */
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .label {
    text-align: center;
    margin-bottom: 8px;
    font-weight: 500;
  }
</style>
