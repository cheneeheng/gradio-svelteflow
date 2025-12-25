<script lang="ts">
  import GraphUI from "$shared/GraphUI.svelte";
  import type { Attribute, GraphValue, Handle } from "$shared/types/schemas";

  // Generate a large graph
  const nodes = [];
  const edges = [];

  const NODE_COUNT = 50;
  const EDGE_COUNT = 80;

  // Create nodes
  for (let i = 1; i <= NODE_COUNT; i++) {
    nodes.push({
      id: `node-${i}`,
      data: {
        name: `Node ${i}`,
        description: `Large graph node ${i}`,
        attributes: [
          {
            key: "input-main",
            value: `${i}`,
            visible: true,
            connectable: true,
            type: "input",
          } as Attribute,
          {
            key: "output-main",
            value: `${i}`,
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
      position: {
        x: (i % 10) * 250,
        y: Math.floor(i / 10) * 150,
      },
      type: "custom",
    });
  }

  // Create random edges
  function rand(max: number) {
    return Math.floor(Math.random() * max) + 1;
  }

  for (let i = 1; i <= EDGE_COUNT; i++) {
    const a = rand(NODE_COUNT);
    const b = rand(NODE_COUNT);
    if (a === b) continue;

    edges.push({
      id: `edge-${i}`,
      source: `node-${a}`,
      target: `node-${b}`,
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

  let value: GraphValue = {
    nodes,
    edges,
    loaded: true,
    zoomToNodeName: null,
  };

  let enable_virtualization = true;

  function handleChange(event: CustomEvent<GraphValue>) {
    value = event.detail;
  }
</script>

<section class="page">
  <h2>12 - Large Graph (50 nodes, 80 edges)</h2>
  <p>Demonstrates performance and virtualization with a large graph.</p>

  <div class="controls">
    <label>
      <input type="checkbox" bind:checked={enable_virtualization} />
      Enable virtualization
    </label>
  </div>

  <div class="graph-container">
    <GraphUI bind:value {enable_virtualization} on:change={handleChange} />
  </div>
</section>

<style>
  .page {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 1rem;
    gap: 0.5rem;
  }

  .controls {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .graph-container {
    flex: 1;
    min-height: 0;
  }
</style>
