<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { CustomNode, Attribute } from "../types/schemas";

  export let node: CustomNode;

  let name = node.data.name;
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
        <label for="node-name">Name:</label>
        <input id="node-name" bind:value={name} />
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
      <button class="add-attribute-btn" on:click={addAttribute}>
        + Add Attribute
      </button>
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
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
  }
  .popup {
    background: var(--popup-background);
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 5px 15px var(--popup-shadow);
    width: 90%;
    max-width: 600px;
    border: 1px solid var(--popup-border);
    max-height: 80vh;
    display: flex;
    flex-direction: column;
  }
  h3 {
    margin-top: 0;
    margin-bottom: 24px;
    font-size: 1.5rem;
    color: var(--text-color);
    border-bottom: 1px solid var(--popup-border);
    padding-bottom: 16px;
  }
  .form-section {
    margin-bottom: 24px;
  }
  .form-group {
    margin-bottom: 16px;
  }
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: var(--text-color);
  }
  input,
  select {
    padding: 8px 12px;
    border-radius: 4px;
    border: 1px solid var(--input-border);
    background: var(--input-background);
    color: var(--input-text);
    box-sizing: border-box;
    font-size: 0.9rem;
  }
  .attributes-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow-y: auto;
    max-height: 30vh;
    padding-right: 8px;
  }
  .attribute-item {
    display: grid;
    grid-template-columns: 1fr 1fr auto auto auto auto;
    gap: 8px;
    align-items: center;
  }
  .attribute-item input.key {
    flex: 2;
  }
  .attribute-item input.value {
    flex: 3;
  }
  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.85rem;
    white-space: nowrap;
  }
  .remove-btn {
    background: none;
    border: none;
    color: #ff4d4d;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0 8px;
  }
  .add-attribute-btn {
    margin-top: 16px;
    background: none;
    border: 1px dashed var(--button-border);
    color: var(--button-text);
    padding: 8px;
    width: 100%;
    border-radius: 4px;
    cursor: pointer;
  }
  .button-group {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: auto;
    padding-top: 24px;
    border-top: 1px solid var(--popup-border);
  }
  button {
    padding: 10px 20px;
    border-radius: 4px;
    border: 1px solid var(--button-border);
    cursor: pointer;
    font-weight: 600;
    transition: background-color 0.2s;
  }
  .primary {
    background: #007bff;
    color: white;
    border-color: #007bff;
  }
  .primary:hover {
    background: #0056b3;
  }
  .secondary {
    background: var(--button-background);
    color: var(--button-text);
  }
  .secondary:hover {
    background: var(--button-hover-background);
  }
</style>
