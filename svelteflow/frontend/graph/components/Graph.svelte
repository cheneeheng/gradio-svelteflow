<script lang="ts">
  // ----------
  // Imports
  // ----------
  import {
    Background,
    Controls,
    MiniMap,
    SvelteFlow,
    useSvelteFlow,
    type Node,
  } from "@xyflow/svelte";
  import "@xyflow/svelte/dist/style.css";
  import type { Connection } from "@xyflow/system";
  import { getContext, onMount, tick } from "svelte";
  import { get, type Writable } from "svelte/store";
  import { activeStoreId } from "../stores/activeStore";
  import { storeKey } from "../stores/context";
  import type { GraphStores } from "../stores/instanceStore";
  import { theme } from "../stores/themeStore";
  import "../styles/theme.css";
  import type { GradioLike, GraphEvents } from "../types/gradio";
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
  export let gradio: GradioLike<GraphEvents> | undefined = undefined;
  export let value: GraphValue = {
    nodes: [],
    edges: [],
    loaded: false,
    zoomToNodeName: null,
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
    if (gradio) {
      gradio.dispatch("change", value);
    }
  }

  function handleDeleteWrapper(stores: GraphStores) {
    handleDelete(stores);
    value.nodes = get(stores.customNodes);
    value.edges = get(stores.customEdges);
    if (gradio) {
      gradio.dispatch("change", value);
    }
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
      if (gradio) {
        gradio.dispatch("change", value);
      }
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

  const { fitView } = useSvelteFlow();

  $: if (value.zoomToNodeName && get(flowInstance)) {
    const newNodes = get(stores.customNodes).map((n) => ({
      ...n,
      selected: n.data.name === value.zoomToNodeName,
    }));
    stores.customNodes.set(newNodes);

    const node = newNodes.find((n) => n.data.name === value.zoomToNodeName);
    if (node) {
      fitView({
        nodes: [{ id: node.id }],
        duration: 800,
      });
      // Reset zoomToNodeName after this reactive cycle
      tick().then(() => {
        value.zoomToNodeName = null;
      });
    }
  }
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
