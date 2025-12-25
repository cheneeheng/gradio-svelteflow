<script lang="ts">
  import GraphUI from "$shared/GraphUI.svelte";
  import type { GraphValue } from "$shared/types/schemas";

  let value: GraphValue = {
    nodes: [
      {
        id: "node-1",
        data: {
          name: "Node 1",
          description: "Minimal example node",
          attributes: [
            {
              key: "value",
              value: "42",
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
          name: "Node 2",
          description: "Second node in minimal example",
          attributes: [
            {
              key: "value",
              value: "99",
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
        position: { x: 300, y: 0 },
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
        label: "Edge 1",
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

  function handleChange(event: CustomEvent<GraphValue>) {
    value = event.detail;
  }
</script>

<section class="page">
  <h2>01 - Minimal GraphUI usage</h2>
  <p>Basic rendering with two‑way binding and a small default graph.</p>

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

  .graph-container {
    flex: 1;
    min-height: 0;
  }
</style>
