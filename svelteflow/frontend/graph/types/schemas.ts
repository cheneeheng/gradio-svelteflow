import type {
  Node as SvelteFlowNode,
  Edge as SvelteFlowEdge,
} from "@xyflow/svelte";

export interface Attribute {
  key: string;
  value: string;
  visible: boolean;
  connectable: boolean;
  type: "input" | "output";
}

export interface Handle {
  id: string;
  type: "input" | "output";
}

export interface CustomNode extends SvelteFlowNode {
  data: {
    name: string;
    description: string;
    attributes: Attribute[];
    handles: Handle[];
    collapsed?: boolean;
  };
}

export interface CollapsibleEdgeData {
  originalSourceHandle?: string | null;
  originalTargetHandle?: string | null;
  [key: string]: unknown;
}

export interface CustomEdge extends SvelteFlowEdge {
  label?: string;
  data?: CollapsibleEdgeData;
}

export interface GraphSchema {
  nodes: CustomNode[];
  edges: CustomEdge[];
}

export interface GraphValue {
  nodes: CustomNode[];
  edges: CustomEdge[];
  loaded: boolean;
  zoomToNodeName: string | null;
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

export interface GraphEventMeta {
  eventType:
    | "load"
    | "nodeSave"
    | "edgeSave"
    | "change"
    | "delete"
    | "selection"
    | "viewportChange"
    | "nodeMove"
    | "selectionClear"
    | "uiChange";
  handleId?: string;
  sourceType?: "node" | "edge" | "viewport" | "graph" | "toolbar";
  sourceId?: string;
  targetId?: string;
  timestamp: string;
  diff?: Record<string, any>;
  snapshot?: Record<string, any>;
}

export interface GraphEventPayload {
  value: GraphValue;
  meta: GraphEventMeta;
}
