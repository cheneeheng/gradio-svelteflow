<script lang="ts">
  import GraphUI from "$shared/GraphUI.svelte";
  import type { Attribute, GraphValue, Handle } from "$shared/types/schemas";

  let counter = 1;

  let value: GraphValue = {
    nodes: [],
    edges: [],
    loaded: true,
    zoomToNodeName: null,
  };

  function addNode() {
    const id = `node-${counter}`;

    const newNode = {
      id,
      data: {
        name: `Generated ${id}`,
        description: "Programmatically created node",
        attributes: [
          {
            key: "input-main",
            value: `${counter}`,
            visible: true,
            connectable: true,
            type: "input",
          } as Attribute,
          {
            key: "output-main",
            value: `${counter}`,
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
        x: Math.random() * 600,
        y: Math.random() * 400,
      },
      type: "custom",
    };

    value = {
      ...value,
      nodes: [...value.nodes, newNode],
    };
    counter++;
  }

  function connectLastTwo() {
    if (value.nodes.length < 2) return;

    const a = value.nodes[value.nodes.length - 2];
    const b = value.nodes[value.nodes.length - 1];

    const newEdge = {
      id: `edge-${a.id}-${b.id}`,
      source: a.id,
      target: b.id,
      sourceHandle: "output-main",
      targetHandle: "input-main",
      label: `${a.data.name} → ${b.data.name}`,
      type: "custom",
      selected: false,
      data: {
        originalSourceHandle: "output-main",
        originalTargetHandle: "input-main",
      },
    };

    value = {
      ...value,
      edges: [...value.edges, newEdge],
    };
  }

  function handleChange(event: CustomEvent<GraphValue>) {
    value = event.detail;
  }
</script>

<section class="page">
  <h2>13 - Programmatic creation</h2>
  <p>Add nodes and edges dynamically at runtime.</p>

  <div class="controls">
    <button on:click={addNode}>Add Node</button>
    <button on:click={connectLastTwo}>Connect Last Two Nodes</button>
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
    gap: 0.75rem;
  }

  .controls {
    display: flex;
    gap: 0.75rem;
  }

  .graph-container {
    flex: 1;
    min-height: 0;
  }
</style>
