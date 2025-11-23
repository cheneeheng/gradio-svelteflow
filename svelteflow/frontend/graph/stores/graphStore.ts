import type { Viewport } from "@xyflow/system";
import { writable, type Writable } from "svelte/store";
import type { CustomEdge, CustomNode } from "../types/schemas";
import { SvelteFlow } from "@xyflow/svelte";

export const customNodes: Writable<CustomNode[]> = writable<CustomNode[]>([]);
export const customEdges: Writable<CustomEdge[]> = writable<CustomEdge[]>([]);
export const viewport: Writable<Viewport> = writable({ x: 0, y: 0, zoom: 1 });
export const editingNode = writable<CustomNode | null>(null);
export const editingEdge = writable<CustomEdge | null>(null);
export const searchQuery = writable("");
export const interactive = writable<boolean>(true); // intended for gradio custom component
export const flowInstance = writable<SvelteFlow | null>(null);
