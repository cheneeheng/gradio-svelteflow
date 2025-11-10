<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { CustomEdge } from '../types/schemas';

  export let edge: CustomEdge;

  let label = edge.label || '';

  const dispatch = createEventDispatcher();

  function save() {
    const updatedEdge: CustomEdge = {
      ...edge,
      label,
    };
    dispatch('save', updatedEdge);
  }

  function cancel() {
    dispatch('cancel');
  }
</script>

<div class="popup-overlay">
  <div class="popup">
    <h3>Edit Edge</h3>
    <label>
      Label:
      <input bind:value={label} />
    </label>
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
