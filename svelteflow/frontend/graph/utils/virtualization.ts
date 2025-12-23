import type { Viewport } from "@xyflow/system";
import RBush from "rbush";
import type { CustomNode } from "../types/schemas";

interface NodeItem {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  id: string;
}

export class SpatialIndex {
  private tree: RBush<NodeItem>;

  constructor() {
    this.tree = new RBush();
  }

  update(nodes: CustomNode[]) {
    this.tree.clear();
    const items: NodeItem[] = nodes.map((node) => {
      // Default dimensions if not yet measured
      const w = node.width ?? 200;
      const h = node.height ?? 100;
      return {
        minX: node.position.x,
        minY: node.position.y,
        maxX: node.position.x + w,
        maxY: node.position.y + h,
        id: node.id,
      };
    });
    this.tree.load(items);
  }

  query(
    viewport: Viewport,
    viewportDimensions: { width: number; height: number },
    overscan: number = 500
  ): Set<string> {
    if (viewport.zoom === 0) return new Set();

    const minX = -viewport.x / viewport.zoom - overscan;
    const minY = -viewport.y / viewport.zoom - overscan;
    const maxX =
      (-viewport.x + viewportDimensions.width) / viewport.zoom + overscan;
    const maxY =
      (-viewport.y + viewportDimensions.height) / viewport.zoom + overscan;

    const results = this.tree.search({ minX, minY, maxX, maxY });
    return new Set(results.map((item) => item.id));
  }
}
