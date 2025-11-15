import type { Node as SvelteFlowNode, Edge as SvelteFlowEdge } from '@xyflow/svelte';

export interface Attribute {
  key: string;
  value: string;
  visible: boolean;
  connectable: boolean;
  type: 'input' | 'output';
}

export interface Handle {
  id: string;
  type: 'input' | 'output';
}

export interface CustomNode extends SvelteFlowNode {
  data: {
    name: string;
    description: string;
    attributes: Attribute[];
    handles: Handle[];
  };
}

export interface CustomEdge extends SvelteFlowEdge {
  label?: string;
}

export interface GraphSchema {
  nodes: CustomNode[];
  edges: CustomEdge[];
}

export interface UIState {
  highlightedNodes: string[];
  highlightedEdges: string[];
  searchQuery: string;
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
}
