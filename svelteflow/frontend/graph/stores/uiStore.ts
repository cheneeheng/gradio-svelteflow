import { writable, type Writable } from "svelte/store";

export type Dialog =
  | {
      type: "confirm";
      title: string;
      message: string;
      onConfirm: () => void;
      onCancel: () => void;
    }
  | {
      type: "alert";
      title: string;
      message: string;
      onDismiss: () => void;
    }
  | null;

export function createUIStores() {
  const dialog: Writable<Dialog> = writable(null);
  return {
    dialog,
  };
}

export type UIStores = ReturnType<typeof createUIStores>;
