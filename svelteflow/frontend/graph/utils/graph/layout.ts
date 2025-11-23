import { get } from "svelte/store";
import { customEdges, customNodes } from "../../stores/graphStore";
import { getLayoutedElements, type LayoutDirection } from "../layout";

export function handleLayout(layoutDirection: LayoutDirection) {
  const currentNodes = get(customNodes);
  const currentEdges = get(customEdges);
  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
    currentNodes,
    currentEdges,
    layoutDirection
  );
  customNodes.set([...layoutedNodes]);
  customEdges.set([...layoutedEdges]);
}
