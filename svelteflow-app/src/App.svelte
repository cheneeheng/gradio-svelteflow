<script lang="ts">
  import GraphUI from "$shared/GraphUI.svelte";

  let zoomId = "";
  let graphValue1 = {
    nodes: [],
    edges: [],
    loaded: false,
    zoomToNodeName: null,
  };
  let graphValue2 = {
    nodes: [],
    edges: [],
    loaded: false,
    zoomToNodeName: null,
  };

  // Apply button handler
  function applyZoom() {
    const trimmed = zoomId.trim();
    graphValue1 = {
      ...graphValue1,
      zoomToNodeName: trimmed === "" ? null : trimmed,
    };
  }

  // Clear button handler
  function clearZoom() {
    zoomId = "";
    graphValue1 = {
      ...graphValue1,
      zoomToNodeName: null,
    };
  }

  // Handle zoom completion from GraphUI
  function handleZoomComplete() {
    graphValue1 = {
      ...graphValue1,
      zoomToNodeName: null,
    };
  }

  // Handle changes from GraphUI
  function handleGraph1Change(event: CustomEvent) {
    graphValue1 = event.detail;
  }

  function handleGraph2Change(event: CustomEvent) {
    graphValue2 = event.detail;
  }
</script>

<div style="height: 90vh">
  <!-- Controls -->
  <div class="controls">
    <label for="zoom-name"><strong>Zoom to node name:</strong></label>
    <input
      id="zoom-name"
      type="text"
      placeholder="e.g. Node-abc1"
      bind:value={zoomId}
      class="zoom-input"
    />
    <button type="button" on:click={applyZoom} class="btn btn-primary">
      Apply
    </button>
    <button type="button" on:click={clearZoom} class="btn btn-secondary">
      Clear
    </button>
  </div>

  <GraphUI
    toolbar_enable_save_load={true}
    toolbar_enable_add={true}
    canvas_min_height="0px"
    bind:value={graphValue1}
    on:zoomComplete={handleZoomComplete}
    on:change={handleGraph1Change}
  />

  <!-- <GraphUI
    toolbar_enable_save_load={true}
    toolbar_enable_add={true}
    canvas_min_height="0px"
    bind:value={graphValue2}
    on:change={handleGraph2Change}
  /> -->
</div>

<style>
  .controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    background: var(--background, #fff);
    border-bottom: 1px solid var(--node-border, #ccc);
  }

  .zoom-input {
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--input-border, #ccc);
    border-radius: 4px;
    width: 16rem;
    background: var(--input-background, #fff);
    color: var(--input-text, #222);
    font-size: 0.9rem;
  }

  .zoom-input:focus {
    outline: none;
    border-color: var(--accent-color, #007bff);
    box-shadow: 0 0 0 2px var(--accent-color-light, rgba(0, 123, 255, 0.25));
  }

  .btn {
    padding: 0.5rem 1rem;
    border-radius: 4px;
    border: 1px solid transparent;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    transition:
      background-color 0.2s,
      border-color 0.2s;
  }

  .btn-primary {
    background: var(--accent-color, #007bff);
    color: white;
    border-color: var(--accent-color, #007bff);
  }

  .btn-primary:hover {
    background: var(--accent-color-dark, #0056b3);
  }

  .btn-secondary {
    background: var(--button-secondary-background, #f0f0f0);
    color: var(--button-secondary-text, #222);
    border-color: var(--button-border, #ccc);
  }

  .btn-secondary:hover {
    background: var(--button-secondary-hover-background, #e0e0e0);
  }
</style>
