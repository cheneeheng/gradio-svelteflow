import { get } from "svelte/store";
import type { GraphStores } from "../../stores/instanceStore";
import type { CustomNode } from "../../types/schemas";
import { debounce } from "../debounce";

function handleSearchInternal({
  clickedNodes,
  clickedEdges,
  searchQuery,
  searchedNodes,
  customNodes,
}: GraphStores) {
  clickedNodes.set([]);
  clickedEdges.set([]);
  const query = get(searchQuery);
  if (query.length === 0) {
    searchedNodes.set([]);
    return;
  }
  const matchingNodes = get(customNodes).filter((node) =>
    (node.data as CustomNode["data"]).name
      .toLowerCase()
      .includes(query.toLowerCase())
  );
  searchedNodes.set(matchingNodes.map((node) => node.id));
}

export const debouncedSearch = (stores: GraphStores) =>
  debounce(() => handleSearchInternal(stores), 300);
