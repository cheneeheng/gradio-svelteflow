# Example Usages for `GraphUI`

This directory contains a collection of focused, self‑contained examples demonstrating how to use the `GraphUI` component in different scenarios. Each example highlights a specific feature set so developers can quickly understand how to integrate, configure, and extend the graph editor.

The examples are intentionally minimal, copy‑paste‑ready, and written in idiomatic Svelte + TypeScript.

> **Note:** These examples cover all major features of the component **except Gradio integration**, which is documented separately.

---

## 📚 Overview of Examples

| Example                        | Description                                                          |
| ------------------------------ | -------------------------------------------------------------------- |
| **01‑minimal**                 | The simplest possible usage of `GraphUI` with default props.         |
| **02‑controlled‑state**        | Demonstrates two‑way binding and external state control.             |
| **03‑toolbar‑features**        | Shows how to enable/disable toolbar buttons and adjust toolbar size. |
| **04‑zoom‑to‑node**            | Programmatically zoom to a node and handle `zoomComplete`.           |
<!-- | **05‑read‑only‑mode**          | Use the graph in non‑interactive mode (view‑only).                   | -->
| **06‑grid‑and‑virtualization** | Demonstrates grid snapping, grid size, and virtualization.           |
| **07‑layout‑engines**          | Switch between `dagre` and `elkjs` layout engines.                   |
<!-- | **08‑styling‑and‑theme**       | Adjust node/edge sizes, fonts, and theme behavior.                   | -->
| **09‑editing‑popups**          | Shows node/edge editing popups and save/cancel flows.                |
| **11‑multiple‑instances**      | Render multiple independent graph instances on the same page.        |
| **12‑large‑graph**             | Recommended settings and behavior for large graphs.                  |
| **13‑programmatic‑creation**   | Add nodes/edges programmatically from outside the component.         |
| **14‑toolbar‑visibility**      | Fine‑grained control over which toolbar buttons are visible.         |
<!-- | **15‑canvas‑layout**           | Embed the graph in flexible layouts and control canvas height.       | -->

> Example **10** (Gradio integration) is intentionally omitted.

---

## 🧩 Example Details

### **01 — Minimal Example**

A “hello world” graph with default settings.  
Covers:

- basic rendering
- `bind:value`
- `on:change`

---

### **02 — Controlled State**

Demonstrates how to treat `GraphUI` as a controlled component.  
Covers:

- external updates to `value.nodes` and `value.edges`
- receiving updates from the graph
- syncing state between multiple components

---

### **03 — Toolbar Features**

Shows how to enable or disable toolbar features.  
Covers:

- `toolbar_enable_save_load`
- `toolbar_enable_add`
- `toolbar_size`
- `toolbar_visibility`

---

### **04 — Zoom to Node**

Programmatically zoom to a specific node by name.  
Covers:

- `value.zoomToNodeName`
- resetting zoom requests
- `on:zoomComplete`

---

<!-- ### **05 — Read‑Only Mode**

Use the graph as a viewer without editing capabilities.  
Covers:

- `interactive={false}`
- disabled editing popups
- disabled drag/resize

--- -->

### **06 — Grid Snapping & Virtualization**

Performance and layout helpers.  
Covers:

- `enable_grid_snap`
- `grid_size`
- `enable_virtualization`

---

### **07 — Layout Engines**

Switch between DAGRE and ELK.  
Covers:

- `layout_engine="dagre"`
- `layout_engine="elkjs"`

---

<!-- ### **08 — Styling & Theme**

Customize the visual appearance of nodes and edges.  
Covers:

- `node_size_scale`
- `node_font_size`
- `edge_width`
- `edge_label_font_size`
- dark/light theme behavior

--- -->

### **09 — Editing Popups**

Demonstrates the built‑in node and edge editing popups.  
Covers:

- editing nodes
- editing edges
- save/cancel flows
- metadata in `on:change` events

---

### **11 — Multiple Instances**

Render multiple graphs on the same page without interference.  
Covers:

- independent state
- independent event handling

---

### **12 — Large Graph Example**

Recommended settings for large graphs.  
Covers:

- virtualization
- layout engine performance
- initial zoom/fit strategies

---

### **13 — Programmatic Node/Edge Creation**

Add or modify graph elements from outside the component.  
Covers:

- pushing new nodes/edges into `value`
- reacting to external changes

---

### **14 — Toolbar Visibility**

Fine‑grained control over which toolbar buttons appear.  
Covers:

- `toolbar_visibility={{ add: false, save: true, ... }}`

---

<!-- ### **15 — Canvas Layout**

Embed the graph in flexible layouts.  
Covers:

- `canvas_min_height`
- responsive containers
- fullscreen behavior

--- -->

## 🧪 How to Run the Examples

Each example is a standalone Svelte component.  
You can run them by:

```bash
npm install
npm run dev
```

Then open the example you want to test.

---

## 📝 Contributing New Examples

If you want to add a new example:

- keep it small and focused
- include a short description at the top
- avoid unnecessary styling

- prefer idiomatic Svelte patterns
- ensure it demonstrates a single concept clearly
