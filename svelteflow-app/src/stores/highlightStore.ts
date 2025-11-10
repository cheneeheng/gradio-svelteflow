import { writable } from 'svelte/store';

export const highlightedNodes = writable<string[]>([]);
export const highlightedEdges = writable<string[]>([]);
