<script lang="ts">
  import GraphUI from "$shared/GraphUI.svelte";
  import type { GraphValue } from "$shared/types/schemas";

  let value: GraphValue = {
    nodes: [
      {
        id: "node-1",
        data: {
          name: "Toolbar Node 1",
          description: "Node used to demonstrate toolbar features",
          attributes: [
            {
              key: "input-main",
              value: "1",
              visible: true,
              connectable: true,
              type: "input",
            },
            {
              key: "output-main",
              value: "2",
              visible: true,
              connectable: true,
              type: "output",
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
          name: "Toolbar Node 2",
          description: "Second node for toolbar example",
          attributes: [
            {
              key: "input-main",
              value: "3",
              visible: true,
              connectable: true,
              type: "input",
            },
            {
              key: "output-main",
              value: "4",
              visible: true,
              connectable: true,
              type: "output",
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

  let toolbarSize: "extra-small" | "small" | "medium" | "large" = "small";

  function handleChange(event: CustomEvent<GraphValue>) {
    value = event.detail;
  }
</script>

<section class="page">
  <h2>03 - Toolbar features</h2>
  <p>Toggle toolbar size and major actions.</p>

  <div class="controls">
    <label>
      Size:
      <select bind:value={toolbarSize}>
        <option value="extra-small">extra-small</option>
        <option value="small">small</option>
        <option value="medium">medium</option>
        <option value="large">large</option>
      </select>
    </label>
  </div>

  <div class="graph-container">
    <GraphUI bind:value toolbar_size={toolbarSize} on:change={handleChange} />
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
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem;
  }

  .graph-container {
    flex: 1;
    min-height: 0;
  }
</style>
