import { type Edge } from "@xyflow/svelte";
import { get } from "svelte/store";
import type { GraphStores } from "../../stores/instanceStore";
import type { CustomEdge } from "../../types/schemas";

// Have to use Edge here for SvelteFlow component
export function handleEdgeClick(
  customEvent: CustomEvent<{
    edge: Edge<Record<string, unknown>, string | undefined>;
    event: MouseEvent | TouchEvent;
  }>,
  stores: GraphStores
) {
  if (stores.clickTimer) {
    clearTimeout(stores.clickTimer);
    stores.clickTimer = null;
    handleEdgeDoubleClick(customEvent, stores);
  } else {
    stores.clickTimer = setTimeout(() => {
      // single-click logic for edges can go here
      stores.clickTimer = null;
    }, 250);
  }
}

// Have to use Edge here for SvelteFlow component
function handleEdgeDoubleClick(
  customEvent: CustomEvent<{
    edge: Edge<Record<string, unknown>, string | undefined>;
    event: MouseEvent | TouchEvent;
  }>,
  { interactive, editingEdge }: GraphStores
) {
  const clickedEdge = customEvent.detail.edge as CustomEdge;
  if (get(interactive) && customEvent.detail.event instanceof MouseEvent) {
    editingEdge.set(clickedEdge);
  }
}
