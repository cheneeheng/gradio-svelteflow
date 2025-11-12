<script lang="ts">
  import { BaseEdge, getBezierPath } from "@xyflow/svelte";
  import { derived } from "svelte/store";
  import { clickedEdges } from "../stores/highlightStore";

  export let type;
  export let id;
  export let source;
  export let sourceX;
  export let sourceY;
  export let target;
  export let targetX;
  export let targetY;
  export let sourcePosition;
  export let targetPosition;
  export let sourceHandle = undefined;
  export let targetHandle = undefined;
  export let label = undefined;
  export let labelStyle = undefined;
  export let markerStart = undefined;
  export let markerEnd = undefined;
  export let pathOptions = undefined;
  export let interactionWidth = undefined;
  export let selected = false;

  const highlightType = derived(clickedEdges, ($clickedEdges) => {
    if ($clickedEdges.includes(id)) return "click";
    return null;
  });

  $: [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: pathOptions?.curvature,
  });

  $: strokeColor =
    $highlightType === "click"
      ? "blue"
      : selected
      ? "tomato"
      : "var(--node-border)";

  $: strokeWidth = $highlightType || selected ? 2.5 : 1.5;

  $: style = `stroke: ${strokeColor}; stroke-width: ${strokeWidth};`;

  // merge default label styles with user-provided ones
  const defaultLabelStyle =
    "user-select: none; pointer-events: none; font-size: 12px; fill: var(--text-color);";
  $: mergedLabelStyle = labelStyle
    ? `${defaultLabelStyle} ${labelStyle}`
    : defaultLabelStyle;
</script>

<BaseEdge
  {id}
  {path}
  {label}
  {labelX}
  {labelY}
  labelStyle={mergedLabelStyle}
  {markerStart}
  {markerEnd}
  {interactionWidth}
  {style}
/>
