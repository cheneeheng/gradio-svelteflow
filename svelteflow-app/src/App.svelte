<script lang="ts">
  import GraphUI from "./graph/GraphUI.svelte";

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
</script>

<div style="height: 95vh">
  <!-- Controls -->
  <div style="display: flex; align-items: center; gap: 0.5rem;">
    <label for="zoom-id"><strong>Zoom to node id:</strong></label>
    <input
      id="zoom-id"
      type="text"
      placeholder="e.g. node-123"
      bind:value={zoomId}
      style="padding: 0.375rem 0.5rem; border: 1px solid #ccc; border-radius: 4px; width: 16rem;"
    />
    <button type="button" on:click={applyZoom}>Apply</button>
    <button type="button" on:click={clearZoom}>Clear</button>
  </div>
  <GraphUI
    toolbar_enable_save_load={true}
    toolbar_enable_add={true}
    canvas_min_height="0px"
    bind:value={graphValue1}
  />
  <GraphUI
    toolbar_enable_save_load={true}
    toolbar_enable_add={true}
    canvas_min_height="0px"
    bind:value={graphValue2}
  />
</div>
<!-- 
<div style="height: 300px; width: 800px">
  <SvelteFlowProvider>
    <GraphUI
      toolbar_enable_save_load={true}
      toolbar_enable_add={true}
      canvas_min_height="0px"
    />
  </SvelteFlowProvider>
  <SvelteFlowProvider>
    <GraphUI
      toolbar_enable_save_load={true}
      toolbar_enable_add={true}
      canvas_min_height="0px"
    />
  </SvelteFlowProvider>
  <SvelteFlowProvider>
    <GraphUI
      toolbar_enable_save_load={true}
      toolbar_enable_add={true}
      canvas_min_height="0px"
    />
  </SvelteFlowProvider>
</div> -->
