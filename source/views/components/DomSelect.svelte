<script lang="ts">
	import ListTitle from "./ListTitle.svelte";
	import CssTarget from "./CssTarget.svelte";
	import DeleteButton from "./buttons/DeleteButton.svelte";
	import debug from "../../lib/debug";
	import { CSSTargetInclude } from "./ICSSTargetValue";
	import type { ICSSTargetValue } from "./ICSSTargetValue";
	import { storage } from "../../lib/communication";
	import { onMount } from "svelte";

	const Selections = {
		SpecifyTarget: "specifytarget",
		FullScan: "fullscan",
	};

	let selection: string = $state(Selections.SpecifyTarget);

	let CSSTargets: ICSSTargetValue[] = $state([]);
	let _nextId = 0;
	function newId(): number {
		return _nextId++;
	}

	function handleAddButtonClick(): void {
		debug.debug("New dom selector element button was clicked");
		CSSTargets.push({
			id: newId(),
			selector: "",
			include: CSSTargetInclude.include,
		});
	}

	function removeCSSTarget(index: number): void {
		CSSTargets.splice(index, 1);
	}

	onMount(async () => {
		const targets = await storage.querySelectors.get();
		for (const target of targets?.include || []) {
			CSSTargets.push({
				id: newId(),
				selector: target,
				include: CSSTargetInclude.include,
			});
		}
		for (const target of targets?.exclude || []) {
			CSSTargets.push({
				id: newId(),
				selector: target,
				include: CSSTargetInclude.exclude,
			});
		}
	});

	$effect(() => {
		const targets = {
			include: new Array<string>(),
			exclude: new Array<string>(),
		};
		for (const target of CSSTargets) {
			// If the selector string is empty, we pretend it doesn't exist
			if (!target.selector) continue;
			if (target.include === CSSTargetInclude.include) {
				targets.include.push(target.selector);
			} else {
				targets.exclude.push(target.selector);
			}
		}
		storage.querySelectors.set(targets);
	});
</script>

<div class="radio-choice">
	<label>
		<input
			type="radio"
			name="Specify Target"
			value={Selections.SpecifyTarget}
			bind:group={selection}
		/>
		Specify Target
	</label>
	<label>
		<input
			type="radio"
			name="Full Scan"
			value={Selections.FullScan}
			bind:group={selection}
		/>
		Full Scan
	</label>
</div>

{#if selection === Selections.SpecifyTarget}
	<ListTitle title="Targets" onAdd={handleAddButtonClick} />
	{#each CSSTargets as target, index (target.id)}
		<CssTarget bind:value={CSSTargets[index]}></CssTarget>
		<DeleteButton
			onDelete={() => {
				removeCSSTarget(index);
			}}
		/>
		<hr />
	{/each}
{:else if selection === Selections.FullScan}
	<h3>Nothing to Pick 😄👍</h3>
{/if}

<style>
	.radio-choice {
		display: flex;
		gap: 20px;
		margin-bottom: 10px;
	}
</style>
