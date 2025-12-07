# Graph Editor Module

A complete graph editing component built with Svelte 4 and @xyflow/svelte.

## Architecture Overview

### Core Components

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

## Public API

### GraphUI Component

Main entry point for the graph editor.

**Props:**

- `value: GraphValue` - Graph data (nodes, edges, zoom requests)
- `gradio?: GradioLike` - Optional Gradio integration
- `interactive: boolean = true` - Enable/disable editing
- `toolbar_size: "extra-small" | "small" | "medium" | "large" = "small"`
- `toolbar_enable_save_load: boolean = false` - Show save/load buttons
- `toolbar_enable_add: boolean = false` - Show add node button
- `canvas_min_height: string = "500px"` - Minimum canvas height

**Events:**

- `on:change` - Fired when graph changes (nodes/edges modified)
- `on:zoomComplete` - Fired when zoom animation completes

**Example:**

```svelte
<script>
  let graphValue = {
    nodes: [],
    edges: [],
    loaded: false,
    zoomToNodeName: null
  };

  function handleChange(event) {
    graphValue = event.detail;
  }

  function handleZoomComplete() {
    graphValue = { ...graphValue, zoomToNodeName: null };
  }
</script>

<GraphUI
  bind:value={graphValue}
  interactive={true}
  toolbar_enable_save_load={true}
  toolbar_enable_add={true}
  on:change={handleChange}
  on:zoomComplete={handleZoomComplete}
/>
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

## Features

### Graph Operations

- **Add Nodes**: Create new nodes at viewport center
- **Edit Nodes**: Double-click to edit name, description, attributes
- **Delete Nodes**: Select and press Delete/Backspace
- **Connect Nodes**: Drag from output handle to input handle
- **Edit Edges**: Double-click edge to edit label
- **Delete Edges**: Select and press Delete/Backspace
- **Collapse Nodes**: Click chevron button to collapse/expand

### Layout

- **Auto Layout**: Dagre hierarchical layout (vertical/horizontal)
- **Manual Positioning**: Drag nodes to desired positions
- **Zoom to Node**: Programmatically zoom to specific node

### UI Features

- **Search**: Real-time node name search with highlighting
- **Themes**: Light/dark mode toggle
- **Save/Load**: Export/import graph as JSON
- **Keyboard Shortcuts**: Escape to clear selections
- **Multi-selection**: Select multiple nodes/edges
- **Neighbor Highlighting**: Click node to highlight connections

### Validation

- **Unique Node Names**: Prevents duplicate node names
- **Unique Attribute Keys**: Per-node unique attribute keys
- **Connection Validation**: Output → Input only
- **Empty Name Prevention**: Node names and attribute keys required

## Configuration

### constants.ts

All magic numbers and feature flags are centralized:

```typescript
// Timing
DOUBLE_CLICK_DELAY = 250ms
SEARCH_DEBOUNCE_DELAY = 300ms
ZOOM_ANIMATION_DURATION = 800ms

// Layout
NODE_WIDTH = 180px
NODE_HEIGHT = 100px
RANK_SEPARATION = 200px
NODE_SEPARATION = 100px

// Features
ALLOW_SELF_LOOPS = false        // Enable node → itself edges
AUTO_LAYOUT_ON_COLLAPSE = true  // Re-layout when collapsing nodes
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

## Keyboard Shortcuts

- `Escape` - Clear all selections and search
- `Delete` / `Backspace` - Delete selected nodes/edges
- `Double Click Node` - Edit node
- `Double Click Edge` - Edit edge
- `Click Node` - Highlight neighbors

## Accessibility

### ARIA Support

- All interactive elements have `aria-label`
- Toolbar has `role="toolbar"`
- Nodes have `role="article"`
- Handle wrappers have `role="button"`

### Keyboard Navigation

- All controls are keyboard accessible
- Focus visible outlines on all interactive elements
- Tab order follows logical flow

### Motion

- Respects `prefers-reduced-motion`
- All animations disabled when motion reduced

## Browser Compatibility

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Required Features**:
  - `crypto.randomUUID()` for UUIDs
  - CSS Grid for layouts
  - CSS Custom Properties for themes
  - ES2020 features (optional chaining, nullish coalescing)

## Performance

### Optimizations

- **Sets for Lookups**: O(1) highlight checks instead of O(n) array includes
- **Derived Stores**: Compute highlights once per update
- **Deep Equality**: Prevent unnecessary reactive updates
- **Immutable Updates**: All store updates create new objects
- **Debounced Search**: Reduces search overhead

### Scalability

- Tested with 100+ nodes
- For 1000+ nodes, consider enabling virtualization
- Large graphs benefit from manual positioning over auto-layout

## Error Handling

### Validation Errors

- Shown in modal dialogs
- User-friendly messages
- Non-blocking (user can retry)

### Runtime Errors

- Type guards prevent invalid data
- Console warnings for invalid operations
- Graceful degradation on failure

### File Operations

- JSON parse errors caught and shown
- Structure validation before loading
- File read errors reported to user

## Testing Recommendations

### Unit Tests

- Type guards (typeGuards.ts)
- Deep equality (deepEquals.ts)
- Debounce utility
- UUID generation

### Integration Tests

- Node CRUD operations
- Edge CRUD operations
- Layout calculations
- Save/load workflow

### E2E Tests

- Create graph workflow
- Edit node workflow
- Connect nodes workflow
- Search and highlight
- Theme toggle

## Common Issues

### Issue: Multiple instances conflict

**Solution**: Each instance has unique `instanceId`. Use `activeStoreId` to track focus.

### Issue: Zoom not working

**Solution**: Ensure `flowInstance` is set and `fitView` is called after mount.

### Issue: Handles not connecting

**Solution**: Check `isConnectable` on attributes and validate output→input direction.

### Issue: Layout doesn't update

**Solution**: Ensure `handleLayout` is called after node changes. Check `AUTO_LAYOUT_ON_COLLAPSE` flag.

### Issue: Theme not persisting

**Solution**: Theme store is volatile. Add localStorage sync if needed.

## Contributing

### Code Style

- Use TypeScript for type safety
- Follow existing naming conventions
- Add JSDoc comments to public functions
- Extract magic numbers to constants.ts
- Use type guards instead of assertions

### Adding Features

1. Add feature flag to constants.ts if configurable
2. Implement in appropriate util file
3. Add type definitions to types/
4. Update README with usage
5. Add tests
