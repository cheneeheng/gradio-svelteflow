import { writable } from "svelte/store";

export const activeStoreId = writable<string | null>(null);
