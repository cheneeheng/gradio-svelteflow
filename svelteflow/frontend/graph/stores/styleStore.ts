import { writable } from "svelte/store";

export interface StyleConfig {
  nodeSizeScale: number;
  nodeFontSize: number;
  edgeWidth: number;
  edgeLabelFontSize: number;
}

export const styleConfig = writable<StyleConfig>({
  nodeSizeScale: 1,
  nodeFontSize: 14,
  edgeWidth: 2,
  edgeLabelFontSize: 12,
});
