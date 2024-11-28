<script lang="ts">
	import type { PluginCheck } from "../../lib/pluginTypes";
	import TableView from "./TableView.svelte";
	let {
		check = $bindable(),
	}: {
		check: PluginCheck;
	} = $props();
</script>

<details class={check.type} data-check-name={check.name}>
	<summary>{check.name} - {check.score}</summary>
	<p>{check.description}</p>
	{#if check.susWebLink}
		<p>
			You can read more about this optimization at Sustainable Web Design: <a
				target="_blank"
				href={check.susWebLink}>{check.susWebLink}</a
			>
		</p>
	{/if}
	{#if check.table}
		<TableView rows={check.table}></TableView>
	{/if}
</details>

<style>
</style>
