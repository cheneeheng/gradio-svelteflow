<script lang="ts">
  import { getContext } from "svelte";
  import { storeKey } from "./stores/context";
  import type { GraphStores } from "./stores/instanceStore";

  const stores = getContext<GraphStores>(storeKey);
  const { dialog } = stores;
</script>

{#if $dialog}
  <div class="popup-overlay">
    <div class="popup" on:click|stopPropagation>
      <h3>{$dialog.title}</h3>
      <p>{$dialog.message}</p>
      <div class="button-group">
        {#if $dialog.type === "confirm"}
          <button class="secondary" on:click={$dialog.onCancel}>Cancel</button>
          <button class="primary" on:click={$dialog.onConfirm}>Confirm</button>
        {:else if $dialog.type === "alert"}
          <button class="primary" on:click={$dialog.onDismiss}>Dismiss</button>
        {/if}
      </div>
    </div>
  </div>
{/if}

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
    z-index: 200;
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
  p {
    margin-bottom: 1.5rem;
    font-size: 1rem;
    color: var(--text-color);
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
