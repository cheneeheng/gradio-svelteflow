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
  import { SvelteFlow, Controls } from "@xyflow/svelte";
  import type { Node, Edge, NodeTypes } from "@xyflow/svelte";
  import "@xyflow/svelte/dist/style.css";
  import { writable } from "svelte/store";
  import DynamicHandlesNode from "./DynamicHandlesNode.svelte";
  import type { DynamicNodeData } from "./DynamicNodeData.ts";

  export let gradio: Gradio<{
    change: { nodes: Node<DynamicNodeData>[]; edges: Edge[] };
    select: { nodes: Node<DynamicNodeData>[]; edges: Edge[] };
    submit: { nodes: Node<DynamicNodeData>[]; edges: Edge[] };
    clear_status: LoadingStatus;
  }>;
  export let label = "Svelte-Flow";
  export let info: string | undefined = undefined;
  export let elem_id = "";
  export let elem_classes: string[] = [];
  export let visible: boolean | "hidden" = true;
  export let value: { nodes: Node<DynamicNodeData>[]; edges: Edge[] } | null =
    null;
  export let show_label: boolean = false;
  export let scale: number | null = null;
  export let min_width: number | undefined = undefined;
  export let loading_status: LoadingStatus | undefined = undefined;
  export let interactive: boolean = false;
  export let submit_btn: boolean = false;
  export let show_fullscreen_button = true;
  let fullscreen = false;

  // CUSTOM SVELTEFLOW ITEMS --------------------------------------------------

  // NOTE: Plan to upgrade to @xyflow/svelte v1 (Svelte 5) later,
  // where NodeTypes is simplified and these strict constructor-typ
  //  mismatches go away.
  // const nodeTypes: NodeTypes = { dynamic: DynamicHandlesNode };
  // Temporarily silence TypeScript with a cast during registration:
  const nodeTypes: NodeTypes = {
    dynamic: DynamicHandlesNode as unknown as NodeTypes[string],
  };

  // GRAPH DATA ---------------------------------------------------------------

  function sameGraph(
    a: { nodes: Node<DynamicNodeData>[]; edges: Edge[] } | null,
    b: { nodes: Node<DynamicNodeData>[]; edges: Edge[] } | null
  ): boolean {
    // check reference
    if (a === b) return true;

    // check null
    if (!a || !b) return false;

    // --- Order insensitive ---
    // Build lookup maps
    const nodeMapB = new Map(b.nodes.map((n) => [n.id, n]));
    const edgeMapB = new Map(b.edges.map((e) => [e.id, e]));
    // Compare nodes by id, type, and label (ignore position)
    for (const na of a.nodes) {
      const nb = nodeMapB.get(na.id);
      if (!nb) return false;
      if (
        na.type !== nb.type ||
        (na.data?.label ?? "") !== (nb.data?.label ?? "")
      ) {
        return false;
      }
    }
    // Compare edges by id, source, target
    for (const ea of a.edges) {
      const eb = edgeMapB.get(ea.id);
      if (!eb) return false;
      if (ea.source !== eb.source || ea.target !== eb.target) {
        return false;
      }
    }
    return true;
  }

  const nodes = writable<Node<DynamicNodeData>[]>([]);
  const edges = writable<Edge[]>([]);

  // Sync from parent -> local stores
  $: if (value && !sameGraph(value, { nodes: $nodes, edges: $edges })) {
    nodes.set(value.nodes);
    edges.set(value.edges);
  }

  // Sync from local stores -> parent
  let lastDispatched: { nodes: Node<DynamicNodeData>[]; edges: Edge[] } | null =
    null;

  $: {
    const new_value = { nodes: $nodes, edges: $edges };
    if (!sameGraph(new_value, value) && !sameGraph(new_value, lastDispatched)) {
      gradio.dispatch("change", new_value);
      lastDispatched = new_value;
    }
  }

  // EVENT HANDLERS -----------------------------------------------------------

  function handleNodeClick(
    e: CustomEvent<{
      node: Node;
      event: MouseEvent | TouchEvent;
    }>
  ) {
    const casted_node = e.detail.node as Node<DynamicNodeData>;
    if (interactive && e.detail.event instanceof MouseEvent) {
      gradio.dispatch("select", { nodes: [casted_node], edges: [] });
    }
    // NOTE: Touch event is not supported.
  }

  function handleEdgeClick(
    e: CustomEvent<{ edge: Edge; event: MouseEvent | TouchEvent }>
  ) {
    if (interactive && e.detail.event instanceof MouseEvent) {
      gradio.dispatch("select", { nodes: [], edges: [e.detail.edge] });
    }
  }

  function handleSubmit() {
    gradio.dispatch("submit", { nodes: $nodes, edges: $edges });
  }

  // function handleAddNode() {
  //   const id = crypto.randomUUID();
  //   nodes.update((n) => [
  //     ...n,
  //     {
  //       id,
  //       type: "default",
  //       data: { label: `Node ${n.length + 1}` },
  //       position: { x: 100 + n.length * 50, y: 100 },
  //     },
  //   ]);
  // }

  function handleAddNode() {
    const id = crypto.randomUUID();
    // one source and one target handle
    const newNode: Node<DynamicNodeData> = {
      id,
      type: "dynamic", // must match nodeTypes key
      position: { x: 100, y: 100 },
      data: {
        label: "New Node",
        sources: [{ id: `${id}-s1` }],
        targets: [{ id: `${id}-t1` }],
      },
    };
    nodes.update((n) => [...n, newNode]);
  }

  function handleConnect(
    e: CustomEvent<{
      source: string;
      target: string;
      sourceHandle?: string;
      targetHandle?: string;
    }>
  ) {
    const { source, target, sourceHandle, targetHandle } = e.detail;
    const edgeId = `${source}${sourceHandle ? `:${sourceHandle}` : ""}-->${target}${targetHandle ? `:${targetHandle}` : ""}`;
    edges.update((es) => [
      ...es,
      {
        id: edgeId,
        source,
        target,
        sourceHandle, // attaches to specific left-side source handle
        targetHandle, // attaches to specific right-side target handle
        markerEnd: "arrowclosed", // directed edge
      },
    ]);
  }

  function handleBeforeDelete(
    e: CustomEvent<{ nodes: Node<DynamicNodeData>[]; edges: Edge[] }>
  ) {
    const { nodes: toDelete, edges: toDeleteEdges } = e.detail;
    nodes.update((n) => n.filter((node) => !toDelete.includes(node)));
    edges.update((es) => es.filter((edge) => !toDeleteEdges.includes(edge)));
  }
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

  <div style="height: 500px">
    <SvelteFlow
      {nodes}
      {edges}
      {nodeTypes}
      on:nodeclick={handleNodeClick}
      on:edgeclick={handleEdgeClick}
      on:connect={handleConnect}
      on:beforedelete={handleBeforeDelete}
      nodesDraggable={interactive}
      nodesConnectable={interactive}
      elementsSelectable={interactive}
    >
      <Controls />
    </SvelteFlow>
  </div>

  {#if submit_btn}
    <div style="display: flex; justify-content: center; margin-top: 10px;">
      <button on:click={handleSubmit}>Submit</button>
    </div>
  {/if}
</Block>
