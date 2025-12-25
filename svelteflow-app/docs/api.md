# Public API

## GraphUI Component

Main entry point for the graph editor.

**Props:**

- `value: GraphValue` - Graph data (nodes, edges, zoom requests)
- `gradio?: GradioLike` - Optional Gradio integration
- `interactive: boolean = true` - Enable/disable editing
- `toolbar_size: "extra-small" | "small" | "medium" | "large" = "small"`
- `toolbar_visibility: ToolbarVisibility` - Visibility settings for toolbar buttons
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
  on:change={handleChange}
  on:zoomComplete={handleZoomComplete}
/>
```

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
