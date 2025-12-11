<script lang="ts">
  // ----------
  // Imports
  // ----------
  import { BaseEdge, getBezierPath, Position } from "@xyflow/svelte";
  import { getContext } from "svelte";
  import { derived } from "svelte/store";
  import { storeKey } from "../stores/context";
  import type { GraphStores } from "../stores/instanceStore";

  // ----------
  // Exports
  // ----------
  interface PathOptions {
    curvature?: number;
  }

  export let id: string;
  export let type: string;
  export let source: string;
  export let target: string;
  export let sourceHandle: string | null = null;
  export let targetHandle: string | null = null;
  export let animated: boolean = false;
  export let hidden: boolean = false;
  export let deletable: boolean = false;
  export let selectable: boolean = false;
  export let data: Record<string, unknown> = {};
  export let selected: boolean = false;
  export let markerStart: string | undefined = undefined;
  export let markerEnd: string | undefined = undefined;
  export let zIndex: number;
  export let ariaLabel: string | undefined = undefined;
  export let interactionWidth: number | undefined = undefined;

  export let sourceX: number;
  export let sourceY: number;
  export let targetX: number;
  export let targetY: number;
  export let sourcePosition: Position;
  export let targetPosition: Position;

  export let label: string | undefined = undefined;
  export let labelStyle: string | undefined = undefined;
  export let style: string | undefined = undefined;
  // export let class: string | undefined = undefined;

  export let sourceHandleId: string | null = null;
  export let targetHandleId: string | null = null;

  export let pathOptions: PathOptions | undefined = undefined;

  // ----------
  // Events
  // ----------

  // ----------
  // Local vars
  // ----------
  const stores = getContext<GraphStores>(storeKey);
  const { clickedEdges, instanceId } = stores;

  // Use Set for efficient lookup
  const clickedEdgesSet = derived(clickedEdges, ($edges) => new Set($edges));

  const highlightType = derived(clickedEdgesSet, ($clicked) => {
    if ($clicked.has(id)) return "click";
    return null;
  });

  // ----------
  // Local functions
  // ----------

  // ----------
  // Reactivity + svelte utils
  // ----------
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

  // Merge default label styles with user-provided ones
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
