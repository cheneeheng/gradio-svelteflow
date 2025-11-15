<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { CustomNode, Attribute } from "../types/schemas";

  export let node: CustomNode;

  let name = node.data.name;
  let description = node.data.description;
  let attributes = JSON.parse(JSON.stringify(node.data.attributes));

  const dispatch = createEventDispatcher();

  function addAttribute() {
    attributes = [
      ...attributes,
      { key: "", value: "", visible: true, connectable: false, type: "input" },
    ];
  }

  function removeAttribute(index: number) {
    attributes = attributes.filter((_, i) => i !== index);
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
        <input id="node-description" bind:value={description} />
      </div>
    </div>

    <div class="form-section">
      <h4>Attributes</h4>
      <div class="attributes-list">
        {#each attributes as attr, i}
          <div class="attribute-item">
            <input class="key" bind:value={attr.key} placeholder="Key" />
            <input class="value" bind:value={attr.value} placeholder="Value" />
            <select bind:value={attr.type}>
              <option value="input">Input</option>
              <option value="output">Output</option>
            </select>
            <label class="checkbox-label">
              <input type="checkbox" bind:checked={attr.visible} />
              Visible
            </label>
            <label class="checkbox-label">
              <input type="checkbox" bind:checked={attr.connectable} />
              Connect
            </label>
            <button class="remove-btn" on:click={() => removeAttribute(i)}>
              &times;
            </button>
          </div>
        {/each}
      </div>
      <button class="add-attribute-btn" on:click={addAttribute}> + </button>
    </div>

    <div class="button-group">
      <button class="secondary" on:click={cancel}>Cancel</button>
      <button class="primary" on:click={save}>Save</button>
    </div>
  </div>
</div>

<style>
  .popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
  }
  .popup {
    background: var(--popup-background);
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    width: 90%;
    max-width: 700px;
    border: 1px solid var(--popup-border);
    max-height: 90vh;
    display: flex;
    flex-direction: column;
  }
  h3 {
    margin-top: 0;
    margin-bottom: 1.5rem;
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-color);
    border-bottom: 1px solid var(--popup-border);
    padding-bottom: 1rem;
  }
  .form-section {
    margin-bottom: 1.5rem;
  }
  .form-group {
    margin-bottom: 1rem;
  }
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--text-color);
  }
  input,
  select {
    width: 100%;
    padding: 0.75rem 1rem;
    border-radius: 6px;
    border: 1px solid var(--input-border);
    background: var(--input-background);
    color: var(--input-text);
    box-sizing: border-box;
    font-size: 1rem;
    transition:
      border-color 0.2s,
      box-shadow 0.2s;
  }
  input:focus,
  select:focus {
    outline: none;
    border-color: var(--accent-color, #007bff);
    box-shadow: 0 0 0 2px var(--accent-color-light, rgba(0, 123, 255, 0.25));
  }
  .attributes-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow-y: auto;
    max-height: 40vh;
    padding: 0.5rem;
    margin: -0.5rem;
  }
  .attribute-item {
    display: grid;
    grid-template-columns: 1fr 1fr auto auto auto auto;
    gap: 0.75rem;
    align-items: center;
  }
  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    white-space: nowrap;
    cursor: pointer;
  }
  .remove-btn {
    background: none;
    border: none;
    color: var(--text-color);
    opacity: 0.6;
    font-size: 1.75rem;
    cursor: pointer;
    padding: 0 0.5rem;
    transition: opacity 0.2s;
  }
  .remove-btn:hover {
    opacity: 1;
    color: #ff4d4d;
  }
  .add-attribute-btn {
    margin-top: 1rem;
    background: var(--button-secondary-background, var(--input-background));
    border: 1px dashed var(--button-border);
    color: var(--button-secondary-text, var(--text-color));
    padding: 0.75rem;
    width: 100%;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition:
      background-color 0.2s,
      border-color 0.2s;
  }
  .add-attribute-btn:hover {
    background: var(--button-secondary-hover-background, var(--background));
    border-color: var(--accent-color, #007bff);
  }
  .button-group {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: auto;
    padding-top: 1.5rem;
    border-top: 1px solid var(--popup-border);
  }
  button {
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    font-weight: 700;
    font-size: 1rem;
    transition:
      background-color 0.2s,
      transform 0.1s;
  }
  button:active {
    transform: translateY(1px);
  }
  .primary {
    background: var(--accent-color, #007bff);
    color: white;
  }
  .primary:hover {
    background: var(--accent-color-dark, #0056b3);
  }
  .secondary {
    background: var(--button-secondary-background, var(--button-background));
    color: var(--button-secondary-text, var(--button-text));
    border: 1px solid var(--button-border);
  }
  .secondary:hover {
    background: var(
      --button-secondary-hover-background,
      var(--button-hover-background)
    );
  }
</style>
