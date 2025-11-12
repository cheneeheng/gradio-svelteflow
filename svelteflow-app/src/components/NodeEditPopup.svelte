<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { CustomNode, Attribute } from '../types/schemas';

  export let node: CustomNode;

  let name = node.data.name;
  let attributes = [...node.data.attributes];

  const dispatch = createEventDispatcher();

  function addAttribute() {
    attributes = [...attributes, { key: '', value: '', visible: true, connectable: false, type: 'input' }];
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
    dispatch('save', updatedNode);
  }

  function cancel() {
    dispatch('cancel');
  }
</script>

<div class="popup-overlay">
  <div class="popup">
    <h3>Edit Node</h3>
    <label>
      Name:
      <input bind:value={name} />
    </label>
    <h4>Attributes</h4>
    {#each attributes as attr, i}
      <div>
        <input bind:value={attr.key} placeholder="key" />
        <input bind:value={attr.value} placeholder="value" />
        <label>
          <input type="checkbox" bind:checked={attr.visible} />
          Visible
        </label>
        <label>
          <input type="checkbox" bind:checked={attr.connectable} />
          Connectable
        </label>
        <select bind:value={attr.type}>
          <option value="input">Input</option>
          <option value="output">Output</option>
        </select>
        <button on:click={() => removeAttribute(i)}>Remove</button>
      </div>
    {/each}
    <button on:click={addAttribute}>Add Attribute</button>
    <div>
      <button on:click={save}>Save</button>
      <button on:click={cancel}>Cancel</button>
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
    background: white;
    padding: 20px;
    border-radius: 5px;
  }
</style>
