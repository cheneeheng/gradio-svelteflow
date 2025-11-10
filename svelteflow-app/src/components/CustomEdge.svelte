<!-- Based on BezierEdge.svelte -->
<script lang="ts">
  import { BaseEdge, getBezierPath } from "@xyflow/svelte";
  export let id;
  export let type;
  export let label = undefined;
  export let labelStyle = undefined;
  export let style = undefined;
  export let markerStart = undefined;
  export let markerEnd = undefined;
  export let pathOptions = undefined;
  export let interactionWidth = undefined;
  export let source;
  export let sourceX;
  export let sourceY;
  export let sourcePosition;
  export let sourceHandleId;
  export let target;
  export let targetX;
  export let targetY;
  export let targetPosition;
  export let targetHandleId;
  export let selected = undefined;
  export let animated = undefined;
  export let selectable = undefined;
  export let deletable = undefined;
  export let data = undefined;

  console.log("data", data);

  $: [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    curvature: pathOptions?.curvature,
  });
</script>

<BaseEdge
  {id}
  {path}
  {markerStart}
  {markerEnd}
  {interactionWidth}
  style={`stroke: ${selected ? "tomato" : "#222"}; stroke-width: ${selected ? 2 : 1};`}
/>

{#if label}
  <text
    x={(sourceX + targetX) / 2}
    y={(sourceY + targetY) / 2 - 5}
    text-anchor="middle"
    style="user-select: none; pointer-events: none; font-size: 12px;"
  >
    {label}
  </text>
{/if}
