export type DynamicNodeData = {
  label?: string;
  sources?: { id: string }[];
  targets?: { id: string }[];
  topOffsetPx?: number;
  sideOffsetPx?: number;
};
