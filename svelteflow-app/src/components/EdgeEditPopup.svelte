<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { CustomEdge } from "../types/schemas";

  export let edge: CustomEdge;

  let label = edge.label || "";

  const dispatch = createEventDispatcher();

  function save() {
    const updatedEdge: CustomEdge = {
      ...edge,
      label,
    };
    dispatch("save", updatedEdge);
  }

  function cancel() {
    dispatch("cancel");
  }
</script>

<div class="popup-overlay" on:click={cancel}>
  <div class="popup" on:click|stopPropagation>
    <h3>Edit Edge</h3>
    <div class="form-group">
      <label for="edge-label">Label:</label>
      <input id="edge-label" bind:value={label} />
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
    max-width: 400px;
    border: 1px solid var(--popup-border);
  }
  h3 {
    margin-top: 0;
    margin-bottom: 16px;
    font-size: 1.25rem;
    color: var(--text-color);
  }
  .form-group {
    margin-bottom: 16px;
  }
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
  }
  input {
    width: 100%;
    padding: 8px 12px;
    border-radius: 4px;
    border: 1px solid var(--input-border);
    background: var(--input-background);
    color: var(--input-text);
    box-sizing: border-box;
  }
  .button-group {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
  }
  button {
    padding: 8px 16px;
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
