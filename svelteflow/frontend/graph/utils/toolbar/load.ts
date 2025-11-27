import type { GraphStores } from "../../stores/instanceStore";

// customEdges and customNodes are saved under "nodes" and "edges" keys in the json file
// TODO: for gradio, move the alert to gradio.Error
export function handleLoadGraph(event: Event, stores: GraphStores) {
  const { customNodes, customEdges, viewport, dialog } = stores;
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
        dialog.set({
          type: "alert",
          title: "Invalid Graph",
          message: "The loaded file has an invalid graph format.",
          onDismiss: () => dialog.set(null),
        });
      }
    } catch (e) {
      dialog.set({
        type: "alert",
        title: "Load Error",
        message: "An error occurred while loading the graph.",
        onDismiss: () => dialog.set(null),
      });
      console.error(e);
    }
  };
  reader.readAsText(file);
}

export function triggerLoad(stores: GraphStores) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = (e) => handleLoadGraph(e, stores);
  input.click();
}
