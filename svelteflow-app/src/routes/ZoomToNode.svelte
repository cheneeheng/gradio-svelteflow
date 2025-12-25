<script lang="ts">
  import GraphUI from "$shared/GraphUI.svelte";
  import type { GraphValue } from "$shared/types/schemas";

  let value: GraphValue = {
    nodes: [
      {
        id: "node-1",
        data: {
          name: "Alpha",
          description: "First node to zoom to",
          attributes: [
            {
              key: "value",
              value: "1",
              visible: true,
              connectable: true,
              type: "input",
            },
          ],
          handles: [
            { id: "input-main", type: "input" },
            { id: "output-main", type: "output" },
          ],
          collapsed: false,
        },
        position: { x: 0, y: 0 },
        type: "custom",
      },
      {
        id: "node-2",
        data: {
          name: "Beta",
          description: "Second node to zoom to",
          attributes: [
            {
              key: "value",
              value: "2",
              visible: true,
              connectable: true,
              type: "input",
            },
          ],
          handles: [
            { id: "input-main", type: "input" },
            { id: "output-main", type: "output" },
          ],
          collapsed: false,
        },
        position: { x: 350, y: 0 },
        type: "custom",
      },
      {
        id: "node-3",
        data: {
          name: "Gamma",
          description: "Third node to zoom to",
          attributes: [
            {
              key: "value",
              value: "3",
              visible: true,
              connectable: true,
              type: "input",
            },
          ],
          handles: [
            { id: "input-main", type: "input" },
            { id: "output-main", type: "output" },
          ],
          collapsed: false,
        },
        position: { x: 700, y: 0 },
        type: "custom",
      },
    ],
    edges: [
      {
        id: "edge-1-2",
        source: "node-1",
        target: "node-2",
        sourceHandle: "output-main",
        targetHandle: "input-main",
        label: "A → B",
        type: "custom",
        selected: false,
        data: {
          originalSourceHandle: "output-main",
          originalTargetHandle: "input-main",
        },
      },
      {
        id: "edge-2-3",
        source: "node-2",
        target: "node-3",
        sourceHandle: "output-main",
        targetHandle: "input-main",
        label: "B → C",
        type: "custom",
        selected: false,
        data: {
          originalSourceHandle: "output-main",
          originalTargetHandle: "input-main",
        },
      },
    ],
    loaded: true,
    zoomToNodeName: null,
  };

  function zoomTo(name: string) {
    value = { ...value, zoomToNodeName: name };
  }

  function handleChange(event: CustomEvent<GraphValue>) {
    value = event.detail;
  }
</script>

<section class="page">
  <h2>04 - Zoom to node</h2>
  <p>Click a button to zoom the viewport to a specific node.</p>

  <div class="controls">
    <button on:click={() => zoomTo("Alpha")}>Zoom to Alpha</button>
    <button on:click={() => zoomTo("Beta")}>Zoom to Beta</button>
    <button on:click={() => zoomTo("Gamma")}>Zoom to Gamma</button>
  </div>

  <div class="graph-container">
    <GraphUI bind:value on:change={handleChange} />
  </div>
</section>

<style>
  .page {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 1rem;
    box-sizing: border-box;
    gap: 0.5rem;
  }

  .controls {
    display: flex;
    gap: 0.5rem;
  }

  .graph-container {
    flex: 1;
    min-height: 0;
  }
</style>
