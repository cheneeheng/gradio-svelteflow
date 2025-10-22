<svelte:options accessors={true} />

<script lang="ts">
	import type { Gradio } from "@gradio/utils";
	import { BlockTitle } from "@gradio/atoms";
	import { Block } from "@gradio/atoms";
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";
	import { SvelteFlow, Controls } from '@xyflow/svelte';
	import type { Node, Edge } from '@xyflow/svelte';
	import '@xyflow/svelte/dist/style.css';
	import { writable } from 'svelte/store';

	export let gradio: Gradio<{
		change: never;
	}>;
	export let label = "Svelte-Flow";
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible: boolean | "hidden" = true;
	export let value: { nodes: Node[], edges: Edge[] } | null = null;
	export let show_label: boolean;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let loading_status: LoadingStatus | undefined = undefined;
	export let interactive: boolean;

	const nodes = writable<Node[]>([]);
	const edges = writable<Edge[]>([]);

	$: if (value) {
		nodes.set(value.nodes);
		edges.set(value.edges);
	}

	$: value, gradio.dispatch("change")
</script>

<Block
	{visible}
	{elem_id}
	{elem_classes}
	{scale}
	{min_width}
	allow_overflow={false}
	padding={true}
>
	{#if loading_status}
		<StatusTracker
			autoscroll={gradio.autoscroll}
			i18n={gradio.i18n}
			{...loading_status}
			on:clear_status={() => gradio.dispatch("clear_status", loading_status)}
		/>
	{/if}

	<div style="height: 500px">
		<SvelteFlow {nodes} {edges}>
			<Controls />
		</SvelteFlow>
	</div>
</Block>
