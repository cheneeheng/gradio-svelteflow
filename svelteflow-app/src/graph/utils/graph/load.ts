import { customEdges, customNodes, viewport } from "../../stores/graphStore";

// customEdges and customNodes are saved under "nodes" and "edges" keys in the json file
// TODO: for gradio, move the alert to gradio.Error
export function handleLoadGraph(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;
  const file = input.files[0];
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const graph = JSON.parse(reader.result as string);
      if (graph.nodes && graph.edges) {
        customNodes.set(graph.nodes);
        customEdges.set(graph.edges);
        if (graph.viewport) {
          viewport.set(graph.viewport);
        }
      } else {
        alert("Invalid graph file format.");
      }
    } catch (e) {
      alert("Error loading graph.");
      console.error(e);
    }
  };
  reader.readAsText(file);
}

export function triggerLoad() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = handleLoadGraph;
  input.click();
}
