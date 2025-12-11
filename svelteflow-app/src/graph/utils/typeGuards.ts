import type { Node, Edge } from "@xyflow/svelte";
import type { CustomNode, CustomEdge, Attribute } from "../types/schemas";

/**
 * Type guard to check if a Node is a CustomNode
 */
export function isCustomNode(node: Node): node is CustomNode {
  return (
    node.type === "custom" &&
    typeof node.data === "object" &&
    node.data !== null &&
    "name" in node.data &&
    "description" in node.data &&
    "attributes" in node.data &&
    Array.isArray(node.data.attributes)
  );
}

/**
 * Type guard to check if an Edge is a CustomEdge
 */
export function isCustomEdge(edge: Edge): edge is CustomEdge {
  return edge.type === "custom";
}

/**
 * Type guard to check if an object is a valid Attribute
 */
export function isValidAttribute(obj: any): obj is Attribute {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.key === "string" &&
    typeof obj.value === "string" &&
    typeof obj.visible === "boolean" &&
    typeof obj.connectable === "boolean" &&
    (obj.type === "input" || obj.type === "output")
  );
}

/**
 * Validates that a node name is not empty
 */
export function isValidNodeName(name: string): boolean {
  return name.trim().length > 0;
}

/**
 * Validates that an attribute key is not empty
 */
export function isValidAttributeKey(key: string): boolean {
  return key.trim().length > 0;
}

/**
 * Type guard for valid connection types
 */
export function isValidConnection(
  sourceType: "input" | "output" | undefined,
  targetType: "input" | "output" | undefined
): boolean {
  // Source must be output, target must be input
  // If either is undefined (collapsed handles), allow it
  if (sourceType === undefined || targetType === undefined) return true;
  return sourceType === "output" && targetType === "input";
}

/**
 * Validates graph structure when loading from JSON
 */
export function isValidGraphStructure(data: any): data is {
  nodes: CustomNode[];
  edges: CustomEdge[];
  viewport?: { x: number; y: number; zoom: number };
} {
  if (typeof data !== "object" || data === null) return false;
  if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) return false;

  // Validate nodes
  for (const node of data.nodes) {
    if (!isValidNode(node)) return false;
  }

  // Validate edges
  for (const edge of data.edges) {
    if (!isValidEdge(edge)) return false;
  }

  // Validate viewport if present
  if (data.viewport !== undefined) {
    if (
      typeof data.viewport !== "object" ||
      typeof data.viewport.x !== "number" ||
      typeof data.viewport.y !== "number" ||
      typeof data.viewport.zoom !== "number"
    ) {
      return false;
    }
  }

  return true;
}

function isValidNode(node: any): node is CustomNode {
  return (
    typeof node === "object" &&
    node !== null &&
    typeof node.id === "string" &&
    typeof node.position === "object" &&
    typeof node.position.x === "number" &&
    typeof node.position.y === "number" &&
    typeof node.data === "object" &&
    typeof node.data.name === "string" &&
    typeof node.data.description === "string" &&
    Array.isArray(node.data.attributes) &&
    node.data.attributes.every(isValidAttribute)
  );
}

function isValidEdge(edge: any): edge is CustomEdge {
  return (
    typeof edge === "object" &&
    edge !== null &&
    typeof edge.id === "string" &&
    typeof edge.source === "string" &&
    typeof edge.target === "string"
  );
}
