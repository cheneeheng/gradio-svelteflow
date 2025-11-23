<script lang="ts">
  // ----------
  // Imports
  // ----------
  import type { LoadingStatus } from "@gradio/statustracker";
  import type { Gradio } from "@gradio/utils";
  import {
    Background,
    Controls,
    MiniMap,
    SvelteFlow,
    type Node,
  } from "@xyflow/svelte";
  import "@xyflow/svelte/dist/style.css";
  import type { Connection } from "@xyflow/system";
  import { onMount } from "svelte";
  import { get, type Writable } from "svelte/store";
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
  export let gradio: Gradio<{
    change: { nodes: CustomNode[]; edges: CustomEdge[] };
    select: { nodes: CustomNode[]; edges: CustomEdge[] };
    submit: { nodes: CustomNode[]; edges: CustomEdge[] };
    clear_status: LoadingStatus;
  }>;
  export let value: {
    nodes: CustomNode[];
    edges: CustomEdge[];
    loaded: boolean;
  } = {
    nodes: [],
    edges: [],
    loaded: false,
  };
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
  function handleConnectWrapper(connection: Connection) {
    handleConnect(connection);
    // value.nodes = get(customNodes);
    value.edges = get(customEdges);
    gradio.dispatch("change", value);
  }

  function handleDeleteWrapper() {
    handleDelete();
    value.nodes = get(customNodes);
    value.edges = get(customEdges);
    gradio.dispatch("change", value);
  }

  function handleNodeClickWrapper(
    customEvent: CustomEvent<{
      node: Node<Record<string, unknown>, string>;
      event: MouseEvent | TouchEvent;
    }>
  ) {
    const result = handleNodeClick(customEvent);
    if (result === true) {
      value.nodes = get(customNodes);
      value.edges = get(customEdges);
      gradio.dispatch("change", value);
    }
  }

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
  on:nodedragstart={handleNodeDragStart}
  on:nodedragstop={handleNodeDragStop}
  on:nodeclick={handleNodeClickWrapper}
  on:edgeclick={handleEdgeClick}
  on:paneclick={handlePaneClick}
  onconnect={handleConnectWrapper}
  ondelete={handleDeleteWrapper}
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
