<script lang="ts">
  // ----------
  // Imports
  // ----------
  import { Background, Controls, MiniMap, SvelteFlow } from "@xyflow/svelte";
  import "@xyflow/svelte/dist/style.css";
  import { onMount } from "svelte";
  import { type Writable } from "svelte/store";
  import {
    customEdges,
    customNodes,
    flowInstance,
    interactive,
  } from "../stores/graphStore";
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

<!-- TODO: make the height adjustable -->
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
  on:nodedragstart={handleNodeDragStart}
  on:nodedragstop={handleNodeDragStop}
  on:nodeclick={handleNodeClick}
  on:edgeclick={handleEdgeClick}
  on:paneclick={handlePaneClick}
  onconnect={handleConnect}
  ondelete={handleDelete}
  onbeforedelete={handleBeforeDelete}
  deleteKey={["Delete", "Backspace"]}
  {minZoom}
  {maxZoom}
  style="flex: 1"
>
  <MiniMap />
  <Controls />
  <Background />
</SvelteFlow>
