# Architecture Overview

## Core Components

```
graph/
├── components/          # UI Components
│   ├── Graph.svelte            # Main canvas with SvelteFlow
│   ├── CustomNode.svelte       # Custom node component
│   ├── CustomEdge.svelte       # Custom edge component
│   ├── Toolbar.svelte          # Bottom toolbar with controls
│   ├── Dialogs.svelte          # Confirmation/alert dialogs
│   ├── CustomNodeEditPopup.svelte
│   └── CustomEdgeEditPopup.svelte
├── stores/              # State Management
│   ├── instanceStore.ts        # Per-instance graph state
│   ├── activeStore.ts          # Global active instance tracker
│   ├── themeStore.ts           # Light/dark theme
│   ├── uiStore.ts              # UI dialogs
│   └── context.ts              # Svelte context key
├── utils/               # Business Logic
│   ├── graph/                  # Graph operations
│   │   ├── canvas.ts           # Canvas interactions
│   │   ├── node.ts             # Node operations
│   │   ├── edge.ts             # Edge operations
│   │   └── popup.ts            # Popup handlers
│   ├── toolbar/                # Toolbar operations
│   │   ├── save.ts
│   │   ├── load.ts
│   │   ├── search.ts
│   │   └── theme.ts
│   ├── layout.ts               # Dagre layout
│   ├── typeGuards.ts           # Runtime type validation
│   ├── deepEquals.ts           # Deep equality check
│   ├── debounce.ts             # Debounce utility
│   └── uuid.ts                 # UUID generation
├── types/               # TypeScript Types
│   ├── schemas.ts              # Data schemas
│   └── gradio.ts               # Gradio integration types
├── styles/
│   └── theme.css               # CSS variables and themes
├── constants.ts         # Configuration constants
└── GraphUI.svelte      # Main entry component
```

## Data Structures

### GraphValue

```typescript
interface GraphValue {
  nodes: CustomNode[]; // Array of nodes
  edges: CustomEdge[]; // Array of edges
  loaded: boolean; // Has graph been loaded
  zoomToNodeName: string | null; // Request zoom to node by name
}
```

### CustomNode

```typescript
interface CustomNode {
  id: string;
  position: { x: number; y: number };
  type: "custom";
  data: {
    name: string; // Display name
    description: string; // Description text
    attributes: Attribute[]; // Input/output attributes
    handles: Handle[]; // Connection handles
    collapsed?: boolean; // Collapsed state
  };
}
```

### Attribute

```typescript
interface Attribute {
  key: string; // Unique key within node
  value: string; // Display value
  visible: boolean; // Show in UI
  connectable: boolean; // Can connect edges
  type: "input" | "output"; // Handle type
}
```

### CustomEdge

```typescript
interface CustomEdge {
  id: string;
  source: string; // Source node ID
  target: string; // Target node ID
  sourceHandle?: string; // Source attribute key
  targetHandle?: string; // Target attribute key
  label?: string; // Edge label
  type: "custom";
}
```

## State Management

### Store Architecture

Each GraphUI instance creates its own isolated store:

```typescript
const stores = createGraphStores();
setContext(storeKey, stores);
```

**Store Contents:**

- `customNodes` - Node array
- `customEdges` - Edge array
- `viewport` - Camera position/zoom
- `flowInstance` - SvelteFlow instance ref
- `editingNode/editingEdge` - Currently editing
- `searchQuery` - Current search text
- `clickedNodes/clickedEdges` - Click highlights
- `searchedNodes` - Search results
- `layoutDirection` - "TB" or "LR"
- `zoomToNodeName` - Zoom request
- `dialog` - Current dialog state

### Global Stores

- `activeStoreId` - Tracks which instance has focus
- `theme` - Global light/dark theme
