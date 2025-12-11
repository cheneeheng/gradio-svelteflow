import { get } from "svelte/store";
import type { GraphStores } from "../../stores/instanceStore";
import type { Attribute, CustomEdge, CustomNode } from "../../types/schemas";
import { isValidAttributeKey, isValidNodeName } from "../typeGuards";

/**
 * Handles saving node edits from the popup.
 * Validates node name uniqueness and attribute key uniqueness.
 */
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

  // Validate node name is not empty
  if (!isValidNodeName(updatedNode.data.name)) {
    dialog.set({
      type: "alert",
      title: "Validation Error",
      message: "Node name cannot be empty.",
      onDismiss: () => dialog.set(null),
    });
    return;
  }

  // Validate unique node name
  const currentNodes = get(customNodes);
  const isNameDuplicate = currentNodes.some(
    (n) => n.id !== updatedNode.id && n.data.name === updatedNode.data.name
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

  // Validate attribute keys are not empty
  const hasEmptyAttributeKey = updatedNode.data.attributes.some(
    (attr) => !isValidAttributeKey(attr.key)
  );

  if (hasEmptyAttributeKey) {
    dialog.set({
      type: "alert",
      title: "Validation Error",
      message: "Attribute keys cannot be empty.",
      onDismiss: () => dialog.set(null),
    });
    return;
  }

  // Validate unique attribute keys per node
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

  // Update handles based on connectable attributes
  updatedNode.data.handles = updatedNode.data.attributes
    .filter((attr: Attribute) => attr.connectable)
    .map((attr: Attribute) => ({ id: attr.key, type: attr.type }));

  // Update node in store (immutable)
  customNodes.update((currentNodes) =>
    currentNodes.map((n) => (n.id === updatedNode.id ? updatedNode : n))
  );

  // Remove edges connected to deleted handles
  const handleIds = new Set(updatedNode.data.handles.map((h) => h.id));
  customEdges.update((currentEdges) =>
    currentEdges.filter((edge) => {
      if (
        edge.source === updatedNode.id &&
        edge.sourceHandle &&
        !handleIds.has(edge.sourceHandle)
      ) {
        return false;
      }
      if (
        edge.target === updatedNode.id &&
        edge.targetHandle &&
        !handleIds.has(edge.targetHandle)
      ) {
        return false;
      }
      return true;
    })
  );

  // Clear editing state and highlights
  editingNode.set(null);
  clickedNodes.set([]);
  clickedEdges.set([]);
  searchedNodes.set([]);
}

/**
 * Handles canceling node edit popup.
 */
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

/**
 * Handles saving edge edits from the popup.
 */
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
  // Update edge in store (immutable)
  customEdges.update((currentEdges) =>
    currentEdges.map((e) => (e.id === updatedEdge.id ? updatedEdge : e))
  );
  // Clear editing state and highlights
  editingEdge.set(null);
  clickedNodes.set([]);
  clickedEdges.set([]);
  searchedNodes.set([]);
}

/**
 * Handles canceling edge edit popup.
 */
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
