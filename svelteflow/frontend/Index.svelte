<svelte:options accessors={true} />

<script lang="ts">
  import type { Gradio } from "@gradio/utils";
  import {
    Block,
    BlockTitle,
    FullscreenButton,
    IconButtonWrapper,
  } from "@gradio/atoms";
  import { StatusTracker } from "@gradio/statustracker";
  import type { LoadingStatus } from "@gradio/statustracker";
  import { SvelteFlow, Controls, MarkerType } from "@xyflow/svelte";
  import type { Node, Edge, NodeTypes } from "@xyflow/svelte";
  import type { Viewport, Connection } from "@xyflow/system";
  import "@xyflow/svelte/dist/style.css";
  import { get, writable, type Writable } from "svelte/store";
  import CustomNode from "./CustomNode.svelte";
  import type { CustomNodeData } from "./CustomNodeData";
  // import { sameGraph } from "./GraphUtils";

  // Hack: Polyfill process and Buffer at runtime
  import { Buffer } from "buffer";
  (globalThis as any).process = (globalThis as any).process || { env: {} };
  (globalThis as any).Buffer = (globalThis as any).Buffer || Buffer;

  export let gradio: Gradio<{
    change: { nodes: Node<CustomNodeData>[]; edges: Edge[] };
    select: { nodes: Node<CustomNodeData>[]; edges: Edge[] };
    submit: { nodes: Node<CustomNodeData>[]; edges: Edge[] };
    clear_status: LoadingStatus;
  }>;
  export let label = "Svelte-Flow";
  export let info: string | undefined = undefined;
  export let elem_id = "";
  export let elem_classes: string[] = [];
  export let visible: boolean | "hidden" = true;
  export let value: { nodes: Node<CustomNodeData>[]; edges: Edge[] } | null =
    null;
  export let show_label: boolean = false;
  export let scale: number | null = null;
  export let min_width: number | undefined = undefined;
  export let loading_status: LoadingStatus | undefined = undefined;
  export let interactive: boolean = false;
  export let submit_btn: boolean = false;
  export let show_fullscreen_button = true;

  let fullscreen = false;
  let flowInstance: SvelteFlow;
  let viewport: Viewport = { x: 0, y: 0, zoom: 1 };

  // CUSTOM SVELTEFLOW ITEMS --------------------------------------------------

  // NOTE: Plan to upgrade to @xyflow/svelte v1 (Svelte 5) later,
  // where NodeTypes is simplified and these strict constructor-typ
  //  mismatches go away.
  // const nodeTypes: NodeTypes = { dynamic: CustomNode };
  // Temporarily silence TypeScript with a cast during registration:
  // const nodeTypes: NodeTypes = {
  //   dynamic: CustomNode as unknown as NodeTypes[string],
  // };

  // GRAPH DATA ---------------------------------------------------------------

  function sameGraph(
    a: { nodes: Node<CustomNodeData>[]; edges: Edge[] } | null,
    b: { nodes: Node<CustomNodeData>[]; edges: Edge[] } | null
  ): boolean {
    // check reference
    if (a === b) return true;

    // check null
    if (!a || !b) return false;

    // --- Order insensitive ---
    // Build lookup maps
    const nodeMapB = new Map(b.nodes.map((n) => [n.id, n]));
    const edgeMapB = new Map(b.edges.map((e) => [e.id, e]));
    // Compare nodes
    for (const na of a.nodes) {
      const nb = nodeMapB.get(na.id);
      // Compare id
      if (!nb) return false;
      // Compare type
      if (na.type !== nb.type) return false;
      const da = na.data ?? {};
      const db = nb.data ?? {};
      // Compare label
      if ((da.label ?? "") !== (db.label ?? "")) return false;
      // Compare sources/targets by id
      const srcA = (da.sources ?? []).map((s) => s.id).sort();
      const srcB = (db.sources ?? []).map((s) => s.id).sort();
      if (srcA.length !== srcB.length || srcA.some((id, i) => id !== srcB[i])) {
        return false;
      }
      const tgtA = (da.targets ?? []).map((t) => t.id).sort();
      const tgtB = (db.targets ?? []).map((t) => t.id).sort();
      if (tgtA.length !== tgtB.length || tgtA.some((id, i) => id !== tgtB[i])) {
        return false;
      }
      // // Compare offsets if relevant
      // if ((da.topOffsetPx ?? 0) !== (db.topOffsetPx ?? 0)) return false;
      // if ((da.sideOffsetPx ?? 0) !== (db.sideOffsetPx ?? 0)) return false;
    }

    // Compare edges by id, source, target
    for (const ea of a.edges) {
      const eb = edgeMapB.get(ea.id);
      if (!eb) return false;
      if (ea.source !== eb.source || ea.target !== eb.target) return false;
      if ((ea.sourceHandle ?? "") !== (eb.sourceHandle ?? "")) return false;
      if ((ea.targetHandle ?? "") !== (eb.targetHandle ?? "")) return false;
    }

    return true;
  }

  const nodes = writable<Node<CustomNodeData>[]>([]);
  const edges = writable<Edge[]>([]);

  // Sync from parent -> local stores
  $: if (value && !sameGraph(value, { nodes: $nodes, edges: $edges })) {
    nodes.set(value.nodes);
    edges.set(value.edges);
  }

  // Sync from local stores -> parent
  let lastDispatched: { nodes: Node<CustomNodeData>[]; edges: Edge[] } | null =
    null;

  $: {
    const new_value = { nodes: $nodes, edges: $edges };
    if (!sameGraph(new_value, value) && !sameGraph(new_value, lastDispatched)) {
      gradio.dispatch("change", new_value);
      lastDispatched = new_value;
    }
  }

  // // Minimal nodes with matching handles
  // const nodes = writable([
  //   {
  //     id: "node-1",
  //     position: { x: 0, y: 0 },
  //     data: { label: "Source" },
  //     type: "default",
  //   },
  //   {
  //     id: "node-2",
  //     position: { x: 250, y: 100 },
  //     data: { label: "Target" },
  //     type: "default",
  //   },
  // ]);

  // // Minimal edge with matching handle IDs and arrowhead
  // const edges = writable([
  //   {
  //     id: "e1-2",
  //     source: "node-1",
  //     target: "node-2",
  //     // these must match actual <Handle id="…"> if you use custom nodes
  //     sourceHandle: null,
  //     targetHandle: null,
  //     markerEnd: {
  //       type: MarkerType.ArrowClosed,
  //       color: "#222",
  //       width: 20,
  //       height: 20,
  //     },
  //   },
  // ]);

  // PROP HANDLERS -----------------------------------------------------------

  function handleInit(e: CustomEvent<any>) {
    console.log("Flow initialized");
  }

  function handleMove(event: MouseEvent | TouchEvent | null, vp: Viewport) {
    viewport = vp;
    console.log("Viewport moved:", viewport);
    // you can also react to the raw DOM event if needed:
    if (event) {
      console.log("Triggered by:", event.type);
    }
  }

  function handleConnect(connection: Connection) {
    const { source, target, sourceHandle, targetHandle } = connection;
    if (!source || !target) return; // incomplete connection
    // if (!targetHandle) return; // require a target handle
    // if (!sourceHandle) return; // require a source handle
    console.log("Inside handleConnect()");
    const id = crypto.randomUUID();
    const edgeId = `${source}:${sourceHandle}-->${target}:${targetHandle}`;
    edges.update((es: Edge[]) => {
      // if (es.some((edge) => edge.id === edgeId)) return es; // prevent duplicates
      return [
        ...es,
        {
          id: id,
          source,
          target,
          sourceHandle, // attaches to specific source handle
          targetHandle, // attaches to specific target handle
          label: edgeId,
        },
      ];
    });
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
  }

  // EVENT HANDLERS -----------------------------------------------------------

  function handleAddNode() {
    console.log("Inside handleAddNode()");
    // Compute the center of the visible area
    const container = document.querySelector(".svelte-flow") as HTMLElement;
    const cx = container ? container.clientWidth / 2 : 250;
    const cy = container ? container.clientHeight / 2 : 150;
    // Project screen coords to flow coords
    const x = (cx - viewport.x) / viewport.zoom;
    const y = (cy - viewport.y) / viewport.zoom;
    const id = crypto.randomUUID();
    const jitter = Math.random() * 40 - 20; // -20..+20 px
    const newNode: Node<CustomNodeData> = {
      id,
      type: "default",
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
      gradio.dispatch("select", { nodes: [casted_node], edges: [] });
    }
    // NOTE: Touch event is not supported.
  }

  function handleEdgeClick(
    e: CustomEvent<{ edge: Edge; event: MouseEvent | TouchEvent }>
  ) {
    console.log("Inside handleEdgeClick()");
    if (interactive && e.detail.event instanceof MouseEvent) {
      gradio.dispatch("select", { nodes: [], edges: [e.detail.edge] });
    }
  }

  function handleSubmit() {
    console.log("Inside handleSubmit()");
    gradio.dispatch("submit", { nodes: $nodes, edges: $edges });
  }

  // Cast to the looser type SvelteFlow expects
  let nodesGeneric = nodes as unknown as Writable<Node[]>;
  let edgesGeneric = edges as unknown as Writable<Edge[]>;
  const handleInitCompat = handleInit as unknown as () => void;
