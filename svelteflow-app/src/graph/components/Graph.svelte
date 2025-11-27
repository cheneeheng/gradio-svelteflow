<script lang="ts">
  // ----------
  // Imports
  // ----------
  import { Background, Controls, MiniMap, SvelteFlow } from "@xyflow/svelte";
  import "@xyflow/svelte/dist/style.css";
  import { getContext, onMount } from "svelte";
  import { get, type Writable } from "svelte/store";
  import { storeKey } from "../stores/context";
  import { activeStoreId } from "../stores/activeStore";
  import type { GraphStores } from "../stores/instanceStore";
  import { theme } from "../stores/themeStore";
  import "../styles/theme.css";
  import type { CustomEdge, CustomNode } from "../types/schemas";
  import {
    handleBeforeDelete,
    handleConnect,
    handleDelete,
    handlePaneClick,
  } from "../utils/graph/canvas";
  import { handleEdgeClick } from "../utils/graph/edge";
  import {
    handleNodeClick,
    handleNodeDragStart,
    handleNodeDragStop,
  } from "../utils/graph/node";
  import CustomEdgeComponent from "./CustomEdge.svelte";
  import CustomNodeComponent from "./CustomNode.svelte";

  // ----------
  // Exports
  // ----------
  export let minZoom: number | undefined = undefined;
  export let maxZoom: number | undefined = undefined;

  // ----------
  // Local vars
  // ----------
  const stores = getContext<GraphStores>(storeKey);
  const { customEdges, customNodes, flowInstance, interactive, instanceId } =
    stores;

  const nodeTypes = { custom: CustomNodeComponent };
  const edgeTypes = { custom: CustomEdgeComponent };

  let flowInstanceLocal: SvelteFlow;

  // local bindings are store references
  let nodesLocal: Writable<CustomNode[]> = customNodes;
  let edgesLocal: Writable<CustomEdge[]> = customEdges;

  // ----------
  // Local functions
  // ----------

  // ----------
  // Reactivity + svelte utils
  // ----------
  onMount(() => {
    if (flowInstanceLocal) {
      flowInstance.set(flowInstanceLocal); // register instance in store
    }
  });
</script>

<SvelteFlow
  bind:this={flowInstanceLocal}
  bind:nodes={nodesLocal}
  bind:edges={edgesLocal}
  {nodeTypes}
  {edgeTypes}
  colorMode={$theme}
  nodesConnectable={$interactive}
  nodesDraggable={$interactive}
  elementsSelectable={$interactive}
  on:nodedragstart={(e) => handleNodeDragStart(e, stores)}
  on:nodedragstop={(e) => handleNodeDragStop(e, stores)}
  on:nodeclick={(e) => {
    activeStoreId.set(get(instanceId));
    handleNodeClick(e, stores);
  }}
  on:edgeclick={(e) => {
    activeStoreId.set(get(instanceId));
    handleEdgeClick(e, stores);
  }}
  on:paneclick={() => {
    activeStoreId.set(get(instanceId));
    handlePaneClick(stores);
  }}
  onconnect={(e) => handleConnect(e, stores)}
  ondelete={() => handleDelete(stores)}
  onbeforedelete={(e) => handleBeforeDelete(e, stores)}
  deleteKey={["Delete", "Backspace"]}
  {minZoom}
  {maxZoom}
  style="flex: 1"
>
  <MiniMap />
  <Controls />
  <Background />
</SvelteFlow>
