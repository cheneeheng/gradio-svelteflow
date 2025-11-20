<script lang="ts">
  import type { Gradio } from "@gradio/utils";
  import type { LoadingStatus } from "@gradio/statustracker";
  import {
    Background,
    Controls,
    SvelteFlow,
    MarkerType,
    type Edge,
    type Node,
  } from "@xyflow/svelte";
  import "@xyflow/svelte/dist/style.css";
  import "./styles/theme.css";
  import type { Connection, Viewport } from "@xyflow/system";
  import { get, writable, type Writable } from "svelte/store";
  import {
    Plus,
    LayoutDashboard,
    Sun,
    Moon,
    Search,
    Settings,
    Ellipsis,
  } from "lucide-svelte";
  import { createEventDispatcher } from "svelte";

  import CustomEdgeComponent from "./components/CustomEdge.svelte";
  import CustomNodeComponent from "./components/CustomNode.svelte";
  import EdgeEditPopup from "./components/EdgeEditPopup.svelte";
  import NodeEditPopup from "./components/NodeEditPopup.svelte";
  import {
    clickedEdges,
    clickedNodes,
    searchedNodes,
  } from "./stores/highlightStore";
  import { theme } from "./stores/themeStore";
  import type {
    Attribute,
    CollapsibleEdgeData,
    CustomEdge,
    CustomNode,
  } from "./types/schemas";
  import { getLayoutedElements, type LayoutDirection } from "./utils/layout";
  import { debounce } from "./utils/debounce";
  import { uuidv4 } from "./utils/uuid";

  const nodeTypes = { custom: CustomNodeComponent };
  const edgeTypes = { custom: CustomEdgeComponent };

  export let gradio: Gradio<{
    change: { nodes: CustomNode[]; edges: CustomEdge[] };
    select: { nodes: CustomNode[]; edges: CustomEdge[] };
    submit: { nodes: CustomNode[]; edges: CustomEdge[] };
    clear_status: LoadingStatus;
  }>;
  export let interactive: boolean = true;
  export let value: { nodes: CustomNode[]; edges: CustomEdge[] } = {
    nodes: [],
    edges: [],
  };
  export let canvas_min_height: string = "500px";

  const dispatch = createEventDispatcher();

  let flowInstance: SvelteFlow;
  let viewport: Viewport = { x: 0, y: 0, zoom: 1 };

  let nodes: Writable<Node[]> = writable<Node[]>(value.nodes);
  let edges: Writable<Edge[]> = writable<Edge[]>(value.edges);
  const editingNode = writable<CustomNode | null>(null);
  const editingEdge = writable<CustomEdge | null>(null);
  let searchQuery = "";
  let layoutDirection: LayoutDirection = "LR";

  let clickTimer: number | null = null;
  let isDragging = false;

  $: if (value) {
    nodes.set(value.nodes);
    edges.set(value.edges);
  }

  $: if (typeof document !== "undefined") {
    if ($theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  function toggleTheme() {
    theme.update((t) => (t === "light" ? "dark" : "light"));
  }

  function handleLayout() {
    const currentNodes = get(nodes);
    const currentEdges = get(edges);
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      currentNodes,
      currentEdges,
      layoutDirection
    );
    nodes.set([...layoutedNodes]);
    edges.set([...layoutedEdges]);
    value.nodes = get(nodes) as CustomNode[];
    value.edges = get(edges) as CustomEdge[];
    gradio.dispatch("change", value);
  }

  // PROP HANDLERS -----------------------------------------------------------

  function handleConnect(connection: Connection) {
    const { source, target, sourceHandle, targetHandle } = connection;
    if (!source || !target) return;

    // Get current edges and strip out any default edge first
    let currentEdges = get(edges).filter(
      (e) =>
        !(e.source === source && e.target === target && !e.label && !e.type)
    );

    const parallelEdges = currentEdges.filter(
      (edge) => edge.source === source && edge.target === target
    );
    const key = parallelEdges.length + 1;
    const id = `${source}_${target}_${key}`;

    const newEdge: CustomEdge = {
      id,
      source,
      target,
      sourceHandle,
      targetHandle,
      label: `Edge ${key}`,
      type: "custom",
    };

    edges.update((es) => {
      if (
        es.some(
          (e) =>
            e.source === source && e.target === target && !e.label && !e.type
        )
      ) {
        // remove the default edge before adding your own
        es = es.filter(
          (e) =>
            !(e.source === source && e.target === target && !e.label && !e.type)
        );
      }
      return [...es, newEdge];
    });
    value.edges = get(edges) as CustomEdge[];
    gradio.dispatch("change", value);
  }

  async function handleBeforeDelete({
    nodes: nodesToDelete,
    edges: toDeleteEdges,
  }: {
    nodes: Node[];
    edges: Edge[];
  }): Promise<boolean> {
    const nodeNames = nodesToDelete
      .map((n) => (n.data as CustomNode["data"]).name)
      .join(", ");
    const edgeIds = toDeleteEdges.map((e) => e.id).join(", ");
    let message = "Are you sure you want to delete ";
    if (nodesToDelete.length > 0) message += `node(s) ${nodeNames}`;
    if (toDeleteEdges.length > 0) message += `edge(s) ${edgeIds}`;

    return confirm(message);
  }

  function handleDelete({
    nodes: deletedNodes,
    edges: deletedEdges,
  }: {
    nodes: Node[];
    edges: Edge[];
  }) {
    clickedNodes.set([]);
    clickedEdges.set([]);
    searchedNodes.set([]);
    value.nodes = get(nodes) as CustomNode[];
    value.edges = get(edges) as CustomEdge[];
    gradio.dispatch("change", value);
  }

  function handlePaneClick() {
    clickedNodes.set([]);
    clickedEdges.set([]);
  }

  // EVENT HANDLERS -----------------------------------------------------------

  function handleAddNode() {
    const container = (flowInstance?.$el as HTMLElement) ?? null;
    const cx = container ? container.clientWidth / 2 : 250;
    const cy = container ? container.clientHeight / 2 : 150;
    const x = (cx - viewport.x) / viewport.zoom;
    const y = (cy - viewport.y) / viewport.zoom;
    const id = uuidv4();
    const newNode: CustomNode = {
      id,
      position: { x: x, y: y },
      data: {
        name: `Node-${id.substring(0, 4)}`,
        description: "This is a new node.",
        attributes: [],
        handles: [],
        collapsed: false,
      },
      type: "custom",
    };
    nodes.update((n) => [...n, newNode]);
    value.nodes = get(nodes) as CustomNode[];
    gradio.dispatch("change", value);
  }

  function handleNodeCollapse(nodeId: string, isCollapsed: boolean) {
    edges.update((es) => {
      return es.map((edge) => {
        const data = edge.data as CollapsibleEdgeData;
        if (edge.source === nodeId) {
          if (isCollapsed) {
            edge.data = {
              ...data,
              originalSourceHandle: edge.sourceHandle,
            };
            edge.sourceHandle = "output-collapsed";
          } else if (data.originalSourceHandle) {
            edge.sourceHandle = data.originalSourceHandle;
            delete data.originalSourceHandle;
          }
        }
        if (edge.target === nodeId) {
          if (isCollapsed) {
            edge.data = {
              ...data,
              originalTargetHandle: edge.targetHandle,
            };
            edge.targetHandle = "input-collapsed";
          } else if (data.originalTargetHandle) {
            edge.targetHandle = data.originalTargetHandle;
            delete data.originalTargetHandle;
          }
        }
        return edge;
      });
    });
    value.edges = get(edges) as CustomEdge[];
    gradio.dispatch("change", value);
  }

  function handleNodeDragStart() {
    isDragging = true;
  }

  function highlightNeighbors(node: CustomNode) {
    if (!interactive) return;

    searchedNodes.set([]); // Clear search highlights on click

    const connectedEdges = get(edges).filter(
      (edge) => edge.source === node.id || edge.target === node.id
    );
    const neighborIds = connectedEdges
      .flatMap((edge) => [edge.source, edge.target])
      .filter((id) => id !== node.id);

    clickedNodes.set([...new Set(neighborIds)]);
    clickedEdges.set(connectedEdges.map((edge) => edge.id));
  }

  function handleNodeDragStop(
    e: CustomEvent<{
      targetNode: Node<Record<string, unknown>, string> | null;
      nodes: Node<Record<string, unknown>, string>[];
      event: MouseEvent | TouchEvent;
    }>
  ) {
    const { targetNode } = e.detail;
    if (targetNode) {
      const clickedNode = targetNode as CustomNode;
      highlightNeighbors(clickedNode);
    }
    setTimeout(() => (isDragging = false), 10);
  }

  function handleNodeClick(
    e: CustomEvent<{
      node: Node;
      event: MouseEvent | TouchEvent;
    }>
  ) {
    if (isDragging) {
      return;
    }
    const target = e.detail.event.target as HTMLElement;
    if (target.closest(".collapse-toggle-btn")) {
      const node = e.detail.node as CustomNode;
      nodes.update((nds) =>
        nds.map((n) => {
          if (n.id === node.id) {
            return {
              ...n,
              data: {
                ...n.data,
                collapsed: !n.data.collapsed,
              },
            };
          }
          return n;
        })
      );
      handleNodeCollapse(node.id, !node.data.collapsed);
      value.nodes = get(nodes) as CustomNode[];
      return;
    }

    if (clickTimer) {
      clearTimeout(clickTimer);
      clickTimer = null;
      handleNodeDoubleClick(e);
    } else {
      clickTimer = setTimeout(() => {
        const clickedNode = e.detail.node as CustomNode;
        if (interactive && e.detail.event instanceof MouseEvent) {
          highlightNeighbors(clickedNode);
        }
        clickTimer = null;
      }, 250);
    }
  }

  function handleNodeDoubleClick(
    e: CustomEvent<{
      node: Node;
      event: MouseEvent | TouchEvent;
    }>
  ) {
    const clickedNode = e.detail.node as CustomNode;
    if (interactive && e.detail.event instanceof MouseEvent) {
      editingNode.set(clickedNode);
    }
  }

  function handleEdgeClick(
    e: CustomEvent<{ edge: Edge; event: MouseEvent | TouchEvent }>
  ) {
    if (clickTimer) {
      clearTimeout(clickTimer);
      clickTimer = null;
      handleEdgeDoubleClick(e);
    } else {
      clickTimer = setTimeout(() => {
        // empty for now, but we might want to add single-click logic for edges later
        clickTimer = null;
      }, 250);
    }
  }

  function handleEdgeDoubleClick(
    e: CustomEvent<{ edge: Edge; event: MouseEvent | TouchEvent }>
  ) {
    const clickedEdge = e.detail.edge as CustomEdge;
    if (interactive && e.detail.event instanceof MouseEvent) {
      editingEdge.set(clickedEdge);
    }
  }

  function handleSaveNode(event: CustomEvent<CustomNode>) {
    const updatedNode = event.detail;

    // 1. Validate unique node name
    const currentNodes = get(nodes);
    const isNameDuplicate = currentNodes.some(
      (n) =>
        n.id !== updatedNode.id &&
        (n.data as CustomNode["data"]).name === updatedNode.data.name
    );
    if (isNameDuplicate) {
      alert(
        `Node name "${updatedNode.data.name}" already exists. Please choose a unique name.`
      );
      return;
    }

    // 2. Validate unique attribute keys per node
    const attributeKeys = updatedNode.data.attributes.map((attr) => attr.key);
    const hasDuplicateAttributeKeys =
      new Set(attributeKeys).size !== attributeKeys.length;
    if (hasDuplicateAttributeKeys) {
      alert(
        "Duplicate attribute keys found. Please ensure all attribute keys are unique within the node."
      );
      return;
    }

    updatedNode.data.handles = updatedNode.data.attributes
      .filter((attr: Attribute) => attr.connectable && attr.visible)
      .map((attr: Attribute) => ({ id: attr.key, type: attr.type }));

    nodes.update((currentNodes) => {
      return currentNodes.map((n) =>
        n.id === updatedNode.id ? updatedNode : n
      );
    });

    const handleIds = new Set(updatedNode.data.handles.map((h) => h.id));
    edges.update((currentEdges) => {
      return currentEdges.filter((edge) => {
        if (
          edge.source === updatedNode.id &&
          edge.sourceHandle &&
          !handleIds.has(edge.sourceHandle)
        ) {
          return false;
        }
        if (
          edge.target === updatedNode.id &&
          edge.targetHandle &&
          !handleIds.has(edge.targetHandle)
        ) {
          return false;
        }
        return true;
      });
    });

    editingNode.set(null);
    clickedNodes.set([]);
    clickedEdges.set([]);
    searchedNodes.set([]);
    value.nodes = get(nodes) as CustomNode[];
    value.edges = get(edges) as CustomEdge[];
    gradio.dispatch("change", value);
  }

  function handleCancelEdit() {
    editingNode.set(null);
    clickedNodes.set([]);
    clickedEdges.set([]);
    searchedNodes.set([]);
  }

  function handleSaveEdge(event: CustomEvent<CustomEdge>) {
    const updatedEdge = event.detail;
    edges.update((currentEdges) => {
      return currentEdges.map((e) =>
        e.id === updatedEdge.id ? updatedEdge : e
      );
    });
    editingEdge.set(null);
    clickedNodes.set([]);
    clickedEdges.set([]);
    searchedNodes.set([]);
    value.edges = get(edges) as CustomEdge[];
    gradio.dispatch("change", value);
  }

  function handleCancelEdgeEdit() {
    editingEdge.set(null);
    clickedNodes.set([]);
    clickedEdges.set([]);
    searchedNodes.set([]);
  }

  function handleSearchInternal() {
    clickedNodes.set([]); // Clear click highlights on search
    clickedEdges.set([]);
    if (searchQuery.length === 0) {
      searchedNodes.set([]);
      return;
    }
    const matchingNodes = get(nodes).filter((node) =>
      (node.data as CustomNode["data"]).name
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
    searchedNodes.set(matchingNodes.map((node) => node.id));
  }

  const debouncedSearch = debounce(handleSearchInternal, 300);

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      nodes.update((ns) => ns.map((n) => ({ ...n, selected: false })));
      edges.update((es) => es.map((e) => ({ ...e, selected: false })));
      clickedNodes.set([]);
      clickedEdges.set([]);
      searchedNodes.set([]);
      searchQuery = "";
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="app-container" style="min-height: {canvas_min_height};">
  {#if $editingNode}
    <NodeEditPopup
      node={$editingNode}
      on:save={handleSaveNode}
      on:cancel={handleCancelEdit}
    />
  {/if}

  {#if $editingEdge}
    <EdgeEditPopup
      edge={$editingEdge}
      on:save={handleSaveEdge}
      on:cancel={handleCancelEdgeEdit}
    />
  {/if}

  <div class="toolbar">
    <div class="search-bar">
      <Search size={18} />
      <input
        type="text"
        bind:value={searchQuery}
        on:input={debouncedSearch}
        placeholder="Search nodes..."
      />
    </div>
    <button class="toolbar-button" title="Add a new node"
      ><Plus size={18} /></button
    >
    <!-- <button
      class="toolbar-button"
      on:click={handleAddNode}
      title="Add a new node"><Plus size={18} /></button
    > -->
    <button
      class="toolbar-button"
      on:click={handleLayout}
      title="Relayout nodes"><LayoutDashboard size={18} /></button
    >
    <select bind:value={layoutDirection} title="Layout direction">
      <option value="LR">Horizontal</option>
      <option value="TB">Vertical</option>
    </select>
    <button class="toolbar-button" title="Settings"
      ><Settings size={18} /></button
    >
    <button class="toolbar-button" title="More options"
      ><Ellipsis size={18} /></button
    >
    <button class="toolbar-button" on:click={toggleTheme} title="Toggle theme">
      {#if $theme === "light"}
        <Moon size={18} />
      {:else}
        <Sun size={18} />
      {/if}
    </button>
  </div>

  <SvelteFlow
    bind:this={flowInstance}
    bind:nodes
    bind:edges
    {nodeTypes}
    {edgeTypes}
    colorMode={$theme}
    nodesConnectable={interactive}
    nodesDraggable={interactive}
    elementsSelectable={interactive}
    on:nodedragstart={handleNodeDragStart}
    on:nodedragstop={handleNodeDragStop}
    on:nodeclick={handleNodeClick}
    on:edgeclick={handleEdgeClick}
    on:paneclick={handlePaneClick}
    onconnect={handleConnect}
    ondelete={handleDelete}
    onbeforedelete={handleBeforeDelete}
    deleteKey={["Delete", "Backspace"]}
    style="width: 100%; height: 100%; background: var(--background);"
  >
    <Controls />
    <Background />
  </SvelteFlow>
</div>

<style>
  /* :global(html, body) {
    background-color: var(--background);
    color: var(--text-color);
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
    overflow: auto;
  } */

  .app-container {
    width: 100%;
    height: 100%;
    background-color: var(--background);
    color: var(--text-color);
    position: relative;
  }

  :global(.fullscreen.animating .app-container) {
    height: 90vh;
    overflow: hidden;
  }

  .toolbar {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--controls-background);
    border: 1px solid var(--controls-border);
    border-radius: 8px;
    padding: 8px;
    display: flex;
    gap: 8px;
    align-items: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    z-index: 10;
  }

  .search-bar {
    display: flex;
    align-items: center;
    background: var(--input-background);
    border: 1px solid var(--input-border);
    border-radius: 6px;
    padding: 0 8px;
  }

  .search-bar input {
    border: none;
    background: transparent;
    padding: 8px;
    color: var(--text-color);
  }

  .search-bar input:focus {
    outline: none;
  }

  .toolbar-button {
    background: transparent;
    border: none;
    color: var(--text-color);
    cursor: pointer;
    padding: 8px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .toolbar-button:hover {
    background: var(--button-hover-background);
  }

  select {
    background: var(--input-background);
    color: var(--text-color);
    border: 1px solid var(--input-border);
    border-radius: 6px;
    padding: 8px;
  }
</style>
