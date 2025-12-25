<script lang="ts">
  import GraphUI from "$shared/GraphUI.svelte";
  import type { GraphValue } from "$shared/types/schemas";

  let toolbarVisibility = {
    add: true,
    save: false,
    load: false,
    layout: true,
    zoom: true,
    center: true,
    delete: true,
  };
  const toolbarKeys = Object.keys(toolbarVisibility) as Array<
    keyof typeof toolbarVisibility
  >;

  let value: GraphValue = {
    nodes: [
      {
        id: "node-1",
        data: {
          name: "Toolbar Node 1",
          description: "Node used for toolbar visibility demo",
          attributes: [
            {
              key: "value",
              value: "alpha",
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
          name: "Toolbar Node 2",
          description: "Second node for toolbar visibility demo",
          attributes: [
            {
              key: "value",
              value: "beta",
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
  <h2>14 - Toolbar visibility</h2>
  <p>Toggle individual toolbar buttons on or off.</p>

  <div class="controls">
    <!-- {#each Object.keys(toolbarVisibility) as key} -->
    {#each toolbarKeys as key}
      <label>
        <input type="checkbox" bind:checked={toolbarVisibility[key]} />
        {key}
      </label>
    {/each}
  </div>

  <div class="graph-container">
    <GraphUI
      bind:value
      toolbar_visibility={toolbarVisibility}
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
  }

  .graph-container {
    flex: 1;
    min-height: 0;
  }
</style>
