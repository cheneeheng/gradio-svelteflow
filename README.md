# gradio-svelteflow
Gradio component for svelteflow

IMPORTANT:
- Gradio uses svelte4
- @xyflow/svelte@0.x.x supports svelte4
- @xyflow/svelte@1.x.x uses svelte5

## Frontend Deep Dive: `@svelteflow/frontend`

This directory contains the Svelte-based frontend for the `gradio-svelteflow` component. It leverages `@xyflow/svelte` to render an interactive node-based diagram editor within a Gradio application.

### Core Functionality

The primary purpose of this frontend is to provide a user interface where users can create, manipulate, and connect nodes in a graph. The state of this graph (nodes and edges) is synchronized with the Gradio backend.

### Key Files

*   **`Index.svelte`**: This is the main component file that gets rendered in the Gradio interface.
    *   It initializes a `<SvelteFlow>` component from `@xyflow/svelte`.
    *   It manages the state of `nodes` and `edges` using Svelte stores.
    *   It defines event handlers for user interactions like adding nodes (`handleAddNode`), connecting nodes (`handleConnect`), clicking nodes/edges, and deleting elements.
    *   It communicates with the Gradio backend by dispatching events (`gradio.dispatch`) such as `change`, `select`, and `submit`.
    *   It registers the custom node component `DynamicHandlesNode`.

*   **`DynamicHandlesNode.svelte`**: This is a custom node component designed for the SvelteFlow diagram.
    *   It allows nodes to have a dynamic number of source (output) and target (input) handles.
    *   The number and position of these handles are determined by the `sources` and `targets` arrays in the node's `data` property.
    *   It uses `useUpdateNodeInternals` from `@xyflow/svelte` to ensure the node's dimensions are recalculated when the number of handles changes.

*   **`DynamicNodeData.ts`**: This file defines the TypeScript type `DynamicNodeData` for the `data` property of the custom nodes. It specifies the structure for the node's label and its source/target handle definitions.

*   **`package.json`**: This file lists the project's dependencies. Key dependencies include:
    *   `@xyflow/svelte`: The core library for the flow diagram.
    *   `@gradio/atoms`, `@gradio/icons`, `@gradio/statustracker`, `@gradio/utils`: Components and utilities from the Gradio ecosystem, used for building the UI consistently with other Gradio components.

### Interaction with Gradio

The component is designed to be a custom Gradio component.
1.  **Data In:** The initial state of the nodes and edges is passed from the Gradio backend as the `value` prop. The component watches for changes to this prop and updates the SvelteFlow diagram accordingly.
2.  **Data Out:** When the user modifies the diagram (e.g., adds a node, creates a connection), the component dispatches a `change` event to the Gradio backend with the updated nodes and edges. `select` and `submit` events are also dispatched on the respective user actions. This allows the Python backend to react to user interactions in real-time.