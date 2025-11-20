<script lang="ts">
  import type { Edge, Node } from "@xyflow/svelte";
  import { Background, Controls, MiniMap, SvelteFlow } from "@xyflow/svelte";
  import "@xyflow/svelte/dist/style.css";
  import { onMount } from "svelte";
  import { type Writable } from "svelte/store";
  import "../styles/theme.css";
  import {
    edges as edgesStore,
    interactive,
    nodes as nodesStore,
  } from "../stores/graphStore";
  import { theme } from "../stores/themeStore";
  import {
    handleBeforeDelete,
    handleConnect,
    handleDelete,
    handleEdgeClick,
    handleNodeClick,
    handleNodeDragStart,
    handleNodeDragStop,
    handlePaneClick,
    setFlowInstance,
  } from "../utils/graph";
  import CustomEdgeComponent from "./CustomEdge.svelte";
  import CustomNodeComponent from "./CustomNode.svelte";

  const nodeTypes = { custom: CustomNodeComponent };
  const edgeTypes = { custom: CustomEdgeComponent };

  let flowInstance: SvelteFlow;

  onMount(() => {
    if (flowInstance) {
      setFlowInstance(flowInstance);
    }
  });

  // local bindings are store references
  let nodes: Writable<Node[]> = nodesStore;
  let edges: Writable<Edge[]> = edgesStore;

  export let minZoom: number | undefined = undefined;
  export let maxZoom: number | undefined = undefined;
</script>

<SvelteFlow
  bind:this={flowInstance}
  bind:nodes
  bind:edges
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
  minZoom={minZoom}
  maxZoom={maxZoom}
  style="height: 100vh; background: var(--background);"
>
  <MiniMap />
  <Controls />
  <Background />
</SvelteFlow>
