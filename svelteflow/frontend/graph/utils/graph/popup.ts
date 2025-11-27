import { get } from "svelte/store";
import type { GraphStores } from "../../stores/instanceStore";
import type { Attribute, CustomEdge, CustomNode } from "../../types/schemas";

export function handleNodeEditPopupSave(
  event: CustomEvent<CustomNode>,
  stores: GraphStores
) {
  const {
    customNodes,
    customEdges,
    editingNode,
    clickedNodes,
    clickedEdges,
    searchedNodes,
    dialog,
  } = stores;
  const updatedNode = event.detail;
  // 1. Validate unique node name
  const currentNodes = get(customNodes);
  const isNameDuplicate = currentNodes.some(
    (n) =>
      n.id !== updatedNode.id &&
      (n.data as CustomNode["data"]).name === updatedNode.data.name
  );
  if (isNameDuplicate) {
    dialog.set({
      type: "alert",
      title: "Validation Error",
      message: `Node name "${updatedNode.data.name}" already exists. Please choose a unique name.`,
      onDismiss: () => dialog.set(null),
    });
    return;
  }
  // 2. Validate unique attribute keys per node
  const attributeKeys = updatedNode.data.attributes.map((attr) => attr.key);
  const hasDuplicateAttributeKeys =
    new Set(attributeKeys).size !== attributeKeys.length;
  if (hasDuplicateAttributeKeys) {
    dialog.set({
      type: "alert",
      title: "Validation Error",
      message:
        "Duplicate attribute keys found. Please ensure all attribute keys are unique within the node.",
      onDismiss: () => dialog.set(null),
    });
    return;
  }

  updatedNode.data.handles = updatedNode.data.attributes
    .filter((attr: Attribute) => attr.connectable)
    .map((attr: Attribute) => ({ id: attr.key, type: attr.type }));

  customNodes.update((currentNodes) =>
    currentNodes.map((n) => (n.id === updatedNode.id ? updatedNode : n))
  );

  const handleIds = new Set(updatedNode.data.handles.map((h) => h.id));
  customEdges.update((currentEdges) =>
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

export function handleNodeEditPopupCancel({
  editingNode,
  clickedNodes,
  clickedEdges,
  searchedNodes,
}: GraphStores) {
  editingNode.set(null);
  clickedNodes.set([]);
  clickedEdges.set([]);
  searchedNodes.set([]);
}

export function handleEdgeEditPopupSave(
  event: CustomEvent<CustomEdge>,
  {
    customEdges,
    editingEdge,
    clickedNodes,
    clickedEdges,
    searchedNodes,
  }: GraphStores
) {
  const updatedEdge = event.detail;
  customEdges.update((currentEdges) =>
    currentEdges.map((e) => (e.id === updatedEdge.id ? updatedEdge : e))
  );
  editingEdge.set(null);
  clickedNodes.set([]);
  clickedEdges.set([]);
  searchedNodes.set([]);
}

export function handleEdgeEditPopupCancel({
  editingEdge,
  clickedNodes,
  clickedEdges,
  searchedNodes,
}: GraphStores) {
  editingEdge.set(null);
  clickedNodes.set([]);
  clickedEdges.set([]);
  searchedNodes.set([]);
}
