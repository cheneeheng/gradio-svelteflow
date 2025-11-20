import type { Edge, Node } from "@xyflow/svelte";
import { SvelteFlow } from "@xyflow/svelte";
import type { Connection } from "@xyflow/system";
import { get } from "svelte/store";
import {
  edges,
  editingEdge,
  editingNode,
  interactive,
  nodes,
  searchQuery,
  viewport,
} from "../stores/graphStore";
import {
  clickedEdges,
  clickedNodes,
  searchedNodes,
} from "../stores/highlightStore";
import { theme } from "../stores/themeStore";
import type {
  Attribute,
  CollapsibleEdgeData,
  CustomEdge,
  CustomNode,
} from "../types/schemas";
import { debounce } from "./debounce";
import { getLayoutedElements, type LayoutDirection } from "./layout";
import { uuidv4 } from "./uuid";

let flowInstance: SvelteFlow;
let isDragging = false;
let clickTimer: number | null = null;

// INSTANCE
export function setFlowInstance(instance: SvelteFlow) {
  flowInstance = instance;
}

// THEME
export function toggleTheme() {
  theme.update((t) => (t === "light" ? "dark" : "light"));
}

// LAYOUT
export function handleLayout(layoutDirection: LayoutDirection) {
  const currentNodes = get(nodes);
  const currentEdges = get(edges);
  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
    currentNodes,
    currentEdges,
    layoutDirection
  );
  nodes.set([...layoutedNodes]);
  edges.set([...layoutedEdges]);
}

