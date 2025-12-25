<script lang="ts">
  import GraphUI from "$shared/GraphUI.svelte";
  import type { GraphValue } from "$shared/types/schemas";

  let layout: "elkjs" | "dagre" = "dagre";

  let value: GraphValue = {
    nodes: [
      {
        id: "node-1",
        data: {
          name: "Layout Node 1",
          description: "First node for layout engine demo",
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
          name: "Layout Node 2",
          description: "Second node for layout engine demo",
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
      {
        id: "node-3",
        data: {
          name: "Layout Node 3",
          description: "Third node for layout engine demo",
          attributes: [
            {
              key: "input-main",
              value: "5",
              visible: true,
              connectable: true,
              type: "input",
            },
          ],
          handles: [{ id: "input-main", type: "input" }],
          collapsed: false,
        },
        position: { x: 600, y: 0 },
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

  function handleChange(event: CustomEvent<GraphValue>) {
    value = event.detail;
  }
</script>

<section class="page">
  <h2>07 - Layout engines</h2>
  <p>Switch between Dagre or Elkjs</p>

  <div class="controls">
    <label>
      Layout:
      <select bind:value={layout}>
        <option value="elkjs">Elkjs</option>
        <option value="dagre">Dagre</option>
      </select>
    </label>
  </div>

  <div class="graph-container">
    <GraphUI bind:value layout_engine={layout} on:change={handleChange} />
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
