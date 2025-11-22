import { get } from "svelte/store";
import {
  customEdges,
  customNodes,
  editingEdge,
  editingNode,
} from "../../stores/graphStore";
import {
  clickedEdges,
  clickedNodes,
  searchedNodes,
} from "../../stores/highlightStore";
import type { Attribute, CustomEdge, CustomNode } from "../../types/schemas";

export function handleNodeEditPopupSave(event: CustomEvent<CustomNode>) {
  const updatedNode = event.detail;
  // 1. Validate unique node name
  const currentNodes = get(customNodes);
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

export function handleNodeEditPopupCancel() {
  editingNode.set(null);
  clickedNodes.set([]);
  clickedEdges.set([]);
  searchedNodes.set([]);
}

export function handleEdgeEditPopupSave(event: CustomEvent<CustomEdge>) {
  const updatedEdge = event.detail;
  customEdges.update((currentEdges) =>
    currentEdges.map((e) => (e.id === updatedEdge.id ? updatedEdge : e))
  );
  editingEdge.set(null);
  clickedNodes.set([]);
  clickedEdges.set([]);
  searchedNodes.set([]);
}

export function handleEdgeEditPopupCancel() {
  editingEdge.set(null);
  clickedNodes.set([]);
  clickedEdges.set([]);
  searchedNodes.set([]);
}
