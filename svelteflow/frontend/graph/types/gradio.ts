import type { GraphEventPayload } from "./schemas";

// Define a local stub type for Gradio-like objects
// export interface GradioLike<TEvents> {
//   dispatch(event: keyof TEvents, value: TEvents[keyof TEvents]): void;
// }
export interface GradioLike<TEvents> {
  dispatch<E extends keyof TEvents>(event: E, value?: TEvents[E]): void;
}

// Local copy of "LoadingStatus" from "@gradio/statustracker"
export interface LoadingStatus {
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
}

// Use the stub type instead of importing Gradio
export type GraphEvents = {
  change: GraphEventPayload;
  select: GraphEventPayload;
  submit: GraphEventPayload;
  clear_status: LoadingStatus;
};
