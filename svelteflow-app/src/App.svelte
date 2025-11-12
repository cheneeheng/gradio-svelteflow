<script lang="ts">
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
  import type { Attribute, CustomEdge, CustomNode } from "./types/schemas";
  import { getLayoutedElements, type LayoutDirection } from "./utils/layout";
  import { debounce } from "./utils/debounce";
  import { uuidv4 } from "./utils/uuid";

  const nodeTypes = { custom: CustomNodeComponent };
  const edgeTypes = { custom: CustomEdgeComponent };

  export let interactive: boolean = true;

  let flowInstance: SvelteFlow;
  let viewport: Viewport = { x: 0, y: 0, zoom: 1 };

  let nodes: Writable<Node[]> = writable<Node[]>([]);
  let edges: Writable<Edge[]> = writable<Edge[]>([]);
  const editingNode = writable<CustomNode | null>(null);
  const editingEdge = writable<CustomEdge | null>(null);
  let searchQuery = "";
  let layoutDirection: LayoutDirection = "TB";

  let clickTimer: number | null = null;

  $: if (typeof document !== 'undefined') {
    if ($theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
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
        attributes: [],
        handles: [],
      },
      type: "custom",
    };
    nodes.update((n) => [...n, newNode]);
  }

  function handleNodeClick(
    e: CustomEvent<{
      node: Node;
      event: MouseEvent | TouchEvent;
    }>
  ) {
    if (clickTimer) {
      clearTimeout(clickTimer);
      clickTimer = null;
      handleNodeDoubleClick(e);
    } else {
      clickTimer = setTimeout(() => {
        const clickedNode = e.detail.node as CustomNode;
        if (interactive && e.detail.event instanceof MouseEvent) {
          searchedNodes.set([]); // Clear search highlights on click

          const connectedEdges = get(edges).filter(
            (edge) =>
              edge.source === clickedNode.id || edge.target === clickedNode.id
          );
          const neighborIds = connectedEdges.flatMap((edge) => [
            edge.source,
            edge.target,
          ]).filter(id => id !== clickedNode.id);

          clickedNodes.set([...new Set(neighborIds)]); // Use Set to ensure unique IDs
          clickedEdges.set(connectedEdges.map((edge) => edge.id));
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
      .filter((attr: Attribute) => attr.connectable)
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
  }

  function handleCancelEdgeEdit() {
    editingEdge.set(null);
    clickedNodes.set([]);
    clickedEdges.set([]);
    searchedNodes.set([]);
  }

  function handleSaveGraph() {
    const graph = {
      nodes: get(nodes),
      edges: get(edges),
      viewport: viewport,
    };
    const data = JSON.stringify(graph, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "graph.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleLoadGraph(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const graph = JSON.parse(reader.result as string);
        if (graph.nodes && graph.edges) {
          nodes.set(graph.nodes);
          edges.set(graph.edges);
        } else {
          alert("Invalid graph file format.");
        }
      } catch (e) {
        alert("Error loading graph.");
        console.error(e);
      }
    };
    reader.readAsText(file);
  }

  function triggerLoad() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = handleLoadGraph;
    input.click();
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
</script>

<div class="app-container">
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

  <div
    style="display: flex; justify-content: center; margin-bottom: 10px; gap: 10px;"
  >
    <input
      type="text"
      bind:value={searchQuery}
      on:input={debouncedSearch}
      placeholder="Search nodes..."
    />
    <button on:click={handleAddNode}>Add Node</button>
    <button on:click={handleSaveGraph}>Save to File</button>
    <button on:click={triggerLoad}>Load from File</button>
    <button on:click={handleLayout}>Relayout</button>
    <select bind:value={layoutDirection}>
      <option value="TB">Vertical</option>
      <option value="LR">Horizontal</option>
    </select>
    <button on:click={toggleTheme}>
      Toggle Theme ({$theme === "light" ? "Dark" : "Light"})
    </button>
  </div>

  <SvelteFlow
    bind:this={flowInstance}
    bind:nodes
    bind:edges
    {nodeTypes}
    {edgeTypes}
    colorMode={$theme}
    defaultEdgeOptions={{
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
      },
    }}
    nodesConnectable={interactive}
    nodesDraggable={interactive}
    elementsSelectable={interactive}
    on:nodeclick={handleNodeClick}
    on:edgeclick={handleEdgeClick}
    on:paneclick={handlePaneClick}
    onconnect={handleConnect}
    ondelete={handleDelete}
    onbeforedelete={handleBeforeDelete}
    deleteKey={["Delete", "Backspace"]}
    style="height: 95vh; background: var(--background);"
  >
    <Controls />
    <Background />
  </SvelteFlow>
</div>

<style>
  .app-container {
    width: 100%;
    height: 100vh;
    background-color: var(--background);
    color: var(--text-color);
  }
  /* No global highlight style needed here anymore, styles are in components */
</style>
