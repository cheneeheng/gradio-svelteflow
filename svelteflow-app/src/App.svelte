<script lang="ts">
  import { get, writable, type Writable } from "svelte/store";
  import { SvelteFlow, Controls, MarkerType } from "@xyflow/svelte";
  import type { Node, Edge } from "@xyflow/svelte";
  import type { Viewport, Connection } from "@xyflow/system";
  import "@xyflow/svelte/dist/style.css";

  import type { CustomNodeData } from "./CustomNodeData";
  import CustomEdge from "./CustomEdge.svelte";

  const edgeTypes = { custom: CustomEdge };

  export let interactive: boolean = true;

  let flowInstance: SvelteFlow;
  let viewport: Viewport = { x: 0, y: 0, zoom: 1 };

  // const nodes = writable<Node<CustomNodeData>[]>([]);
  // const edges = writable<Edge[]>([]);

  // Minimal nodes with matching handles
  const nodes = writable<Node<CustomNodeData>[]>([
    {
      id: "node-1",
      position: { x: 0, y: 0 },
      data: { label: "Source" },
      type: "default",
    },
    {
      id: "node-2",
      position: { x: 250, y: 100 },
      data: { label: "Target" },
      type: "default",
    },
  ]);

  // Minimal edge with matching handle IDs and arrowhead
  const edges = writable<Edge[]>([
    {
      id: "e1-2",
      source: "node-1",
      target: "node-2",
      // these must match actual <Handle id="…"> if you use custom nodes
      sourceHandle: null,
      targetHandle: null,
      label: "e1-2",
    },
  ]);

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
    console.log("Inside handleConnect()");
    const { source, target, sourceHandle, targetHandle } = connection;
    if (!source || !target) return; // incomplete connection
    // if (!targetHandle) return; // require a target handle
    // if (!sourceHandle) return; // require a source handle
    const id = crypto.randomUUID();
    const edgeId = `${source}:${sourceHandle}-->${target}:${targetHandle}`;
    edges.update((es: Edge[]) => {
      if (es.some((edge) => edge.id === edgeId)) return es; // prevent duplicates
      const next = [
        ...es,
        {
          id: edgeId,
          // type: "custom",
          source,
          target,
          sourceHandle,
          targetHandle,
          label: edgeId,
        },
      ];
      console.log("Edges now:", next);
      return next;
    });
  }

  function handleEdgeCreate(connection: Connection): Edge | null {
    const { source, target, sourceHandle, targetHandle } = connection;
    if (!source || !target) return null; // block incomplete connections
    const edgeId = `${source}:${sourceHandle ?? ""}-->${target}:${targetHandle ?? ""}`;
    return {
      id: edgeId,
      source,
      target,
      sourceHandle,
      targetHandle,
      type: "custom",
      label: edgeId,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: "#222",
      },
      data: { one: 1 },
    };
  }

  async function handleBeforeDelete({
    nodes,
    edges: toDeleteEdges,
  }: {
    nodes: Node<CustomNodeData>[];
    edges: Edge[];
  }): Promise<boolean> {
    console.log("Inside handleBeforeDelete()");
    // 1. If you want to manually filter:
    // nodesStore.update((n) => n.filter((node) => !nodes.some((d) => d.id === node.id)));
    // edgesStore.update((es) => es.filter((edge) => !toDeleteEdges.some((d) => d.id === edge.id)));
    // return false; // abort built‑in deletion
    // 2. Let SvelteFlow handle deletion
    return true;
  }

  function handleDelete({
    nodes: deletedNodes,
    edges: deletedEdges,
  }: {
    nodes: Node<CustomNodeData>[];
    edges: Edge[];
  }) {
    console.log("Inside handleDelete()");
    const currentNodes = get(nodes);
    const currentEdges = get(edges);
    console.log(currentEdges);
    console.log(deletedEdges);
  }

  // EVENT HANDLERS -----------------------------------------------------------

  function handleAddNode() {
    console.log("Inside handleAddNode()");
    // // Compute the center of the visible area
    // const container = document.querySelector(".svelte-flow") as HTMLElement;
    const container = (flowInstance?.$el as HTMLElement) ?? null;
    const cx = container ? container.clientWidth / 2 : 250;
    const cy = container ? container.clientHeight / 2 : 150;
    // Project screen coords to flow coords
    const x = (cx - viewport.x) / viewport.zoom;
    const y = (cy - viewport.y) / viewport.zoom;
    const id = crypto.randomUUID();
    const jitter = Math.random() * 40 - 20; // -20..+20 px
    const newNode: Node<CustomNodeData> = {
      id,
      position: { x: x + jitter, y: y + jitter },
      data: {
        label: `Node ${Date.now()}`,
        sources: [{ id: `${id}-s1` }],
        targets: [{ id: `${id}-t1` }],
      },
    };
    console.log(newNode);
    nodes.update((n) => [...n, newNode]);
  }

  function handleNodeClick(
    e: CustomEvent<{
      node: Node;
      event: MouseEvent | TouchEvent;
    }>
  ) {
    console.log("Inside handleNodeClick()");
    const casted_node = e.detail.node as Node<CustomNodeData>;
    if (interactive && e.detail.event instanceof MouseEvent) {
      console.log("Inside handleNodeClick() - mouse click");
    }
    // NOTE: Touch event is not supported.
  }

  function handleEdgeClick(
    e: CustomEvent<{ edge: Edge; event: MouseEvent | TouchEvent }>
  ) {
    console.log("Inside handleEdgeClick()");
    if (interactive && e.detail.event instanceof MouseEvent) {
      console.log("Inside handleEdgeClick() - mouse click");
    }
  }

  function handleSubmit() {
    console.log("Inside handleSubmit");
  }

  // Cast to the looser type SvelteFlow expects
  let nodesGeneric = nodes as unknown as Writable<Node[]>;
  let edgesGeneric = edges as unknown as Writable<Edge[]>;
  const handleInitCompat = handleInit as unknown as () => void;
</script>

<div style="display: flex; justify-content: center; margin-bottom: 10px;">
  <button on:click={handleAddNode}>Add Node</button>
</div>

<SvelteFlow
  bind:this={flowInstance}
  bind:nodes={nodesGeneric}
  bind:edges={edgesGeneric}
  {edgeTypes}
  nodesConnectable={interactive}
  nodesDraggable={interactive}
  elementsSelectable={interactive}
  on:nodeclick={handleNodeClick}
  on:edgeclick={handleEdgeClick}
  oninit={handleInitCompat}
  onMove={handleMove}
  onedgecreate={handleEdgeCreate}
  ondelete={handleDelete}
  onbeforedelete={handleBeforeDelete}
  deleteKey={["Delete", "Backspace"]}
  style="height: 500px"
>
  <Controls />
</SvelteFlow>

<!-- <SvelteFlow
  bind:this={flowInstance}
  bind:nodes={nodesGeneric}
  bind:edges={edgesGeneric}
  defaultEdgeOptions={{
    // type: "custom",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#222",
      width: 20,
      height: 20,
    },
  }}
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
</SvelteFlow> -->
