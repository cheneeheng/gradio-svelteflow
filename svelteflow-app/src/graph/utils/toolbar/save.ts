import { get } from "svelte/store";
import type { GraphStores } from "../../stores/instanceStore";

// customEdges and customNodes are saved under "nodes" and "edges" keys in the json file
// TODO: make the download url editable
export async function handleSaveGraph(stores: GraphStores) {
  const graph = {
    nodes: get(stores.customNodes),
    edges: get(stores.customEdges),
    viewport: get(stores.viewport),
  };
  const data = JSON.stringify(graph, null, 2);
  const blob = new Blob([data], { type: "application/json" });

  if (window.showSaveFilePicker) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: "graph.json",
        types: [
          {
            description: "JSON Files",
            accept: { "application/json": [".json"] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
    } catch (err) {
      // Check if user cancelled vs actual error
      if (err.name !== "AbortError") {
        stores.dialog.set({
          type: "alert",
          title: "Save Error",
          message: "Failed to save the graph. Please try again.",
          onDismiss: () => stores.dialog.set(null),
        });
        console.error("Save error:", err);
      }
    }
  } else {
    // fallback
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "graph.json";
    a.click();
    URL.revokeObjectURL(url);
  }
}
