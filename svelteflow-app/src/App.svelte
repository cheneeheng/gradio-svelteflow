<script lang="ts">
  import { get, writable, derived, type Writable } from "svelte/store";
  import { SvelteFlow, Controls, MarkerType } from "@xyflow/svelte";
  import type { Node, Edge } from "@xyflow/svelte";
  import type { Viewport, Connection } from "@xyflow/system";
  import "@xyflow/svelte/dist/style.css";

  import type { CustomNode, CustomEdge, Attribute } from "./types/schemas";
  import CustomEdgeComponent from "./components/CustomEdge.svelte";
  import CustomNodeComponent from "./components/CustomNode.svelte";
  import NodeEditPopup from "./components/NodeEditPopup.svelte";
  import EdgeEditPopup from "./components/EdgeEditPopup.svelte";
  import { uuidv4 } from "./utils/uuid";
  import { clickedNodes, clickedEdges, searchedNodes } from "./stores/highlightStore";

  const nodeTypes = { custom: CustomNodeComponent };
  const edgeTypes = { custom: CustomEdgeComponent };

  export let interactive: boolean = true;

  let flowInstance: SvelteFlow;
  let viewport: Viewport = { x: 0, y: 0, zoom: 1 };

  const nodes = writable<CustomNode[]>([]);
  const edges = writable<CustomEdge[]>([]);
  const editingNode = writable<CustomNode | null>(null);
  const editingEdge = writable<CustomEdge | null>(null);
  let searchQuery = '';
  const graphVersion = writable<number>(0);

  // Derived stores for displaying nodes and edges with highlight info
  const displayNodes = derived([nodes, clickedNodes, searchedNodes], ([$nodes, $clickedNodes, $searchedNodes]) => {
    return $nodes.map(node => {
      let highlightType: 'click' | 'search' | null = null;
      if ($clickedNodes.includes(node.id)) {
        highlightType = 'click';
      } else if ($searchedNodes.includes(node.id)) {
        highlightType = 'search';
      }
      return { ...node, highlightType };
    });
  });

  const displayEdges = derived([edges, clickedEdges], ([$edges, $clickedEdges]) => {
    return $edges.map(edge => {
      let highlightType: 'click' | null = null;
      if ($clickedEdges.includes(edge.id)) {
        highlightType = 'click';
      }
      return { ...edge, highlightType };
    });
  });

  // PROP HANDLERS -----------------------------------------------------------

  function handleConnect(connection: Connection) {
    const { source, target, sourceHandle, targetHandle } = connection;
    if (!source || !target) return;

    const currentEdges = get(edges);
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
    };

    edges.update((es) => [...es, newEdge]);
  }

  async function handleBeforeDelete({
    nodes,
    edges: toDeleteEdges,
  }: {
    nodes: CustomNode[];
    edges: CustomEdge[];
  }): Promise<boolean> {
    const nodeNames = nodes.map(n => n.data.name).join(', ');
    const edgeIds = toDeleteEdges.map(e => e.id).join(', ');
    let message = 'Are you sure you want to delete ';
    if (nodes.length > 0) message += `node(s) ${nodeNames}`;
    if (edges.length > 0) message += `edge(s) ${edgeIds}`;
    
    return confirm(message);
  }

  function handleDelete({
    nodes: deletedNodes,
    edges: deletedEdges,
  }: {
    nodes: CustomNode[];
    edges: CustomEdge[];
  }) {
    clickedNodes.set([]);
    clickedEdges.set([]);
    searchedNodes.set([]);
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
      type: 'custom',
    };
    nodes.update((n) => [...n, newNode]);
    editingNode.set(newNode);
  }

  function handleNodeClick(
    e: CustomEvent<{
      node: Node;
      event: MouseEvent | TouchEvent;
    }>
  ) {
    const clickedNode = e.detail.node as CustomNode;
    if (interactive && e.detail.event instanceof MouseEvent) {
      searchedNodes.set([]); // Clear search highlights on click
      if (get(clickedNodes).includes(clickedNode.id)) {
        // If already clicked, open edit popup
        editingNode.set(clickedNode);
      } else {
        const connectedEdges = get(edges).filter(
          (edge) => edge.source === clickedNode.id || edge.target === clickedNode.id
        );
        const neighborIds = connectedEdges.flatMap((edge) => [edge.source, edge.target]);
        
        clickedNodes.set([clickedNode.id, ...neighborIds]);
        clickedEdges.set(connectedEdges.map(edge => edge.id));
      }
    }
  }

  function handleEdgeClick(
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
      (n) => n.id !== updatedNode.id && n.data.name === updatedNode.data.name
    );
    if (isNameDuplicate) {
      alert(`Node name "${updatedNode.data.name}" already exists. Please choose a unique name.`);
      return;
    }

    // 2. Validate unique attribute keys per node
    const attributeKeys = updatedNode.data.attributes.map((attr) => attr.key);
    const hasDuplicateAttributeKeys = new Set(attributeKeys).size !== attributeKeys.length;
    if (hasDuplicateAttributeKeys) {
      alert('Duplicate attribute keys found. Please ensure all attribute keys are unique within the node.');
      return;
    }
    
    updatedNode.data.handles = updatedNode.data.attributes
      .filter((attr: Attribute) => attr.connectable)
      .map((attr: Attribute) => ({ id: attr.key, type: attr.type }));

    nodes.update((currentNodes) => {
      return currentNodes.map((n) => (n.id === updatedNode.id ? updatedNode : n));
    });

    const handleIds = new Set(updatedNode.data.handles.map(h => h.id));
    edges.update(currentEdges => {
      return currentEdges.filter(edge => {
        if (edge.source === updatedNode.id && edge.sourceHandle && !handleIds.has(edge.sourceHandle)) {
          return false;
        }
        if (edge.target === updatedNode.id && edge.targetHandle && !handleIds.has(edge.targetHandle)) {
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
      return currentEdges.map((e) => (e.id === updatedEdge.id ? updatedEdge : e));
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
    graphVersion.update(n => n + 1);
    const graph = {
      nodes: get(nodes),
      edges: get(edges),
    };
    console.log(`Saving graph version ${get(graphVersion)}:`, JSON.stringify(graph, null, 2));
    // TODO: Send serialized graph to backend
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
    const matchingNodes = get(nodes).filter(node =>
      node.data.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    searchedNodes.set(matchingNodes.map(node => node.id));
  }

  const debouncedSearch = debounce(handleSearchInternal, 300);
</script>

{#if $editingNode}
  <NodeEditPopup node={$editingNode} on:save={handleSaveNode} on:cancel={handleCancelEdit} />
{/if}

{#if $editingEdge}
  <EdgeEditPopup edge={$editingEdge} on:save={handleSaveEdge} on:cancel={handleCancelEdgeEdit} />
{/if}

<div style="display: flex; justify-content: center; margin-bottom: 10px; gap: 10px;">
  <input type="text" bind:value={searchQuery} on:input={debouncedSearch} placeholder="Search nodes..." />
  <button on:click={handleAddNode}>Add Node</button>
  <button on:click={handleSaveGraph}>Save Graph</button>
</div>

<SvelteFlow
  bind:this={flowInstance}
  nodes={$displayNodes}
  edges={$displayEdges}
  {nodeTypes}
  {edgeTypes}
  nodesConnectable={interactive}
  nodesDraggable={interactive}
  elementsSelectable={interactive}
  on:nodeclick={handleNodeClick}
  on:edgeclick={handleEdgeClick}
  onconnect={handleConnect}
  ondelete={handleDelete}
  onbeforedelete={handleBeforeDelete}
  deleteKey={["Delete", "Backspace"]}
  style="height: 500px"
>
  <Controls />
</SvelteFlow>

<style>
  /* No global highlight style needed here anymore, styles are in components */
</style>
