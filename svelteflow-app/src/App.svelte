<script lang="ts">
  import Home from "./routes/Home.svelte";
  import Minimal from "./routes/Minimal.svelte";
  import ControlledState from "./routes/ControlledState.svelte";
  import ToolbarFeatures from "./routes/ToolbarFeatures.svelte";
  import ZoomToNode from "./routes/ZoomToNode.svelte";
  // import ReadOnly from "./routes/ReadOnly.svelte";
  import GridVirtualization from "./routes/GridVirtualization.svelte";
  import LayoutEngines from "./routes/LayoutEngines.svelte";
  // import StylingTheme from "./routes/StylingTheme.svelte";
  import EditingPopups from "./routes/EditingPopups.svelte";
  import MultipleInstances from "./routes/MultipleInstances.svelte";
  import LargeGraph from "./routes/LargeGraph.svelte";
  import ProgrammaticCreation from "./routes/ProgrammaticCreation.svelte";
  import ToolbarVisibility from "./routes/ToolbarVisibility.svelte";
  import CanvasLayout from "./routes/CanvasLayout.svelte";

  const routes = {
    "": Home,
    "/": Home,
    "/minimal": Minimal,
    "/controlled-state": ControlledState,
    "/toolbar-features": ToolbarFeatures,
    "/zoom-to-node": ZoomToNode,
    // "/read-only": ReadOnly,
    "/grid-virtualization": GridVirtualization,
    "/layout-engines": LayoutEngines,
    // "/styling-theme": StylingTheme,
    "/editing-popups": EditingPopups,
    "/multiple-instances": MultipleInstances,
    "/large-graph": LargeGraph,
    "/programmatic-creation": ProgrammaticCreation,
    "/toolbar-visibility": ToolbarVisibility,
    "/canvas-layout": CanvasLayout,
  } as const;

  type RouteKey = keyof typeof routes;

  let currentPath = getCurrentPath();

  function getCurrentPath() {
    const hash = window.location.hash || "#/";
    const path = hash.slice(1); // remove leading '#'
    return path || "/";
  }

  function handleHashChange() {
    currentPath = getCurrentPath();
  }

  function resolveRoute(path: string) {
    if ((routes as Record<string, unknown>)[path]) {
      return routes[path as RouteKey];
    }
    return Home;
  }

  $: CurrentRoute = resolveRoute(currentPath);

  if (typeof window !== "undefined") {
    window.addEventListener("hashchange", handleHashChange);
  }
</script>

<div class="app">
  <aside class="sidebar">
    <h1 class="logo">GraphUI Examples</h1>
    <nav>
      <a href="#/" class:selected={currentPath === "/" || currentPath === ""}
        >Home</a
      >
      <a href="#/minimal" class:selected={currentPath === "/minimal"}
        >01 - Minimal</a
      >
      <a
        href="#/controlled-state"
        class:selected={currentPath === "/controlled-state"}
        >02 - Controlled state</a
      >
      <a
        href="#/toolbar-features"
        class:selected={currentPath === "/toolbar-features"}
        >03 - Toolbar features</a
      >
      <a href="#/zoom-to-node" class:selected={currentPath === "/zoom-to-node"}
        >04 - Zoom to node</a
      >
      <a href="#/read-only" class:selected={currentPath === "/read-only"}
        >05 - Read‑only</a
      >
      <a
        href="#/grid-virtualization"
        class:selected={currentPath === "/grid-virtualization"}
        >06 - Grid & virtualization</a
      >
      <a
        href="#/layout-engines"
        class:selected={currentPath === "/layout-engines"}
        >07 - Layout engines</a
      >
      <a
        href="#/styling-theme"
        class:selected={currentPath === "/styling-theme"}
        >08 - Styling & theme</a
      >
      <a
        href="#/editing-popups"
        class:selected={currentPath === "/editing-popups"}
        >09 - Editing popups</a
      >
      <a
        href="#/multiple-instances"
        class:selected={currentPath === "/multiple-instances"}
        >11 - Multiple instances</a
      >
      <a href="#/large-graph" class:selected={currentPath === "/large-graph"}
        >12 - Large graph</a
      >
      <a
        href="#/programmatic-creation"
        class:selected={currentPath === "/programmatic-creation"}
        >13 - Programmatic creation</a
      >
      <a
        href="#/toolbar-visibility"
        class:selected={currentPath === "/toolbar-visibility"}
        >14 - Toolbar visibility</a
      >
      <a
        href="#/canvas-layout"
        class:selected={currentPath === "/canvas-layout"}>15 - Canvas layout</a
      >
    </nav>
  </aside>

  <main class="content">
    <CurrentRoute />
  </main>
</div>

<style>
  .app {
    display: flex;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    font-family:
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
  }

  .sidebar {
    width: 260px;
    padding: 1rem;
    border-right: 1px solid #ddd;
    background: #fafafa;
    overflow-y: auto;
    box-sizing: border-box;
  }

  .logo {
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }

  nav {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  nav a {
    text-decoration: none;
    color: #333;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.9rem;
  }

  nav a.selected {
    background: #007bff;
    color: white;
  }

  .content {
    flex: 1;
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
</style>
