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
| **03‑toolbar‑features**        | Shows how to adjust toolbar size and toggle button visibility.       |
| **04‑zoom‑to‑node**            | Programmatically zoom to a node and handle `zoomComplete`.           |
| **05‑grid‑and‑virtualization** | Demonstrates grid snapping, grid size, and virtualization.           |
| **06‑layout‑engines**          | Switch between `dagre` and `elkjs` layout engines.                   |
| **07‑editing‑popups**          | Shows node/edge editing popups and save/cancel flows.                |
| **08‑multiple‑instances**      | Render multiple independent graph instances on the same page.        |
| **09‑large‑graph**             | Recommended settings and behavior for large graphs.                  |
| **10‑programmatic‑creation**   | Add nodes/edges programmatically from outside the component.         |

> Example **Gradio integration** is intentionally omitted.

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

Shows how to customize the toolbar.  
Covers:

- `toolbar_size`
- `toolbar_visibility` (fine-grained control over buttons)

---

### **04 — Zoom to Node**

Programmatically zoom to a specific node by name.  
Covers:

- `value.zoomToNodeName`
- resetting zoom requests
- `on:zoomComplete`

---

### **05 — Grid Snapping & Virtualization**

Performance and layout helpers.  
Covers:

- `enable_grid_snap`
- `grid_size`
- `enable_virtualization`

---

### **06 — Layout Engines**

Switch between DAGRE and ELK.  
Covers:

- `layout_engine="dagre"`
- `layout_engine="elkjs"`

---

### **07 — Editing Popups**

Demonstrates the built‑in node and edge editing popups.  
Covers:

- editing nodes
- editing edges
- save/cancel flows
- metadata in `on:change` events

---

### **08 — Multiple Instances**

Render multiple graphs on the same page without interference.  
Covers:

- independent state
- independent event handling

---

### **09 — Large Graph Example**

Recommended settings for large graphs.  
Covers:

- virtualization
- layout engine performance
- initial zoom/fit strategies

---

### **10 — Programmatic Node/Edge Creation**

Add or modify graph elements from outside the component.  
Covers:

- pushing new nodes/edges into `value`
- reacting to external changes

---

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