import { type Node } from "@xyflow/svelte";
import { get } from "svelte/store";
import {
  customEdges,
  customNodes,
  editingNode,
  flowInstance,
  interactive,
  viewport,
} from "../../stores/graphStore";
import {
  clickedEdges,
  clickedNodes,
  searchedNodes,
} from "../../stores/highlightStore";
import type {
  CollapsibleEdgeData,
  CustomEdge,
  CustomNode,
} from "../../types/schemas";
import { uuidv4 } from "../uuid";

let clickTimer: number | null = null;
let isDragging = false;

export function handleAddNode() {
  const instance = get(flowInstance);
  const container = (instance?.$el as HTMLElement) ?? null;
  const v = get(viewport);
  const cx = container ? container.clientWidth / 2 : 250;
  const cy = container ? container.clientHeight / 2 : 150;
  const x = (cx - v.x) / v.zoom;
  const y = (cy - v.y) / v.zoom;
  const id = uuidv4();
  const newNode: CustomNode = {
    id,
    position: { x: x, y: y },
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

// TODO: Rewrite to remove return, and inplace value mutation in map()
function handleNodeCollapse(nodeId: string, isCollapsed: boolean) {
  customEdges.update((es) => {
    return es.map((edge) => {
      const data = edge.data as CollapsibleEdgeData;
      if (edge.source === nodeId) {
        if (isCollapsed) {
          edge.data = { ...data, originalSourceHandle: edge.sourceHandle };
          edge.sourceHandle = "output-collapsed";
        } else if (data.originalSourceHandle) {
          edge.sourceHandle = data.originalSourceHandle;
          delete data.originalSourceHandle;
        }
      }
      if (edge.target === nodeId) {
        if (isCollapsed) {
          edge.data = { ...data, originalTargetHandle: edge.targetHandle };
          edge.targetHandle = "input-collapsed";
        } else if (data.originalTargetHandle) {
          edge.targetHandle = data.originalTargetHandle;
          delete data.originalTargetHandle;
        }
      }
      return edge;
    });
  });
}

export function handleNodeDragStart() {
  isDragging = true;
}

function highlightNeighbors(node: CustomNode) {
  if (!get(interactive)) return;
  searchedNodes.set([]);
  const connectedEdges = get(customEdges).filter(
    (edge) => edge.source === node.id || edge.target === node.id
  );
  const neighborIds = connectedEdges
    .flatMap((edge: CustomEdge) => [edge.source, edge.target])
    .filter((id: string) => id !== node.id);
  clickedNodes.set([...new Set(neighborIds)]);
  clickedEdges.set(connectedEdges.map((edge) => edge.id));
}

// Have to use Node here for SvelteFlow component
export function handleNodeDragStop(
  event: CustomEvent<{
    targetNode: Node<Record<string, unknown>, string> | null;
    nodes: Node<Record<string, unknown>, string>[];
    event: MouseEvent | TouchEvent;
  }>
) {
  const clickedNode = event.detail.targetNode as CustomNode;
  highlightNeighbors(clickedNode);
  setTimeout(() => (isDragging = false), 10);
}

// Have to use Node here for SvelteFlow component
// TODO: Change to return explicit flag type
export function handleNodeClick(
  customEvent: CustomEvent<{
    node: Node<Record<string, unknown>, string>;
    event: MouseEvent | TouchEvent;
  }>
): boolean | void {
  if (isDragging) return;
  const target = customEvent.detail.event.target as HTMLElement;
  const node = customEvent.detail.node as CustomNode;

  if (target.closest(".collapse-toggle-btn")) {
    customNodes.update((nds) =>
      nds.map((n) => {
        if (n.id === node.id) {
          return { ...n, data: { ...n.data, collapsed: !n.data.collapsed } };
        }
        return n;
      })
    );
    handleNodeCollapse(node.id, !node.data.collapsed);
    return true;
  }

  if (clickTimer) {
    clearTimeout(clickTimer);
    clickTimer = null;
    handleNodeDoubleClick(customEvent);
  } else {
    clickTimer = setTimeout(() => {
      if (get(interactive)) {
        highlightNeighbors(node);
      }
      clickTimer = null;
    }, 250);
  }
}

// Have to use Node here for SvelteFlow component
function handleNodeDoubleClick(
  customEvent: CustomEvent<{
    node: Node<Record<string, unknown>, string>;
    event: MouseEvent | TouchEvent;
  }>
) {
  const clickedNode = customEvent.detail.node as CustomNode;
  if (get(interactive) && customEvent.detail.event instanceof MouseEvent) {
    editingNode.set(clickedNode);
  }
}
