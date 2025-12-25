<script>
  const examples = [
    { path: '#/minimal', label: '01 - Minimal' },
    { path: '#/controlled-state', label: '02 - Controlled state' },
    { path: '#/toolbar-features', label: '03 - Toolbar features' },
    { path: '#/zoom-to-node', label: '04 - Zoom to node' },
    // { path: '#/read-only', label: '05 - Read‑only' },
    { path: '#/grid-virtualization', label: '06 - Grid & virtualization' },
    { path: '#/layout-engines', label: '07 - Layout engines' },
    // { path: '#/styling-theme', label: '08 - Styling & theme' },
    { path: '#/editing-popups', label: '09 - Editing popups' },
    { path: '#/multiple-instances', label: '11 - Multiple instances' },
    { path: '#/large-graph', label: '12 - Large graph' },
    { path: '#/programmatic-creation', label: '13 - Programmatic creation' },
    { path: '#/toolbar-visibility', label: '14 - Toolbar visibility' },
    { path: '#/canvas-layout', label: '15 - Canvas layout' }
  ];
</script>

<section class="page">
  <h2>GraphUI Example Gallery</h2>
  <p>Select an example from the sidebar or from the list below.</p>

  <ul class="example-list">
    {#each examples as example}
      <li>
        <a href={example.path}>{example.label}</a>
      </li>
    {/each}
  </ul>
</section>

<style>
  .page {
    padding: 1rem;
    box-sizing: border-box;
  }

  .example-list {
    list-style: none;
    padding: 0;
    margin-top: 1rem;
  }

  .example-list li {
    margin-bottom: 0.25rem;
  }

  .example-list a {
    color: #007bff;
    text-decoration: none;
  }

  .example-list a:hover {
    text-decoration: underline;
  }
</style>