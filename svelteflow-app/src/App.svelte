<script lang="ts">
  import { get, writable, type Writable } from "svelte/store";
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
  import { highlightedNodes, highlightedEdges } from "./stores/highlightStore";

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

  // PROP HANDLERS -----------------------------------------------------------

  function handleInit() {
    console.log("Flow initialized");
  }

  function handleMove(event: MouseEvent | TouchEvent | null, vp: Viewport) {
    viewport = vp;
    // you can also react to the raw DOM event if needed:
    if (event) {
      console.log("Triggered by:", event.type);
    }
  }

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
    highlightedNodes.set([]);
    highlightedEdges.set([]);
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
      // If the node is already highlighted, open the edit popup
      if (get(highlightedNodes).includes(clickedNode.id)) {
        editingNode.set(clickedNode);
      } else {
        const connectedEdges = get(edges).filter(
          (edge) => edge.source === clickedNode.id || edge.target === clickedNode.id
        );
        const neighborIds = connectedEdges.flatMap((edge) => [edge.source, edge.target]);
        
        highlightedNodes.set([clickedNode.id, ...neighborIds]);
        highlightedEdges.set(connectedEdges.map(edge => edge.id));
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
    highlightedNodes.set([]);
    highlightedEdges.set([]);
  }

  function handleCancelEdit() {
    editingNode.set(null);
  }

  function handleSaveEdge(event: CustomEvent<CustomEdge>) {
    const updatedEdge = event.detail;
    edges.update((currentEdges) => {
      return currentEdges.map((e) => (e.id === updatedEdge.id ? updatedEdge : e));
    });
    editingEdge.set(null);
  }

  function handleCancelEdgeEdit() {
    editingEdge.set(null);
  }

  function handleSaveGraph() {
    const graph = {
      nodes: get(nodes),
      edges: get(edges),
    };
    console.log("Saving graph:", JSON.stringify(graph, null, 2));
  }

  function handleSearch() {
    if (searchQuery.length === 0) {
      highlightedNodes.set([]);
      return;
    }
    const matchingNodes = get(nodes).filter(node =>
      node.data.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    highlightedNodes.set(matchingNodes.map(node => node.id));
  }

  let nodesGeneric = nodes as unknown as Writable<Node[]>;
  let edgesGeneric = edges as unknown as Writable<Edge[]>;
  const handleInitCompat = handleInit as unknown as () => void;
</script>

{#if $editingNode}
  <NodeEditPopup node={$editingNode} on:save={handleSaveNode} on:cancel={handleCancelEdit} />
{/if}

{#if $editingEdge}
  <EdgeEditPopup edge={$editingEdge} on:save={handleSaveEdge} on:cancel={handleCancelEdgeEdit} />
{/if}

<div style="display: flex; justify-content: center; margin-bottom: 10px; gap: 10px;">
  <input type="text" bind:value={searchQuery} on:input={handleSearch} placeholder="Search nodes..." />
  <button on:click={handleAddNode}>Add Node</button>
  <button on:click={handleSaveGraph}>Save Graph</button>
</div>

<SvelteFlow
  bind:this={flowInstance}
  bind:nodes={nodesGeneric}
  bind:edges={edgesGeneric}
  {nodeTypes}
  {edgeTypes}
  nodesConnectable={interactive}
  nodesDraggable={interactive}
  elementsSelectable={interactive}
  on:nodeclick={handleNodeClick}
  on:edgeclick={handleEdgeClick}
  oninit={handleInitCompat}
  onMove={handleMove}
  onconnect={handleConnect}
  ondelete={handleDelete}
  onbeforedelete={handleBeforeDelete}
  deleteKey={["Delete", "Backspace"]}
  style="height: 500px"
>
  <Controls />
</SvelteFlow>

<style>
  :global(.highlight) {
    box-shadow: 0 0 10px 5px yellow;
  }
</style>
