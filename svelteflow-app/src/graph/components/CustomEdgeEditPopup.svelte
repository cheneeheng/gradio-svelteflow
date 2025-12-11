<script lang="ts">
  // ----------
  // Imports
  // ----------
  import { createEventDispatcher } from "svelte";
  import type { CustomEdge } from "../types/schemas";

  // ----------
  // Exports
  // ----------
  export let edge: CustomEdge;

  // ----------
  // Events
  // ----------
  const dispatch = createEventDispatcher();

  // ----------
  // Local vars
  // ----------
  let label = edge.label || "";

  // ----------
  // Local functions
  // ----------
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

  // ----------
  // Reactivity + svelte utils
  // ----------
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
    max-width: 450px;
    border: 1px solid var(--popup-border);
  }
  h3 {
    margin-top: 0;
    margin-bottom: 1.5rem;
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-color);
  }
  .form-group {
    margin-bottom: 1.5rem;
  }
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--text-color);
  }
  input {
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
  input:focus {
    outline: none;
    border-color: var(--accent-color, #007bff);
    box-shadow: 0 0 0 2px var(--accent-color-light, rgba(0, 123, 255, 0.25));
  }
  .button-group {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1.5rem;
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
