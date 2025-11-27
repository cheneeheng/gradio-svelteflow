import { type Edge, type Node } from "@xyflow/svelte";
import type { Connection } from "@xyflow/system";
import { get } from "svelte/store";
import type { GraphStores } from "../../stores/instanceStore";
import type { CustomEdge, CustomNode } from "../../types/schemas";

// SVELTEFLOW HANDLERS
export function handleConnect(
  connection: Connection,
  { customEdges }: GraphStores
) {
  const { source, target, sourceHandle, targetHandle } = connection;
  if (!source || !target) return;

  let currentEdges = get(customEdges).filter(
    (e) => !(e.source === source && e.target === target && !e.label && !e.type)
  );

  const parallelEdges = currentEdges.filter(
    (edge) => edge.source === source && edge.target === target
  );
  const key = parallelEdges.length + 1;
  const id = `${source}_${target}_${key}`;

  const newEdge: CustomEdge = {
    id,
    source,
    target,
    sourceHandle,
    targetHandle,
    label: `Edge ${key}`,
    type: "custom",
  };

  customEdges.update((es) => {
    if (
      es.some(
        (e) => e.source === source && e.target === target && !e.label && !e.type
      )
    ) {
      es = es.filter(
        (e) =>
          !(e.source === source && e.target === target && !e.label && !e.type)
      );
    }
    return [...es, newEdge];
  });
}

// Have to use Node and Edge here for SvelteFlow component
export async function handleBeforeDelete(
  {
    nodes: nodesToDelete,
    edges: toDeleteEdges,
  }: {
    nodes: Node[];
    edges: Edge[];
  },
  stores: GraphStores
): Promise<boolean> {
  const nodeNames = nodesToDelete
    .map((n) => (n.data as CustomNode["data"]).name)
    .join(", ");
  const edgeIds = toDeleteEdges.map((e) => e.id).join(", ");
  let message = "Are you sure you want to delete ";
  if (nodesToDelete.length > 0) message += `node(s) ${nodeNames}`;
  if (toDeleteEdges.length > 0) message += `edge(s) ${edgeIds}`;

  return new Promise((resolve) => {
    stores.dialog.set({
      type: "confirm",
      title: "Delete Confirmation",
      message,
      onConfirm: () => {
        stores.dialog.set(null);
        resolve(true);
      },
      onCancel: () => {
        stores.dialog.set(null);
        resolve(false);
      },
    });
  });
}

export function handleDelete({
  clickedNodes,
  clickedEdges,
  searchedNodes,
}: GraphStores) {
  clickedNodes.set([]);
  clickedEdges.set([]);
  searchedNodes.set([]);
}

export function handlePaneClick({ clickedNodes, clickedEdges }: GraphStores) {
  clickedNodes.set([]);
  clickedEdges.set([]);
}

// GLOBAL KEYDOWN
export function handleKeydown(
  event: KeyboardEvent,
  {
    customNodes,
    customEdges,
    clickedNodes,
    clickedEdges,
    searchedNodes,
    searchQuery,
  }: GraphStores
) {
  if (event.key === "Escape") {
    customNodes.update((ns) => ns.map((n) => ({ ...n, selected: false })));
    customEdges.update((es) => es.map((e) => ({ ...e, selected: false })));
    clickedNodes.set([]);
    clickedEdges.set([]);
    searchedNodes.set([]);
    searchQuery.set("");
  }
}
