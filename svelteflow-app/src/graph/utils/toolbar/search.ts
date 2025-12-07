import { get } from "svelte/store";
import { SEARCH_DEBOUNCE_DELAY } from "../../constants";
import type { GraphStores } from "../../stores/instanceStore";
import type { CustomNode } from "../../types/schemas";
import { debounce } from "../debounce";

/**
 * Internal search handler that finds nodes matching the search query.
 * Clears click highlights but preserves selection state.
 */
function handleSearchInternal({
  clickedNodes,
  clickedEdges,
  searchQuery,
  searchedNodes,
  customNodes,
}: GraphStores) {
  // Clear click highlights (but not selections)
  clickedNodes.set([]);
  clickedEdges.set([]);

  const query = get(searchQuery);

  // Clear search results if query is empty
  if (query.length === 0) {
    searchedNodes.set([]);
    return;
  }

  // Find matching nodes by name (case-insensitive)
  const lowerQuery = query.toLowerCase();
  const matchingNodes = get(customNodes).filter((node) =>
    (node.data as CustomNode["data"]).name.toLowerCase().includes(lowerQuery)
  );

  searchedNodes.set(matchingNodes.map((node) => node.id));
}

/**
 * Creates a debounced search function for the given stores.
 * The debounced function will clean up any pending timeouts when called.
 *
 * @param stores - Graph stores containing search state
 * @returns Debounced search function
 */
export const debouncedSearch = (stores: GraphStores) =>
  debounce(() => handleSearchInternal(stores), SEARCH_DEBOUNCE_DELAY);
