<script lang="ts">
  import GraphUI from "$shared/GraphUI.svelte";
  import type { GraphValue } from "$shared/types/schemas";

  let valueA: GraphValue = {
    nodes: [
      {
        id: "a1",
        data: {
          name: "Instance A - Node 1",
          description: "First node in instance A",
          attributes: [
            {
              key: "input-main",
              value: "1",
              visible: true,
              connectable: true,
              type: "input",
            },
          ],
          handles: [{ id: "input-main", type: "input" }],
          collapsed: false,
        },
        position: { x: 0, y: 0 },
        type: "custom",
      },
    ],
    edges: [],
    loaded: true,
    zoomToNodeName: null,
  };

  let valueB: GraphValue = {
    nodes: [
      {
        id: "b1",
        data: {
          name: "Instance B - Node 1",
          description: "First node in instance B",
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
        id: "b2",
        data: {
          name: "Instance B - Node 2",
          description: "Second node in instance B",
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
        id: "edge-b1-b2",
        source: "b1",
        target: "b2",
        sourceHandle: "output-main",
        targetHandle: "input-main",
        label: "B1 → B2",
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

  function handleChangeA(event: CustomEvent<GraphValue>) {
    valueA = event.detail;
  }

  function handleChangeB(event: CustomEvent<GraphValue>) {
    valueB = event.detail;
  }
</script>

<section class="page">
  <h2>11 - Multiple GraphUI Instances</h2>
  <p>Two independent graphs rendered on the same page.</p>

  <div class="instances">
    <div class="instance">
      <h3>Instance A</h3>
      <GraphUI bind:value={valueA} on:change={handleChangeA} />
    </div>

    <div class="instance">
      <h3>Instance B</h3>
      <GraphUI bind:value={valueB} on:change={handleChangeB} />
    </div>
  </div>
</section>

<style>
  .page {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 1rem;
    gap: 1rem;
  }

  .instances {
    display: flex;
    gap: 1rem;
    height: 100%;
  }

  .instance {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    border: 1px solid #ccc;
    border-radius: 6px;
    padding: 0.5rem;
  }

  .instance h3 {
    margin: 0 0 0.5rem 0;
  }
</style>
