<script lang="ts">
  import GraphUI from "$shared/GraphUI.svelte";
  import type { GraphValue } from "$shared/types/schemas";

  const initialValue: GraphValue = {
    nodes: [
      {
        id: "node-1",
        data: {
          name: "Controlled Node 1",
          description: "A node managed by external state",
          attributes: [
            {
              key: "value",
              value: "123",
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
          name: "Controlled Node 2",
          description: "Another externally controlled node",
          attributes: [
            {
              key: "value",
              value: "456",
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

  let value: GraphValue = initialValue;

  function resetGraph() {
    value = {
      ...initialValue,
      nodes: [...initialValue.nodes],
      edges: [...initialValue.edges],
    };
  }

  function handleChange(event: CustomEvent<GraphValue>) {
    value = event.detail;
  }
</script>

<section class="page">
  <h2>02 - Controlled state</h2>
  <p>
    This example treats <code>GraphUI</code> as a controlled component with external
    state.
  </p>

  <div class="controls">
    <button type="button" on:click={resetGraph}
      >Reset graph to initial state</button
    >
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
    align-items: center;
  }

  .graph-container {
    flex: 1;
    min-height: 0;
  }
</style>
