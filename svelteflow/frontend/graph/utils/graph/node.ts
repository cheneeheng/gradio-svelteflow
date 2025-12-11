import { type Node } from "@xyflow/svelte";
import { get } from "svelte/store";
import { DOUBLE_CLICK_DELAY } from "../../constants";
import type { GraphStores } from "../../stores/instanceStore";
import type {
  CollapsibleEdgeData,
  CustomEdge,
  CustomNode,
} from "../../types/schemas";
import { isCustomNode } from "../typeGuards";
import { uuidv4 } from "../uuid";

/**
 * Adds a new node to the graph at the center of the viewport.
 */
export function handleAddNode({
  flowInstance,
  viewport,
  customNodes,
}: GraphStores) {
  const instance = get(flowInstance);
  const container = instance?.$el as HTMLElement | undefined;
  const v = get(viewport);
  const cx = container ? container.clientWidth / 2 : 250;
  const cy = container ? container.clientHeight / 2 : 150;
  const x = (cx - v.x) / v.zoom;
  const y = (cy - v.y) / v.zoom;
  const id = uuidv4();
  const newNode: CustomNode = {
    id,
    position: { x, y },
    data: {
      name: `Node-${id.substring(0, 4)}`,
      description: "This is a new node.",
      attributes: [],
      handles: [],
      collapsed: false,
    },
    type: "custom",
  };
  customNodes.update((n) => [...n, newNode]);
}

/**
 * Handles collapsing/expanding a node and updates connected edges.
 * Uses immutable updates for edges.
 */
function handleNodeCollapse(
  nodeId: string,
  isCollapsed: boolean,
  { customEdges }: GraphStores
) {
  customEdges.update((edges) => {
    return edges.map((edge) => {
      let updatedEdge = edge;
      const data: CollapsibleEdgeData = edge.data || {};

      // Handle source
      if (edge.source === nodeId) {
        if (isCollapsed) {
          // Save original handle and switch to collapsed handle
          updatedEdge = {
            ...updatedEdge,
            sourceHandle: "output-collapsed",
            data: {
              ...data,
              originalSourceHandle: edge.sourceHandle,
            },
          };
        } else if (data.originalSourceHandle !== undefined) {
          // Restore original handle
          const { originalSourceHandle, ...restData } = data;
          updatedEdge = {
            ...updatedEdge,
            sourceHandle: originalSourceHandle,
            data: restData,
          };
        }
      }

      // Handle target
      if (edge.target === nodeId) {
        if (isCollapsed) {
          // Save original handle and switch to collapsed handle
          const currentData = updatedEdge.data as CollapsibleEdgeData;
          updatedEdge = {
            ...updatedEdge,
            targetHandle: "input-collapsed",
            data: {
              ...currentData,
              originalTargetHandle: edge.targetHandle,
            },
          };
        } else if (
          (updatedEdge.data as CollapsibleEdgeData).originalTargetHandle !==
          undefined
        ) {
          // Restore original handle
          const currentData = updatedEdge.data as CollapsibleEdgeData;
          const { originalTargetHandle, ...restData } = currentData;
          updatedEdge = {
            ...updatedEdge,
            targetHandle: originalTargetHandle,
            data: restData,
          };
        }
      }

      return updatedEdge;
    });
  });
}

/**
 * Called when node drag starts.
 */
export function handleNodeDragStart(event: CustomEvent, stores: GraphStores) {
  stores.isDragging = true;
}

/**
 * Highlights neighbors of a node (connected nodes and edges).
 */
function highlightNeighbors(node: CustomNode, stores: GraphStores) {
  const {
    interactive,
    searchedNodes,
    customEdges,
    clickedNodes,
    clickedEdges,
  } = stores;

  if (!get(interactive)) return;

  // Clear search highlights
  searchedNodes.set([]);

  // Find connected edges
  const connectedEdges = get(customEdges).filter(
    (edge) => edge.source === node.id || edge.target === node.id
  );

  // Find neighbor node IDs
  const neighborIds = connectedEdges
    .flatMap((edge: CustomEdge) => [edge.source, edge.target])
    .filter((id: string) => id !== node.id);

  // Set highlights
  clickedNodes.set([...new Set(neighborIds)]);
  clickedEdges.set(connectedEdges.map((edge) => edge.id));
}

/**
 * Called when node drag stops.
 */
export function handleNodeDragStop(
  event: CustomEvent<{
    targetNode: Node<Record<string, unknown>, string> | null;
    nodes: Node<Record<string, unknown>, string>[];
    event: MouseEvent | TouchEvent;
  }>,
  stores: GraphStores
) {
  const targetNode = event.detail.targetNode;

  if (targetNode && isCustomNode(targetNode)) {
    highlightNeighbors(targetNode, stores);
  }

  // Use small delay to allow drag to complete
  if (stores.dragStopTimer) {
    clearTimeout(stores.dragStopTimer);
  }

  stores.dragStopTimer = setTimeout(() => {
    stores.isDragging = false;
    stores.dragStopTimer = null;
  }, 10);
}

/**
 * Handles node clicks with double-click detection.
 * Returns the action taken for caller to handle state updates.
 */
export function handleNodeClick(
  customEvent: CustomEvent<{
    node: Node<Record<string, unknown>, string>;
    event: MouseEvent | TouchEvent;
  }>,
  stores: GraphStores
): { action: "collapse" | "expand" | "edit" | "select" } | void {
  // Ignore clicks during drag
  if (stores.isDragging) return;

  const target = customEvent.detail.event.target as HTMLElement;
  const node = customEvent.detail.node;

  // Validate node type
  if (!isCustomNode(node)) {
    console.warn("Invalid node type clicked");
    return;
  }

  // Handle collapse/expand button
  if (target.closest(".collapse-toggle-btn")) {
    const isCollapsed = !node.data.collapsed;

    stores.customNodes.update((nds) =>
      nds.map((n) => {
        if (n.id === node.id) {
          return { ...n, data: { ...n.data, collapsed: isCollapsed } };
        }
        return n;
      })
    );

    handleNodeCollapse(node.id, isCollapsed, stores);

    return { action: isCollapsed ? "collapse" : "expand" };
  }

  // Handle double-click detection
  if (stores.clickTimer) {
    clearTimeout(stores.clickTimer);
    stores.clickTimer = null;
    handleNodeDoubleClick(customEvent, stores);
    return { action: "edit" };
  } else {
    stores.clickTimer = setTimeout(() => {
      // Single-click: highlight neighbors
      if (get(stores.interactive)) {
        highlightNeighbors(node, stores);
      }
      stores.clickTimer = null;
    }, DOUBLE_CLICK_DELAY);
    return { action: "select" };
  }
}

/**
 * Handles double-click on a node to open edit popup.
 */
function handleNodeDoubleClick(
  customEvent: CustomEvent<{
    node: Node<Record<string, unknown>, string>;
    event: MouseEvent | TouchEvent;
  }>,
  { interactive, editingNode }: GraphStores
) {
  const clickedNode = customEvent.detail.node;

  if (!isCustomNode(clickedNode)) {
    console.warn("Invalid node type for editing");
    return;
  }

  if (get(interactive) && customEvent.detail.event instanceof MouseEvent) {
    editingNode.set(clickedNode);
  }
}
