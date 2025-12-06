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
  import { createEventDispatcher, getContext, onMount } from "svelte";
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
  // Events
  // ----------
  const dispatch = createEventDispatcher<{
    zoomComplete: null;
    change: null;
  }>();

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
  function emitChange() {
    dispatch("change");
  }

  function handleConnectWrapper(connection: Connection, stores: GraphStores) {
    handleConnect(connection, stores);
    emitChange();
  }

  function handleDeleteWrapper(stores: GraphStores) {
    handleDelete(stores);
    emitChange();
  }

  function handleNodeClickWrapper(
    customEvent: CustomEvent<{
      node: Node<Record<string, unknown>, string>;
      event: MouseEvent | TouchEvent;
    }>,
    stores: GraphStores
  ) {
    const result = handleNodeClick(customEvent, stores);
    if (
      result &&
      (result.action === "edit" ||
        result.action === "collapse" ||
        result.action === "expand")
    ) {
      emitChange();
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
    const nodes = get(stores.customNodes);
    const targetNode = nodes.find((n) => n.data.name === value.zoomToNodeName);

    if (targetNode) {
      stores.customNodes.set(
        nodes.map((n) => ({
          ...n,
          selected: n.id === targetNode.id,
        }))
      );

      fitView({
        nodes: [{ id: targetNode.id }],
        duration: 800,
      });

      // Notify parent that zoom is complete (they should clear zoomToNodeName)
      setTimeout(() => {
        dispatch("zoomComplete");
      }, 850); // After animation completes
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
