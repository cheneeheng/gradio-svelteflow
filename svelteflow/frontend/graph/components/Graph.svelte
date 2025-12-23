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
    type Viewport,
  } from "@xyflow/svelte";
  import "@xyflow/svelte/dist/style.css";
  import type { Connection } from "@xyflow/system";
  import { createEventDispatcher, getContext, onMount } from "svelte";
  import { get, writable } from "svelte/store";
  import { ZOOM_ANIMATION_DURATION, ZOOM_COMPLETE_BUFFER } from "../constants";
  import { activeStoreId } from "../stores/activeStore";
  import { storeKey } from "../stores/context";
  import type { GraphStores } from "../stores/instanceStore";
  import { theme } from "../stores/themeStore";
  import "../styles/theme.css";
  import type {
    CustomEdge,
    CustomNode,
    GraphEventMeta,
  } from "../types/schemas";
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
  import { SpatialIndex } from "../utils/virtualization";
  import CustomEdgeComponent from "./CustomEdge.svelte";
  import CustomNodeComponent from "./CustomNode.svelte";

  // ----------
  // Exports
  // ----------
  export let minZoom: number | undefined = undefined;
  export let maxZoom: number | undefined = undefined;
  export let enable_virtualization: boolean = false;
  export let enable_grid_snap: boolean = false;
  export let grid_size: number = 20;
  export let toolbar_visibility: Record<string, boolean> = {};

  $: showZoom =
    toolbar_visibility.zoomIn !== false || toolbar_visibility.zoomOut !== false;
  $: showFitView = toolbar_visibility.fitView !== false;

  // ----------
  // Events
  // ----------
  const dispatch = createEventDispatcher<{
    zoomComplete: null;
    change: Partial<GraphEventMeta> | undefined;
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

  const spatialIndex = new SpatialIndex();
  let containerWidth = 0;
  let containerHeight = 0;
  let currentViewport: Viewport = { x: 0, y: 0, zoom: 1 };
  let isUpdatingVisibility = false;

  // Local stores for virtualization
  const visibleNodes = writable<CustomNode[]>([]);
  const visibleEdges = writable<CustomEdge[]>([]);

  // Sync visibleNodes back to customNodes when changes come from interaction
  visibleNodes.subscribe((val) => {
    if (isUpdatingVisibility || !enable_virtualization) return;

    const valMap = new Map(val.map((n) => [n.id, n]));
    customNodes.update((allNodes) => {
      return allNodes.map((node) => {
        const updated = valMap.get(node.id);
        return updated ? updated : node;
      });
    });
  });

  let flowInstanceLocal: SvelteFlow;

  // Reactive switching of stores
  $: nodesLocal = enable_virtualization ? visibleNodes : customNodes;
  $: edgesLocal = enable_virtualization ? visibleEdges : customEdges;

  // ----------
  // Local functions
  // ----------
  function emitChange(meta?: Partial<GraphEventMeta>) {
    dispatch("change", meta);
  }

  function updateVisibility() {
    if (!enable_virtualization) return;

    isUpdatingVisibility = true;
    const visibleIds = spatialIndex.query(currentViewport, {
      width: containerWidth,
      height: containerHeight,
    });

    visibleNodes.set(get(customNodes).filter((n) => visibleIds.has(n.id)));
    visibleEdges.set(
      get(customEdges).filter(
        (e) => visibleIds.has(e.source) || visibleIds.has(e.target)
      )
    );
    isUpdatingVisibility = false;
  }

  function handleMove(e: CustomEvent<{ viewport: Viewport }>) {
    const vp = e.detail.viewport;
    currentViewport = vp;
    stores.viewport.set(vp);
    updateVisibility();
  }

  function handleMoveEnd(e: CustomEvent<{ viewport: Viewport }>) {
    emitChange({
      eventType: "viewportChange",
      handleId: "graph:viewport",
      sourceType: "viewport",
      timestamp: new Date().toISOString(),
    });
  }

  // Reactively update index and visibility when nodes change
  $: if (enable_virtualization && $customNodes) {
    spatialIndex.update($customNodes);
    updateVisibility();
  }

  function handleConnectWrapper(connection: Connection, stores: GraphStores) {
    handleConnect(connection, stores);
    emitChange({
      eventType: "change",
      handleId: "graph:connect",
      sourceType: "node",
    });
  }

  function handleDeleteWrapper(stores: GraphStores) {
    handleDelete(stores);
    emitChange({
      eventType: "delete",
      handleId: "graph:delete",
      sourceType: "graph",
    });
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
      emitChange({
        eventType: "change",
        handleId: `graph:node:${result.action}`,
        sourceType: "node",
        sourceId: customEvent.detail.node.id,
      });
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

        try {
          // Zoom to the node
          fitView({
            nodes: [{ id: targetNode.id }],
            duration: ZOOM_ANIMATION_DURATION,
          });

          // Notify parent that zoom is complete AFTER animation
          setTimeout(() => {
            dispatch("zoomComplete");
          }, ZOOM_ANIMATION_DURATION + ZOOM_COMPLETE_BUFFER);
        } catch (error) {
          console.error("Zoom failed:", error);
          dispatch("zoomComplete"); // Still complete to reset UI
        }
      } else {
        // Node not found, clear the request
        stores.zoomToNodeName.set(null);
        // also dispatch zoom complete to reset the UI
        dispatch("zoomComplete");
      }
    }
  }
</script>

<div
  style="width: 100%; height: 100%; display: flex;"
  bind:clientWidth={containerWidth}
  bind:clientHeight={containerHeight}
>
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
    snapGrid={enable_grid_snap ? [grid_size, grid_size] : undefined}
    on:move={handleMove}
    on:moveend={handleMoveEnd}
    on:nodedragstart={(e) => handleNodeDragStart(e, stores)}
    on:nodedragstop={(e) => {
      handleNodeDragStop(e, stores);
      emitChange({
        eventType: "nodeMove",
        handleId: "graph:drag",
        sourceType: "node",
        timestamp: new Date().toISOString(),
      });
    }}
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
      const meta = handlePaneClick(stores);
      if (meta) {
        emitChange(meta);
      }
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
    <Controls {showZoom} {showFitView} />
    <Background />
  </SvelteFlow>
</div>
