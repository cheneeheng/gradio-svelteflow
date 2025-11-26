import type { Viewport } from "@xyflow/system";
import { writable, type Writable } from "svelte/store";
import type { CustomEdge, CustomNode } from "../types/schemas";
import { SvelteFlow } from "@xyflow/svelte";
import type { LayoutDirection } from "../utils/layout";
import { createUIStores } from "./uiStore";

export function createGraphStores() {
  const customNodes: Writable<CustomNode[]> = writable<CustomNode[]>([]);
  const customEdges: Writable<CustomEdge[]> = writable<CustomEdge[]>([]);
  const viewport: Writable<Viewport> = writable({ x: 0, y: 0, zoom: 1 });
  const editingNode = writable<CustomNode | null>(null);
  const editingEdge = writable<CustomEdge | null>(null);
  const searchQuery = writable("");
  const interactive = writable<boolean>(true);
  const flowInstance = writable<SvelteFlow | null>(null);
  const layoutDirection: Writable<LayoutDirection> = writable("LR");

  const clickedNodes = writable<string[]>([]);
  const clickedEdges = writable<string[]>([]);
  const searchedNodes = writable<string[]>([]);

  // non-store state
  let clickTimer: NodeJS.Timeout | null = null;
  let isDragging: boolean = false;

  const uiStores = createUIStores();

  return {
    customNodes,
    customEdges,
    viewport,
    editingNode,
    editingEdge,
    searchQuery,
    interactive,
    flowInstance,
    layoutDirection,
    clickedNodes,
    clickedEdges,
    searchedNodes,
    ...uiStores,
    clickTimer,
    isDragging,
  };
}

export type GraphStores = ReturnType<typeof createGraphStores>;