import { SvelteFlow } from "@xyflow/svelte";
import type { Viewport } from "@xyflow/system";
import { writable, type Writable } from "svelte/store";
import type { CustomEdge, CustomNode } from "../types/schemas";
import type { LayoutDirection } from "../utils/layout";
import { createUIStores } from "./uiStore";

export type DebouncedFn = ((...args: any[]) => void) & { cancel: () => void };

function _createGraphStoresInternal() {
  const instanceId = writable<string | null>(null);
  const customNodes: Writable<CustomNode[]> = writable<CustomNode[]>([]);
  const customEdges: Writable<CustomEdge[]> = writable<CustomEdge[]>([]);
  const viewport: Writable<Viewport> = writable({ x: 0, y: 0, zoom: 1 });
  const editingNode = writable<CustomNode | null>(null);
  const editingEdge = writable<CustomEdge | null>(null);
  const searchQuery = writable("");
  const interactive = writable<boolean>(true);
  const flowInstance = writable<SvelteFlow | null>(null);
  const layoutDirection: Writable<LayoutDirection> = writable("LR");
  const zoomToNodeName = writable<string | null>(null);

  const clickedNodes = writable<string[]>([]);
  const clickedEdges = writable<string[]>([]);
  const searchedNodes = writable<string[]>([]);

  const uiStores = createUIStores();

  return {
    instanceId,
    customNodes,
    customEdges,
    viewport,
    editingNode,
    editingEdge,
    searchQuery,
    interactive,
    flowInstance,
    layoutDirection,
    zoomToNodeName,
    clickedNodes,
    clickedEdges,
    searchedNodes,
    ...uiStores,
  };
}

export function createGraphStores(): GraphStores {
  const base = _createGraphStoresInternal();

  // Non-store state for timers and flags
  let clickTimer: ReturnType<typeof setTimeout> | null = null;
  let dragStopTimer: ReturnType<typeof setTimeout> | null = null;
  let isDragging: boolean = false;
  let debouncedSearchFn: DebouncedFn | null = null;

  return {
    ...base,
    clickTimer,
    dragStopTimer,
    isDragging,
    debouncedSearchFn,
  };
}

export type GraphStores = ReturnType<typeof _createGraphStoresInternal> & {
  debouncedSearchFn: DebouncedFn | null;
  clickTimer: ReturnType<typeof setTimeout> | null;
  dragStopTimer: ReturnType<typeof setTimeout> | null;
  isDragging: boolean;
};
