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
  import { ZOOM_ANIMATION_DURATION, ZOOM_COMPLETE_BUFFER } from "../constants";
  import { activeStoreId } from "../stores/activeStore";
  import { storeKey } from "../stores/context";
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
  const {
    customEdges,
    customNodes,
    flowInstance,
    interactive,
    instanceId,
    zoomToNodeName,
  } = stores;

  const nodeTypes = { custom: CustomNodeComponent };
  const edgeTypes = { custom: CustomEdgeComponent };

  let flowInstanceLocal: SvelteFlow;
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
      flowInstance.set(flowInstanceLocal);
    }
  });

  // Get fitView from useSvelteFlow hook
  const { fitView } = useSvelteFlow();

  // Watch for zoom requests from parent via store
  $: if ($zoomToNodeName) {
    const targetName = $zoomToNodeName;

    if (targetName && $flowInstance) {
      const nodes = $customNodes;
      const targetNode = nodes.find((n) => n.data.name === targetName);

      if (targetNode) {
        // Clear the store value immediately to prevent re-triggering
        stores.zoomToNodeName.set(null);

        // Select the target node
        stores.customNodes.update((ns) =>
          ns.map((n) => ({
            ...n,
            selected: n.id === targetNode.id,
          }))
        );

        // Zoom to the node
        fitView({
          nodes: [{ id: targetNode.id }],
          duration: ZOOM_ANIMATION_DURATION,
        });

        // Notify parent that zoom is complete AFTER animation
        setTimeout(() => {
          dispatch("zoomComplete");
        }, ZOOM_ANIMATION_DURATION + ZOOM_COMPLETE_BUFFER);
      } else {
        // Node not found, clear the request
        stores.zoomToNodeName.set(null);
        // also dispatch zoom complete to reset the UI
        dispatch("zoomComplete");
      }
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
