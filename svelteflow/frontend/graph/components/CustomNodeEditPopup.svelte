<script lang="ts">
  import { Plus, Trash2 } from "lucide-svelte";
  import { createEventDispatcher } from "svelte";
  import type { CustomNode } from "../types/schemas";

  export let node: CustomNode;

  let name = node.data.name;
  let description = node.data.description;
  // let attributes = JSON.parse(JSON.stringify(node.data.attributes));
  let attributes = [...node.data.attributes]; // local copy

  const dispatch = createEventDispatcher();

  function addAttribute() {
    attributes = [
      ...attributes,
      { key: "", value: "", visible: true, connectable: true, type: "input" },
    ];
  }

  function removeAttribute(index: number) {
    attributes = attributes.filter((_: any, i: number) => i !== index);
  }

  function save() {
    const updatedNode: CustomNode = {
      ...node,
      data: {
        ...node.data,
        name,
        description,
        attributes,
      },
    };
    dispatch("save", updatedNode);
  }

  function cancel() {
    dispatch("cancel");
  }
</script>

<div class="popup-overlay" on:click={cancel}>
  <div class="popup" on:click|stopPropagation>
    <h3>Edit Node</h3>

    <div class="form-section">
      <div class="form-group">
        <label for="node-name">Name</label>
        <input id="node-name" bind:value={name} />
      </div>
      <div class="form-group">
        <label for="node-description">Description</label>
        <textarea id="node-description" bind:value={description} rows="3"
        ></textarea>
      </div>
    </div>

    <div class="popup-content-scrollable">
      <div class="attributes-section">
        <div class="section-title">Attributes</div>
        <div class="attributes-grid">
          <!-- Header -->
          <div class="grid-header">Key</div>
          <div class="grid-header">Value</div>
          <div class="grid-header">Type</div>
          <div class="grid-header">Visible</div>
          <div class="grid-header">Connectable</div>
          <div class="grid-header"></div>

          <!-- Attribute Rows -->
          {#each attributes as attr, i}
            <input bind:value={attr.key} placeholder="Key" />
            <input bind:value={attr.value} placeholder="Value" />
            <select bind:value={attr.type}>
              <option value="input">Input</option>
              <option value="output">Output</option>
            </select>
            <select bind:value={attr.visible}>
              <option value={true}>Yes</option>
              <option value={false}>No</option>
            </select>
            <select bind:value={attr.connectable}>
              <option value={true}>Yes</option>
              <option value={false}>No</option>
            </select>
            <button
              class="remove-btn"
              on:click={() => removeAttribute(i)}
              aria-label="Remove Attribute"
            >
              <Trash2 size={16} />
            </button>
          {/each}
        </div>
        <button class="add-attribute-btn" on:click={addAttribute}>
          <Plus size={16} /> Add Attribute
        </button>
      </div>
    </div>

    <div class="button-group">
      <button class="secondary" on:click={cancel}>Cancel</button>
      <button class="primary" on:click={save}>Save Changes</button>
    </div>
  </div>
</div>

<style>
  .popup-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
    /* backdrop-filter: blur(4px); */ /* Removed: cause rendering glitches */
  }

  .popup {
    background: var(--popup-background);
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    width: 100%;
    max-width: 680px;
    border: 1px solid var(--popup-border);
    max-height: 90vh; /* Keeps the popup from exceeding 90% viewport height */
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  h3 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-color);
    text-align: center;
  }

  .popup-content-scrollable {
    flex-grow: 1; /* Allows this section to fill available space */
    overflow-y: auto; /* Enables vertical scrolling when content overflows */
    padding-right: 0.5rem; /* Add some padding for scrollbar */
    display: flex;
    flex-direction: column;
    /* gap: 1.5rem; Spacing between form-section and attributes-section */
  }

  .section-title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-color);
  }

  .form-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow-y: auto; /* Enables vertical scrolling when content overflows */
    padding-right: 0.5rem; /* Add some padding for scrollbar */
    max-height: 50vh; /* Keeps the form-section from exceeding 50% viewport height */
  }

  .attributes-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 0.5rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  label {
    display: block;
    font-weight: 600;
    font-size: 1rem;
    color: var(--text-color);
  }

  input,
  select,
  textarea {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    padding: 0.65rem 0.85rem;
    border-radius: 8px;
    border: 1px solid var(--input-border);
    background: var(--input-background);
    color: var(--input-text);
    font-size: 0.9rem;
    transition:
      border-color 0.2s,
      box-shadow 0.2s;
  }

  textarea {
    resize: vertical;
    font-family: inherit;
    min-height: 80px;
  }

  input:focus,
  select:focus,
  textarea:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 3px var(--accent-color-light);
  }

  .attributes-grid {
    display: grid;
    grid-template-columns: 1fr 1.5fr 0.75fr 0.75fr 0.75fr auto;
    gap: 0.75rem;
    align-items: center;
  }

  .grid-header {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-color);
    opacity: 0.7;
    padding-bottom: 0.25rem;
  }

  .button-group {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: auto;
  }

  button {
    padding: 0.65rem 1.2rem;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    font-weight: 500;
    font-size: 0.9rem;
    transition:
      background-color 0.2s,
      transform 0.1s;
  }

  button:active {
    transform: translateY(1px);
  }

  .primary {
    background: var(--accent-color);
    color: #fff;
  }

  .primary:hover {
    background: var(--accent-color-dark);
  }

  .secondary {
    background: var(--button-secondary-background);
    color: var(--button-secondary-text);
    border: 1px solid var(--button-border);
  }

  .secondary:hover {
    background: var(--button-secondary-hover-background);
  }

  .remove-btn {
    background: transparent;
    border: 1px solid transparent;
    color: var(--text-color-secondary);
    cursor: pointer;
    padding: 0.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    transition: all 0.2s;
  }

  .remove-btn:hover {
    color: var(--danger-color);
    background-color: var(--danger-color-light);
  }

  .add-attribute-btn {
    background: var(--button-secondary-background);
    border: 1px solid var(--button-border);
    color: var(--button-secondary-text);
    padding: 0.65rem;
    width: 100%;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.2s;
  }

  .add-attribute-btn:hover {
    border-color: var(--accent-color);
    color: var(--accent-color);
    background: var(--accent-color-light);
  }
</style>
