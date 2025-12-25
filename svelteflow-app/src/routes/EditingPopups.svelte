<script lang="ts">
  import GraphUI from "$shared/GraphUI.svelte";
  import type { GraphValue } from "$shared/types/schemas";

  let showPopup = false;
  let selectedNodeId: string | null = null;

  let value: GraphValue = {
    nodes: [
      {
        id: "node-1",
        data: {
          name: "Editable Node 1",
          description: "Click to edit this node",
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
          name: "Editable Node 2",
          description: "Another editable node",
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
        label: "Editable Edge",
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

  function handleNodeClick(event: CustomEvent<{ nodeId: string }>) {
    selectedNodeId = event.detail.nodeId;
    showPopup = true;
  }

  function updateNodeName(newName: string) {
    if (!selectedNodeId) return;

    value = {
      ...value,
      nodes: value.nodes.map((n) =>
        n.id === selectedNodeId
          ? {
              ...n,
              data: {
                ...n.data,
                name: newName,
              },
            }
          : n
      ),
    };
  }

  function closePopup() {
    showPopup = false;
    selectedNodeId = null;
  }

  function handleChange(event: CustomEvent<GraphValue>) {
    value = event.detail;
  }

  function handleNameInput(e: Event) {
    const input = e.currentTarget as HTMLInputElement;
    updateNodeName(input.value);
  }
</script>

<section class="page">
  <h2>09 - Editing popups</h2>
  <p>Click a node to open a popup editor.</p>

  <div class="graph-container">
    <GraphUI
      bind:value
      on:node_click={handleNodeClick}
      on:change={handleChange}
    />
  </div>

  {#if showPopup && selectedNodeId}
    <div class="popup-backdrop" on:click={closePopup}>
      <div class="popup" on:click|stopPropagation>
        <h3>Edit Node</h3>

        <label>
          Name:
          <input
            type="text"
            value={value.nodes.find((n) => n.id === selectedNodeId)?.data.name}
            on:input={handleNameInput}
          />
        </label>

        <button on:click={closePopup}>Close</button>
      </div>
    </div>
  {/if}
</section>

<style>
  .page {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 1rem;
    gap: 0.5rem;
  }

  .graph-container {
    flex: 1;
    min-height: 0;
  }

  .popup-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .popup {
    background: white;
    padding: 1rem;
    border-radius: 6px;
    min-width: 250px;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .popup input {
    width: 100%;
  }
</style>
