<script lang="ts">
  import GraphUI from "$shared/GraphUI.svelte";
  import type { Attribute, GraphValue, Handle } from "$shared/types/schemas";

  // A simple 3×3 grid of nodes to demonstrate virtualization + grid snapping
  const nodes = [];
  const edges = [];

  let idCounter = 1;

  for (let y = 0; y < 3; y++) {
    for (let x = 0; x < 3; x++) {
      const id = `node-${idCounter++}`;

      nodes.push({
        id,
        data: {
          name: `Grid ${id}`,
          description: "Node in a grid layout",
          attributes: [
            {
              key: "input-main",
              value: `${idCounter}`,
              visible: true,
              connectable: true,
              type: "input",
            } as Attribute,
            {
              key: "output-main",
              value: `${idCounter}`,
              visible: true,
              connectable: true,
              type: "output",
            } as Attribute,
          ],
          handles: [
            { id: "input-main", type: "input" } as Handle,
            { id: "output-main", type: "output" } as Handle,
          ],
          collapsed: false,
        },
        position: { x: x * 250, y: y * 150 },
        type: "custom",
      });
    }
  }

  // Connect each node to the one on its right (simple grid edges)
  for (let i = 1; i <= 9; i++) {
    if (i % 3 !== 0) {
      edges.push({
        id: `edge-${i}-${i + 1}`,
        source: `node-${i}`,
        target: `node-${i + 1}`,
        sourceHandle: "output-main",
        targetHandle: "input-main",
        label: `Edge ${i}`,
        type: "custom",
        selected: false,
        data: {
          originalSourceHandle: "output-main",
          originalTargetHandle: "input-main",
        },
      });
    }
  }

  let value: GraphValue = {
    nodes,
    edges,
    loaded: true,
    zoomToNodeName: null,
  };

  let snapToGrid = true;
  let gridSize = 25;

  function handleChange(event: CustomEvent<GraphValue>) {
    value = event.detail;
  }
</script>

<section class="page">
  <h2>06 - Grid + Virtualization</h2>
  <p>Demonstrates grid snapping and virtualization with a 3×3 node grid.</p>

  <div class="controls">
    <label>
      <input type="checkbox" bind:checked={snapToGrid} />
      Snap to grid
    </label>

    <label>
      Grid size:
      <input type="number" bind:value={gridSize} min="5" max="200" />
    </label>
  </div>

  <div class="graph-container">
    <GraphUI
      bind:value
      enable_grid_snap={snapToGrid}
      grid_size={gridSize}
      enable_virtualization={true}
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
    box-sizing: border-box;
    gap: 0.5rem;
  }

  .controls {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .graph-container {
    flex: 1;
    min-height: 0;
  }
</style>
