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
  import { getContext, onMount } from "svelte";
  import { get, type Writable } from "svelte/store";
  import { activeStoreId } from "../stores/activeStore";
  import { storeKey } from "../stores/context";
  import type { GraphStores } from "../stores/instanceStore";
  import { theme } from "../stores/themeStore";
  import "../styles/theme.css";
  import type { CustomEdge, CustomNode, GraphValue } from "../types/schemas";
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
  export let value: GraphValue = {
    nodes: [],
    edges: [],
    loaded: false,
    zoomToNodeId: null,
  };
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
  function handleConnectWrapper(connection: Connection, stores: GraphStores) {
    handleConnect(connection, stores);
    // value.nodes = get(customNodes);
    value.edges = get(customEdges);
    gradio.dispatch("change", value);
  }

  function handleDeleteWrapper(stores: GraphStores) {
    handleDelete(stores);
    value.nodes = get(stores.customNodes);
    value.edges = get(stores.customEdges);
    gradio.dispatch("change", value);
  }

  function handleNodeClickWrapper(
    customEvent: CustomEvent<{
      node: Node<Record<string, unknown>, string>;
      event: MouseEvent | TouchEvent;
    }>,
    stores: GraphStores
  ) {
    const result = handleNodeClick(customEvent, stores);
    if (result && result.action === "edit") {
      value.nodes = get(stores.customNodes);
      value.edges = get(stores.customEdges);
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
  on:nodedragstart={(e) => handleNodeDragStart(e, stores)}
  on:nodedragstop={(e) => handleNodeDragStop(e, stores)}
  on:nodeclick={(e) => {
    activeStoreId.set(get(instanceId));
    handleNodeClickWrapper(e, stores);
  }}
  on:edgeclick={(e) => {
    activeStoreId.set(get(instanceId));
    handleEdgeClick(e, stores);
  }}
  on:paneclick={() => {
    activeStoreId.set(get(instanceId));
    handlePaneClick(stores);
  }}
  onconnect={(e) => handleConnectWrapper(e, stores)}
  ondelete={() => handleDeleteWrapper(stores)}
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
