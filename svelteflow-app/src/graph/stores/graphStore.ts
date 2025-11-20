import type { Edge, Node } from "@xyflow/svelte";
import type { Viewport } from "@xyflow/system";
import { writable, type Writable } from "svelte/store";
import type { CustomEdge, CustomNode } from "../types/schemas";

export const nodes: Writable<Node[]> = writable<Node[]>([]);
export const edges: Writable<Edge[]> = writable<Edge[]>([]);
export const viewport: Writable<Viewport> = writable({ x: 0, y: 0, zoom: 1 });
export const editingNode = writable<CustomNode | null>(null);
export const editingEdge = writable<CustomEdge | null>(null);
export const interactive = writable<boolean>(true);
export const searchQuery = writable("");
