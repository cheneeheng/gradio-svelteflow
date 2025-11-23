import { get } from "svelte/store";
import {
    customNodes,
    searchQuery
} from "../../stores/graphStore";
import {
    clickedEdges,
    clickedNodes,
    searchedNodes,
} from "../../stores/highlightStore";
import type {
    CustomNode
} from "../../types/schemas";
import { debounce } from "../debounce";

function handleSearchInternal() {
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

export const debouncedSearch = debounce(handleSearchInternal, 300);
