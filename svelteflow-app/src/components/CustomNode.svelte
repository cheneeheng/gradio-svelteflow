<script lang="ts">
  import { Handle, Position } from '@xyflow/svelte';
  import type { CustomNode } from '../types/schemas';

  export let data: CustomNode['data'];
  export let id: string;

  $: ({ name, attributes, handles } = data);
</script>

<div class="custom-node">
  <div class="node-name">{name}</div>
  {#if attributes.length}
    <div class="attributes">
      {#each attributes as attr}
        {#if attr.visible}
          <div class="attribute">
            <span class="key">{attr.key}:</span>
            <span class="value">{attr.value}</span>
          </div>
        {/if}
      {/each}
    </div>
  {/if}
  {#each handles as handle}
    <Handle type={handle.type} position={handle.type === 'input' ? Position.Left : Position.Right} id={handle.id} />
  {/each}
</div>

<style>
  .custom-node {
    background: #f0f0f0;
    border: 1px solid #333;
    border-radius: 5px;
    padding: 10px;
    min-width: 150px;
  }
  .node-name {
    font-weight: bold;
    margin-bottom: 5px;
  }
  .attributes {
    font-size: 0.8em;
  }
  .attribute {
    display: flex;
    justify-content: space-between;
  }
  .key {
    font-weight: bold;
    margin-right: 5px;
  }
</style>
