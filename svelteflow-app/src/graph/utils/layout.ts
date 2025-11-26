import dagre from "dagre";
import type { Edge, Node } from "@xyflow/svelte";
import { get } from "svelte/store";
import type { GraphStores } from "../stores/instanceStore";

export type LayoutDirection = "TB" | "LR";



// All nodes are treated as 180×100 rectangles when Dagre calculates the layout.
// TODO: Make them dynamic
const nodeWidth = 180;
const nodeHeight = 100;

// - In Dagre, ranksep is the minimum vertical distance between nodes in adjacent ranks (layers).
// - Think of “ranks” as rows or columns depending on your layout direction:
// - If rankdir: "TB" (top‑to‑bottom), ranksep controls the vertical spacing between rows of nodes.
// - If rankdir: "LR" (left‑to‑right), ranksep controls the horizontal spacing between columns of nodes.
// - ranksep: 200 → ensures at least 200 units of separation between ranks.
// - nodesep: 100 → ensures at least 100 units of separation between nodes within the same rank.
const rankSep = 200;
const nodeSep = 100;

export function getLayoutedElements<N extends Node, E extends Edge>(
  nodes: N[],
  edges: E[],
  direction: LayoutDirection = "LR"
): { nodes: N[]; edges: E[] } {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  // const isHorizontal = direction === "LR";
  dagreGraph.setGraph({
    rankdir: direction,
    ranksep: rankSep,
    nodesep: nodeSep,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: node.width ?? nodeWidth,
      height: node.height ?? nodeHeight,
    });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.position = {
      x: nodeWithPosition.x - (node.width ?? nodeWidth) / 2,
      y: nodeWithPosition.y - (node.height ?? nodeHeight) / 2,
    };
  });

  return { nodes, edges };
}

export function handleLayout(
  layoutDirection: LayoutDirection,
  { customNodes, customEdges }: GraphStores
) {
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