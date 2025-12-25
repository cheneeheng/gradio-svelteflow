# Features

## Graph Operations

- **Add Nodes**: Create new nodes at viewport center
- **Edit Nodes**: Double-click to edit name, description, attributes
- **Delete Nodes**: Select and press Delete/Backspace
- **Connect Nodes**: Drag from output handle to input handle
- **Edit Edges**: Double-click edge to edit label
- **Delete Edges**: Select and press Delete/Backspace
- **Collapse Nodes**: Click chevron button to collapse/expand

## Layout

- **Auto Layout**: Dagre hierarchical layout (vertical/horizontal)
- **Manual Positioning**: Drag nodes to desired positions
- **Zoom to Node**: Programmatically zoom to specific node

## UI Features

- **Search**: Real-time node name search with highlighting
- **Themes**: Light/dark mode toggle
- **Save/Load**: Export/import graph as JSON
- **Keyboard Shortcuts**: Escape to clear selections
- **Multi-selection**: Select multiple nodes/edges
- **Neighbor Highlighting**: Click node to highlight connections

## Validation

- **Unique Node Names**: Prevents duplicate node names
- **Unique Attribute Keys**: Per-node unique attribute keys
- **Connection Validation**: Output → Input only
- **Empty Name Prevention**: Node names and attribute keys required

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
