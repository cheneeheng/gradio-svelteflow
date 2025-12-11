import type { GraphStores } from "../../stores/instanceStore";
import { isValidGraphStructure } from "../typeGuards";

/**
 * Handles loading a graph from a JSON file.
 * Validates structure before loading.
 */
export function handleLoadGraph(event: Event, stores: GraphStores) {
  const { customNodes, customEdges, viewport, dialog } = stores;
  const input = event.target as HTMLInputElement;

  if (!input.files?.length) return;

  const file = input.files[0];
  const reader = new FileReader();

  reader.onload = async () => {
    try {
      const rawData = reader.result as string;
      let graph: any;

      try {
        graph = JSON.parse(rawData);
      } catch (parseError) {
        dialog.set({
          type: "alert",
          title: "Invalid JSON",
          message: "The file contains invalid JSON and cannot be parsed.",
          onDismiss: () => dialog.set(null),
        });
        return;
      }

      // Validate graph structure
      if (!isValidGraphStructure(graph)) {
        dialog.set({
          type: "alert",
          title: "Invalid Graph",
          message:
            "The loaded file has an invalid graph format. Expected structure with nodes and edges arrays.",
          onDismiss: () => dialog.set(null),
        });
        return;
      }

      // Load the graph
      customNodes.set(graph.nodes);
      customEdges.set(graph.edges);

      if (graph.viewport) {
        viewport.set(graph.viewport);
      }

      // Success notification
      dialog.set({
        type: "alert",
        title: "Graph Loaded",
        message: `Successfully loaded ${graph.nodes.length} nodes and ${graph.edges.length} edges.`,
        onDismiss: () => dialog.set(null),
      });
    } catch (e) {
      dialog.set({
        type: "alert",
        title: "Load Error",
        message: "An unexpected error occurred while loading the graph.",
        onDismiss: () => dialog.set(null),
      });
      console.error("Error loading graph:", e);
    }
  };

  reader.onerror = () => {
    dialog.set({
      type: "alert",
      title: "File Read Error",
      message: "Failed to read the file. Please try again.",
      onDismiss: () => dialog.set(null),
    });
  };

  reader.readAsText(file);
}

/**
 * Triggers the file input dialog to load a graph.
 */
export function triggerLoad(stores: GraphStores) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  // Reset value to allow loading the same file multiple times
  input.value = "";
  input.onchange = (e) => {
    handleLoadGraph(e, stores);
    // Clean up the input element after use
    input.remove();
  };
  input.click();
}
