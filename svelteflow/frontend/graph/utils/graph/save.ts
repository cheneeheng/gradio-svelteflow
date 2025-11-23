import { get } from "svelte/store";
import { customEdges, customNodes, viewport } from "../../stores/graphStore";

// customEdges and customNodes are saved under "nodes" and "edges" keys in the json file
// TODO: make the download url editable
export function handleSaveGraph() {
  const graph = {
    nodes: get(customNodes),
    edges: get(customEdges),
    viewport: get(viewport),
  };
  const data = JSON.stringify(graph, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "graph.json";
  a.click();
  URL.revokeObjectURL(url);
}
