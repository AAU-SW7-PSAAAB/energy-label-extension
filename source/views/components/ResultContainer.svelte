<script lang="ts">
	import type { Snippet } from 'svelte';
  let { header = $bindable(), children }: { header: string | null, children: Snippet } = $props();
</script>

{#if (header !== null)}
<h3 class="container-header">{header}</h3>
{/if}
<div class="container">
  {@render children()}
</div>

<style>
  .container-header {
    margin-bottom: 4px;
    margin-left: 10px;
  }
  .container {
  background-color: rgb(239, 239, 239);

  padding: 10px;
  margin-top: none;
  margin-bottom: 10px;
  border-radius: 10px;
}
</style>
