<script lang="ts">
	let {
		rows = $bindable(),
	}: {
		rows: (string | number)[][];
	} = $props();
	const limit = 50;
</script>

{#snippet cellContent(text: string | number)}
	{#if typeof text === "string" && text.length > limit}
		<abbr title={text}>
			{text.slice(0, limit / 2 - 2)}[..]{text.slice(-(limit / 2) + 2)}
		</abbr>
	{:else}
		{text}
	{/if}
{/snippet}

<table>
	<thead>
		{#if rows.length > 0}
			<tr>
				{#each rows[0] as text}
					<th>{@render cellContent(text)}</th>
				{/each}
			</tr>
		{/if}
	</thead>
	<tbody>
		{#each rows.slice(1) as row}
			<tr>
				{#each row as text}
					<td>{@render cellContent(text)}</td>
				{/each}
			</tr>
		{/each}
	</tbody>
</table>

<style>
	th,
	td {
		max-width: 100px;
	}
</style>
