<script lang="ts">
  import GraphUI from "$shared/GraphUI.svelte";
  import type { GraphValue } from "$shared/types/schemas";

  let padding = 200;
  let showGrid = true;
  let gridSize = 25;

  let value: GraphValue = {
    nodes: [
      {
        id: "node-1",
        data: {
          name: "Canvas Node 1",
          description: "Node demonstrating canvas layout options",
          attributes: [
            {
              key: "value",
              value: "X",
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
          name: "Canvas Node 2",
          description: "Second node for canvas layout demo",
          attributes: [
            {
              key: "value",
              value: "Y",
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
        position: { x: 350, y: 200 },
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
        label: "Canvas Edge",
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
  <h2>15 - Canvas layout</h2>
  <p>Control padding, grid visibility, and background spacing.</p>

  <div class="controls">
    <label>
      Canvas padding:
      <input type="number" bind:value={padding} min="0" max="1000" />
    </label>

    <label>
      <input type="checkbox" bind:checked={showGrid} />
      Show grid
    </label>

    <label>
      Grid size:
      <input type="number" bind:value={gridSize} min="5" max="200" />
    </label>
  </div>

  <div class="graph-container">
    <GraphUI
      bind:value
      grid_size={gridSize}
      on:change={handleChange}
    />
  </div>
</section>

<style>
  .page {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 1rem;
    gap: 0.75rem;
  }

  .controls {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
  }

  .graph-container {
    flex: 1;
    min-height: 0;
  }
</style>
