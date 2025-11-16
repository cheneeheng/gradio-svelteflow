<script lang="ts">
  import GraphUI from "@graph-ui/GraphUI.svelte";
  import type { Graph } from "@graph-ui/types/schemas";
  import { writable } from "svelte/store";

  let graph: Graph = {
    nodes: [],
    edges: [],
    viewport: { x: 0, y: 0, zoom: 1 },
  };

  function handleSave(event: CustomEvent<Graph>) {
    const data = JSON.stringify(event.detail, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "graph.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleLoad() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (event) => {
      const input = event.target as HTMLInputElement;
      if (!input.files?.length) return;
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const loadedGraph = JSON.parse(reader.result as string);
          if (loadedGraph.nodes && loadedGraph.edges) {
            graph = loadedGraph;
          } else {
            alert("Invalid graph file format.");
          }
        } catch (e) {
          alert("Error loading graph.");
          console.error(e);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }
</script>

<GraphUI bind:value={graph} on:save={handleSave} on:load={handleLoad} />
