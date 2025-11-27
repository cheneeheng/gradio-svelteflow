<script lang="ts">
  import { BaseEdge, getBezierPath } from "@xyflow/svelte";
  import { getContext } from "svelte";
  import { derived } from "svelte/store";
  import { storeKey } from "../stores/context";
  import type { GraphStores } from "../stores/instanceStore";

  interface PathOptions {
    curvature?: number;
  }

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
  export let label: string | undefined = undefined;
  export let labelStyle: string | undefined = undefined;
  export let markerStart: string | undefined = undefined;
  export let markerEnd: string | undefined = undefined;
  export let pathOptions: PathOptions | undefined = undefined;
  export let interactionWidth: number | undefined = undefined;
  export let selected = false;

  const stores = getContext<GraphStores>(storeKey);
  const { clickedEdges, instanceId } = stores;

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
      ? "var(--highlight-color)"
      : selected
        ? "var(--selection-color)"
        : "var(--node-border)";
  $: strokeWidth = $highlightType || selected ? 3 : 1.5;
  $: style = `stroke: ${strokeColor}; stroke-width: ${strokeWidth};`;

  // merge default label styles with user-provided ones
  const defaultLabelStyle =
    "user-select: none; pointer-events: none; font-size: 12px; fill: var(--text-color); backgroundColor: var(--node-background)";
  $: mergedLabelStyle = labelStyle
    ? `${defaultLabelStyle} ${labelStyle}`
    : defaultLabelStyle;
</script>

<svg>
  <defs>
    <marker
      id="arrow-marker-{$instanceId}-{id}"
      markerWidth="8"
      markerHeight="8"
      viewBox="-10 -10 20 20"
      refX="3"
      refY="0"
      orient="auto-start-reverse"
    >
      <path d="M -5 -4 L 5 0 L -5 4 Z" fill={strokeColor} />
    </marker>
  </defs>
</svg>

<BaseEdge
  {id}
  {path}
  {label}
  {labelX}
  {labelY}
  labelStyle={mergedLabelStyle}
  {markerStart}
  markerEnd="url(#arrow-marker-{$instanceId}-{id})"
  {interactionWidth}
  {style}
/>