// SVELTEFLOW HANDLERS
export function handleConnect(connection: Connection) {
  const { source, target, sourceHandle, targetHandle } = connection;
  if (!source || !target) return;

  let currentEdges = get(edges).filter(
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

  edges.update((es) => {
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

export async function handleBeforeDelete({
  nodes: nodesToDelete,
  edges: toDeleteEdges,
}: {
  nodes: Node[];
  edges: Edge[];
}): Promise<boolean> {
  const nodeNames = nodesToDelete
    .map((n) => (n.data as CustomNode["data"]).name)
    .join(", ");
  const edgeIds = toDeleteEdges.map((e) => e.id).join(", ");
  let message = "Are you sure you want to delete ";
  if (nodesToDelete.length > 0) message += `node(s) ${nodeNames}`;
  if (toDeleteEdges.length > 0) message += `edge(s) ${edgeIds}`;

  return confirm(message);
}

export function handleDelete() {
  clickedNodes.set([]);
  clickedEdges.set([]);
  searchedNodes.set([]);
}

export function handlePaneClick() {
  clickedNodes.set([]);
  clickedEdges.set([]);
}

// NODE HANDLERS
export function handleAddNode() {
  const container = (flowInstance?.$el as HTMLElement) ?? null;
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
  nodes.update((n) => [...n, newNode]);
}

function handleNodeCollapse(nodeId: string, isCollapsed: boolean) {
  edges.update((es) => {
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
  const connectedEdges = get(edges).filter(
    (edge) => edge.source === node.id || edge.target === node.id
  );
  const neighborIds = connectedEdges
    .flatMap((edge) => [edge.source, edge.target])
    .filter((id) => id !== node.id);
  clickedNodes.set([...new Set(neighborIds)]);
  clickedEdges.set(connectedEdges.map((edge) => edge.id));
}

export function handleNodeDragStop(
  e: CustomEvent<{
    targetNode: Node<Record<string, unknown>, string>;
    nodes: Node<Record<string, unknown>, string>[];
    event: MouseEvent | TouchEvent;
  }>
) {
  const clickedNode = e.detail.targetNode as CustomNode;
  highlightNeighbors(clickedNode);
  setTimeout(() => (isDragging = false), 10);
}

export function handleNodeClick(
  e: CustomEvent<{ node: Node; event: MouseEvent | TouchEvent }>
) {
  if (isDragging) return;
  const target = e.detail.event.target as HTMLElement;
  const node = e.detail.node as CustomNode;

  if (target.closest(".collapse-toggle-btn")) {
    nodes.update((nds) =>
      nds.map((n) => {
        if (n.id === node.id) {
          return { ...n, data: { ...n.data, collapsed: !n.data.collapsed } };
        }
        return n;
      })
    );
    handleNodeCollapse(node.id, !node.data.collapsed);
    return;
  }

  if (clickTimer) {
    clearTimeout(clickTimer);
    clickTimer = null;
    handleNodeDoubleClick(e);
  } else {
    clickTimer = setTimeout(() => {
      if (get(interactive)) {
        highlightNeighbors(node);
      }
      clickTimer = null;
    }, 250);
  }
}

function handleNodeDoubleClick(
  e: CustomEvent<{
    node: Node;
    event: MouseEvent | TouchEvent;
  }>
) {
  const clickedNode = e.detail.node as CustomNode;
  if (get(interactive) && e.detail.event instanceof MouseEvent) {
    editingNode.set(clickedNode);
  }
}

export function handleSaveNode(event: CustomEvent<CustomNode>) {
  const updatedNode = event.detail;
  // 1. Validate unique node name
  const currentNodes = get(nodes);
  const isNameDuplicate = currentNodes.some(
    (n) =>
      n.id !== updatedNode.id &&
      (n.data as CustomNode["data"]).name === updatedNode.data.name
  );
  if (isNameDuplicate) {
    alert(
      `Node name "${updatedNode.data.name}" already exists. Please choose a unique name.`
    );
    return;
  }
  // 2. Validate unique attribute keys per node
  const attributeKeys = updatedNode.data.attributes.map((attr) => attr.key);
  const hasDuplicateAttributeKeys =
    new Set(attributeKeys).size !== attributeKeys.length;
  if (hasDuplicateAttributeKeys) {
    alert(
      "Duplicate attribute keys found. Please ensure all attribute keys are unique within the node."
    );
    return;
  }

  updatedNode.data.handles = updatedNode.data.attributes
    .filter((attr: Attribute) => attr.connectable)
    .map((attr: Attribute) => ({ id: attr.key, type: attr.type }));

  nodes.update((currentNodes) =>
    currentNodes.map((n) => (n.id === updatedNode.id ? updatedNode : n))
  );

  const handleIds = new Set(updatedNode.data.handles.map((h) => h.id));
  edges.update((currentEdges) =>
    currentEdges.filter((edge) => {
      if (
        edge.source === updatedNode.id &&
        edge.sourceHandle &&
        !handleIds.has(edge.sourceHandle)
      )
        return false;
      if (
        edge.target === updatedNode.id &&
        edge.targetHandle &&
        !handleIds.has(edge.targetHandle)
      )
        return false;
      return true;
    })
  );

  editingNode.set(null);
  clickedNodes.set([]);
  clickedEdges.set([]);
  searchedNodes.set([]);
}

export function handleCancelEdit() {
  editingNode.set(null);
  clickedNodes.set([]);
  clickedEdges.set([]);
  searchedNodes.set([]);
}

// EDGE HANDLERS
export function handleEdgeClick(
  e: CustomEvent<{ edge: Edge; event: MouseEvent | TouchEvent }>
) {
  const edge = e.detail.edge as CustomEdge;
  if (clickTimer) {
    clearTimeout(clickTimer);
    clickTimer = null;
    handleEdgeDoubleClick(e);
  } else {
    clickTimer = setTimeout(() => {
      // single-click logic for edges can go here
      clickTimer = null;
    }, 250);
  }
}

function handleEdgeDoubleClick(
  e: CustomEvent<{ edge: Edge; event: MouseEvent | TouchEvent }>
) {
  const clickedEdge = e.detail.edge as CustomEdge;
  if (get(interactive) && e.detail.event instanceof MouseEvent) {
    editingEdge.set(clickedEdge);
  }
}

export function handleSaveEdge(event: CustomEvent<CustomEdge>) {
  const updatedEdge = event.detail;
  edges.update((currentEdges) =>
    currentEdges.map((e) => (e.id === updatedEdge.id ? updatedEdge : e))
  );
  editingEdge.set(null);
  clickedNodes.set([]);
  clickedEdges.set([]);
  searchedNodes.set([]);
}

export function handleCancelEdgeEdit() {
  editingEdge.set(null);
  clickedNodes.set([]);
  clickedEdges.set([]);
  searchedNodes.set([]);
}

// GRAPH HANDLERS (SAVE/LOAD)
export function handleSaveGraph() {
  const graph = {
    nodes: get(nodes),
    edges: get(edges),
    viewport: get(viewport),
  };
  const data = JSON.stringify(graph, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "graph.json";
  a.click();
  URL.revokeObjectURL(url);
}

export function handleLoadGraph(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;
  const file = input.files[0];
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const graph = JSON.parse(reader.result as string);
      if (graph.nodes && graph.edges) {
        nodes.set(graph.nodes);
        edges.set(graph.edges);
        if (graph.viewport) {
          viewport.set(graph.viewport);
        }
      } else {
        alert("Invalid graph file format.");
      }
    } catch (e) {
      alert("Error loading graph.");
      console.error(e);
    }
  };
  reader.readAsText(file);
}

export function triggerLoad() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = handleLoadGraph;
  input.click();
}

// SEARCH
function handleSearchInternal() {
  clickedNodes.set([]);
  clickedEdges.set([]);
  const query = get(searchQuery);
  if (query.length === 0) {
    searchedNodes.set([]);
    return;
  }
  const matchingNodes = get(nodes).filter((node) =>
    (node.data as CustomNode["data"]).name
      .toLowerCase()
      .includes(query.toLowerCase())
  );
  searchedNodes.set(matchingNodes.map((node) => node.id));
}

export const debouncedSearch = debounce(handleSearchInternal, 300);

// GLOBAL KEYDOWN
export function handleKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    nodes.update((ns) => ns.map((n) => ({ ...n, selected: false })));
    edges.update((es) => es.map((e) => ({ ...e, selected: false })));
    clickedNodes.set([]);
    clickedEdges.set([]);
    searchedNodes.set([]);
    searchQuery.set("");
  }
}
