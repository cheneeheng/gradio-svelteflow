import { writable } from 'svelte/store';

export const clickedNodes = writable<string[]>([]);
export const clickedEdges = writable<string[]>([]);
export const searchedNodes = writable<string[]>([]);
