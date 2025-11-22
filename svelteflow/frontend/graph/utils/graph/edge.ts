import { type Edge } from "@xyflow/svelte";
import { get } from "svelte/store";
import { editingEdge, interactive } from "../../stores/graphStore";
import type { CustomEdge } from "../../types/schemas";

let clickTimer: number | null = null;

// Have to use Edge here for SvelteFlow component
export function handleEdgeClick(
  customEvent: CustomEvent<{
    edge: Edge<Record<string, unknown>, string | undefined>;
    event: MouseEvent | TouchEvent;
  }>
) {
  const edge = customEvent.detail.edge as CustomEdge;
  if (clickTimer) {
    clearTimeout(clickTimer);
    clickTimer = null;
    handleEdgeDoubleClick(customEvent);
  } else {
    clickTimer = setTimeout(() => {
      // single-click logic for edges can go here
      clickTimer = null;
    }, 250);
  }
}

// Have to use Edge here for SvelteFlow component
function handleEdgeDoubleClick(
  customEvent: CustomEvent<{
    edge: Edge<Record<string, unknown>, string | undefined>;
    event: MouseEvent | TouchEvent;
  }>
) {
  const clickedEdge = customEvent.detail.edge as CustomEdge;
  if (get(interactive) && customEvent.detail.event instanceof MouseEvent) {
    editingEdge.set(clickedEdge);
  }
}
