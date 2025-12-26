# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.7] - 2025-12-26

### Added
- **SvelteFlow Component (Backend):** Expanded API with new parameters: `enable_virtualization`, `enable_grid_snap`, `grid_size`, `layout_engine`, `toolbar_visibility`, `node_size_scale`, `node_font_size`, `edge_width`, and `edge_label_font_size`.
- **Virtualization:** Added direct subscription to viewport changes to trigger visibility updates on pan/zoom events.
- **Edge Visibility:** Edges now render if either connected node is visible or if the edge is selected.

### Fixed
- **Virtualization Stability:** Nodes being dragged or resized are now forced to remain visible, preventing them from unmounting and breaking interactions.
- **Position Sync:** Explicitly sync node positions on drag stop to ensure spatial index accuracy.
- **Accessibility:** Added `.sr-only` CSS utility for better screen reader support in the toolbar.
- **Node Handles:** Fixed schema and rendering for specific attribute handles.

### Changed
- **Defaults:** Updated default `toolbar_size` from "medium" to "small".
- **Refactor:** Deduplicated Graph component in `svelteflow-app` by using a shared version from `svelteflow/frontend` via Vite alias.
- **Demo Application:** Consolidated toolbar features and visibility controls into a single example.

## [0.0.6] - 2025-12-11

### Added
- **State Management:** Centralized state management for zooming and UI interactions using Svelte stores.
- **Accessibility:** Enhanced accessibility by adding proper labels to form elements in the toolbar.

### Fixed
- **Search:** Proper cancellation of pending debounced search operations on component unmount.
- **Robustness:** Improved error handling for file-saving and `fitView` zooming.

### Changed
- **Refactor:** Decoupled `svelteflow` frontend from direct Gradio dependencies using local type definitions.
- **Sync:** Synchronized the `graph` folder between `svelteflow-app` and `svelteflow`.

## [0.0.5] - 2025-11-30

### Added
- **Zoom-to-Node:** Programmatic zooming to specific nodes by name.
- **Gradio Integration:** Wrapper functions for graph interaction handlers to ensure `change` events are dispatched to the backend.

### Changed
- **Refactor:** Moved zoom logic to `Graph.svelte` for better component structure.
- **Context:** correctly placed `SvelteFlowProvider` to wrap the `Graph` component.

## [0.0.4] - 2025-11-27

### Added
- **Multi-Instance Support:** System to track the active graph instance, ensuring events are scoped correctly.
- **Dialogs:** Custom `Dialogs.svelte` component replacing native browser `confirm` and `alert`.
- **File System API:** Used `window.showSaveFilePicker` for improved graph saving.

### Fixed
- **SVG Conflict:** Unique SVG marker IDs per graph instance to prevent rendering conflicts between multiple graphs.

### Changed
- **State Management:** Isolated per-instance stores instead of global singletons.

## [0.0.3] - 2025-11-23

### Added
- **Configurable Toolbar:** Gradio component now accepts `toolbar_size`, `toolbar_enable_save_load`, and `toolbar_enable_add`.
- **Zoom Constraints:** Added `minZoom` and `maxZoom` props.

### Changed
- **Architecture:** Broken down monolithic `GraphUI.svelte` into smaller, focused components.
- **State:** Centralized state management using Svelte stores (`graphStore`, `themeStore`, `highlightStore`).

## [0.0.2] - 2025-11-19

### Added
- **Gradio Events:** Dispatch `change`, `select`, and `submit` events.
- **Popups:** New editing popups for nodes and edges.
- **Theming:** Support for light and dark themes.

### Changed
- **Layout:** Reorganized graph components into a dedicated directory.

## [0.0.1] - 2025-11-18

### Added
- **Core Features:** Initial implementation of the full web UI for graph editing.
- **Collapsible Nodes:** Support for expanding and collapsing nodes with handle rerouting.
- **Layouting:** Integrated `dagre` for automatic graph layout.
- **Styling:** Polished UI with multiline descriptions, better arrow markers, and tooltips.
