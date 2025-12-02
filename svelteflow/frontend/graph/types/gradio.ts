import type { CustomNode, CustomEdge } from "./schemas";

// Define a local stub type for Gradio-like objects
// type DispatchOf<TEvents> = {
//   [K in keyof TEvents]: (event_name: K, data?: TEvents[K]) => void;
// }[keyof TEvents];

// export interface GradioLike<TEvents> {
//   dispatch: DispatchOf<TEvents>;
// }

export interface GradioLike<TEvents> {
  dispatch(
    event_name: keyof TEvents,
    data?: TEvents[keyof TEvents] | undefined
  ): void;
}

// Minimal stub for LoadingStatus
export type LoadingStatus = {
  eta: number;
  queue_position: number;
  queue_size: number;
  status: "pending" | "error" | "complete" | "generating" | "streaming";
  show_progress: "full" | "minimal" | "hidden";
  scroll_to_output: boolean;
  visible: boolean;
  fn_index: number;
  message?: string;
  progress?: {
    progress: number | null;
    index: number | null;
    length: number | null;
    unit: string | null;
    desc: string | null;
  }[];
  time_limit?: number | null;
  validation_error?: string | null;
};

// Use the stub type instead of importing Gradio
export type GraphEvents = {
  change: { nodes: CustomNode[]; edges: CustomEdge[] };
  select: { nodes: CustomNode[]; edges: CustomEdge[] };
  submit: { nodes: CustomNode[]; edges: CustomEdge[] };
  clear_status: LoadingStatus;
};
