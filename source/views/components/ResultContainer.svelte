<script lang="ts">
	import type { Result } from "../../lib/communication";
	import CheckContainer from "./CheckContainer.svelte";
	let {
		result = $bindable(),
	}: {
		result: Result;
	} = $props();
</script>

<h3 class="container-header">
	{result.name}{#if !result.errorMessage}
		{" - "}{result.pluginResult.score}{/if}
</h3>
<p>{result.pluginResult.description}</p>
<div class="container">
	{#if result.errorMessage}
		<p>{result.errorMessage}</p>
	{:else}
		{#each result.pluginResult.checks as check (check.name)}
			<CheckContainer {check}></CheckContainer>
		{/each}
	{/if}
</div>

<style>
	.container-header {
		margin-bottom: 4px;
		margin-left: 10px;
	}
	.container {
		padding: 10px;
		margin-top: none;
		margin-bottom: 10px;
		border-radius: 10px;
	}
</style>
