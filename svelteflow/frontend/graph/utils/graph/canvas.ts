import { type Edge, type Node } from "@xyflow/svelte";
import type { Connection } from "@xyflow/system";
import { get } from "svelte/store";
import { FEATURES } from "../../constants";
import { activeStoreId } from "../../stores/activeStore";
import type { GraphStores } from "../../stores/instanceStore";
import type {
  CustomEdge,
  CustomNode,
  GraphEventMeta,
} from "../../types/schemas";
import { isValidConnection } from "../typeGuards";
import { uuidv4 } from "../uuid";

/**
 * Handles new connections between nodes.
 * Validates connection types and prevents invalid connections.
 */
export function handleConnect(
  connection: Connection,
  { customEdges, customNodes }: GraphStores
) {
  const { source, target, sourceHandle, targetHandle } = connection;
  if (!source || !target) return;

  // Prevent self-loops if feature disabled
  if (!FEATURES.ALLOW_SELF_LOOPS && source === target) {
    console.warn("Cannot connect a node to itself (self-loops disabled)");
    return;
  }

  // Validate connection types
  const nodes = get(customNodes);
  const sourceNode = nodes.find((n) => n.id === source);
  const targetNode = nodes.find((n) => n.id === target);

  if (sourceNode && targetNode && sourceHandle && targetHandle) {
    const sourceAttr = sourceNode.data.attributes.find(
      (a) => a.key === sourceHandle
    );
    const targetAttr = targetNode.data.attributes.find(
      (a) => a.key === targetHandle
    );

    if (!isValidConnection(sourceAttr?.type, targetAttr?.type)) {
      console.warn(
        "Invalid connection: source must be output, target must be input"
      );
      return;
    }
  }

  // Remove any temporary edges between same nodes
  const currentEdges = get(customEdges).filter(
    (e) => !(e.source === source && e.target === target && !e.label && !e.type)
  );

  // Count existing edges to generate label
  const parallelEdges = currentEdges.filter(
    (edge) => edge.source === source && edge.target === target
  );

  // Use UUID for edge ID to prevent collisions
  const id = uuidv4();

  const newEdge: CustomEdge = {
    id,
    source,
    target,
    sourceHandle,
    targetHandle,
    label: `Edge ${parallelEdges.length + 1}`,
    type: "custom",
  };

  customEdges.set([...currentEdges, newEdge]);
}

/**
 * Handles before-delete event with user confirmation.
 * Returns a promise that resolves to whether deletion should proceed.
 */
export async function handleBeforeDelete(
  {
    nodes: nodesToDelete,
    edges: edgesToDelete,
  }: {
    nodes: Node[];
    edges: Edge[];
  },
  stores: GraphStores
): Promise<boolean> {
  // Only handle if this is the active store
  if (get(activeStoreId) !== get(stores.instanceId)) {
    return false;
  }

  if (nodesToDelete.length === 0 && edgesToDelete.length === 0) {
    return false;
  }

  const nodeNames = nodesToDelete
    .map((n) => {
      const data = n.data as CustomNode["data"];
      return data.name || n.id;
    })
    .join(", ");
  const edgeLabels = edgesToDelete
    .map((e) => {
      const edge = e as CustomEdge;
      return edge.label || edge.id;
    })
    .join(", ");

  let message = "Are you sure you want to delete ";
  if (nodesToDelete.length > 0) {
    message += `${nodesToDelete.length} node(s): ${nodeNames}`;
  }
  if (edgesToDelete.length > 0) {
    if (nodesToDelete.length > 0) message += " and ";
    message += `${edgesToDelete.length} edge(s): ${edgeLabels}`;
  }
  message += "?";

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

/**
 * Handles post-deletion cleanup.
 * Clears highlights and selections.
 */
export function handleDelete({
  clickedNodes,
  clickedEdges,
  searchedNodes,
}: GraphStores) {
  clickedNodes.set([]);
  clickedEdges.set([]);
  searchedNodes.set([]);
}

/**
 * Clears all selections and highlights.
 */
export function clearSelection(stores: GraphStores): GraphEventMeta {
  const {
    customNodes,
    customEdges,
    clickedNodes,
    clickedEdges,
    searchedNodes,
    searchQuery,
  } = stores;

  customNodes.update((ns) => ns.map((n) => ({ ...n, selected: false })));
  customEdges.update((es) => es.map((e) => ({ ...e, selected: false })));

  clickedNodes.set([]);
  clickedEdges.set([]);
  searchedNodes.set([]);

  return {
    eventType: "selectionClear",
    handleId: "graph:selection:clear",
    sourceType: "graph",
    timestamp: new Date().toISOString(),
  };
}

/**
 * Handles clicks on the canvas pane.
 * Clears all selections and highlights.
 */
export function handlePaneClick(stores: GraphStores): GraphEventMeta {
  return clearSelection(stores);
}

/**
 * Global keydown handler for keyboard shortcuts.
 */
export function handleKeydown(
  event: KeyboardEvent,
  stores: GraphStores,
  config: { enableGridSnap: boolean; gridSize: number } = {
    enableGridSnap: false,
    gridSize: 20,
  }
): GraphEventMeta | null {
  const { customNodes, searchQuery } = stores;

  const target = event.target as HTMLElement;
  if (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.isContentEditable
  ) {
    return null;
  }

  if (event.key === "Escape") {
    event.preventDefault();
    searchQuery.set("");
    return clearSelection(stores);
  }

  if (event.key.startsWith("Arrow")) {
    const nodes = get(customNodes);
    const selected = nodes.filter((n) => n.selected);
    if (selected.length === 0) return null;

    event.preventDefault();

    const step = config.enableGridSnap ? config.gridSize : 10;
    let dx = 0;
    let dy = 0;

    if (event.key === "ArrowUp") dy = -step;
    if (event.key === "ArrowDown") dy = step;
    if (event.key === "ArrowLeft") dx = -step;
    if (event.key === "ArrowRight") dx = step;

    const diffs: Record<string, any> = {};
    const updatedNodes = nodes.map((n) => {
      if (n.selected) {
        const oldPos = { ...n.position };
        const newX = n.position.x + dx;
        const newY = n.position.y + dy;

        diffs[n.id] = {
          position: { from: oldPos, to: { x: newX, y: newY } },
        };
        return { ...n, position: { x: newX, y: newY } };
      }
      return n;
    });

    customNodes.set(updatedNodes);

    return {
      eventType: "nodeMove",
      handleId: "keyboard:arrow",
      sourceType: "node",
      timestamp: new Date().toISOString(),
      diff: diffs,
    };
  }

  return null;
}
