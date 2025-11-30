import type { CustomNode, CustomEdge } from "./schemas";

// Define a local stub type for Gradio-like objects
export interface GradioLike<TEvents> {
  dispatch(event: keyof TEvents, value: TEvents[keyof TEvents]): void;
}

// Minimal stub for LoadingStatus
export type LoadingStatus = "idle" | "loading" | "success" | "error";

// Use the stub type instead of importing Gradio
export type GraphEvents = {
  change: { nodes: CustomNode[]; edges: CustomEdge[] };
  select: { nodes: CustomNode[]; edges: CustomEdge[] };
  submit: { nodes: CustomNode[]; edges: CustomEdge[] };
  clear_status: LoadingStatus;
};