</script>

<Block
  {visible}
  {elem_id}
  {elem_classes}
  {scale}
  {min_width}
  allow_overflow={false}
  padding={true}
  bind:fullscreen
>
  <BlockTitle {show_label} {info}>{label}</BlockTitle>

  {#if show_fullscreen_button}
    <IconButtonWrapper>
      <FullscreenButton
        {fullscreen}
        on:fullscreen={({ detail }) => {
          fullscreen = detail;
        }}
      />
    </IconButtonWrapper>
  {/if}

  {#if loading_status}
    <StatusTracker
      autoscroll={gradio.autoscroll}
      i18n={gradio.i18n}
      {...loading_status}
      on:clear_status={() => gradio.dispatch("clear_status", loading_status)}
    />
  {/if}

  <div style="display: flex; justify-content: center; margin-bottom: 10px;">
    <button on:click={handleAddNode}>Add Node</button>
  </div>

  <SvelteFlow
    bind:this={flowInstance}
    bind:nodes={nodesGeneric}
    bind:edges={edgesGeneric}
    defaultEdgeOptions={{
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: "#222",
        width: 20,
        height: 20,
      },
    }}
    nodesDraggable={interactive}
    nodesConnectable={interactive}
    elementsSelectable={interactive}
    on:nodeclick={handleNodeClick}
    on:edgeclick={handleEdgeClick}
    oninit={handleInitCompat}
    onMove={handleMove}
    onconnect={handleConnect}
    ondelete={handleDelete}
    onbeforedelete={handleBeforeDelete}
    style="height: 500px"
  >
    <Controls />
  </SvelteFlow>

  {#if submit_btn}
    <div style="display: flex; justify-content: center; margin-top: 10px;">
      <button on:click={handleSubmit}>Submit</button>
    </div>
  {/if}
</Block>
