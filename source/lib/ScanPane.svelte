<script lang="ts">
	import "@picocss/pico";
	import { onMount } from "svelte";
	import CSSTarget from "../lib/CSSTarget.svelte";
	import PluginSelect from "../lib/PluginSelect.svelte";
	import browser from "../lib/browser.ts";
	import plugins from "../plugins.ts";
	import {
		MessageLiterals,
		ResultsSchema,
		type StartScan,
		type Results,
	} from "../lib/communication.ts";
	import debug from "./debug.ts";
	import { StatusCodes } from "../../energy-label-types/lib/index.ts";

	const Tabs = {
		Plugins: "plugins",
		DOMSelection: "dom-selection",
	};

	let tab = Tabs.Plugins;
	let statusMessage: string | null = null;
	let results: Results = [];

	function updateResults(rawResults: Results) {
		// Do not delete status message when intentionally clearing results when a scan is started
		if (Object.keys(rawResults).length === 0) {
			results = [];
			return;
		}

		const { success, data, error } = ResultsSchema.safeParse(rawResults);
		if (!success) {
			results = [];
			statusMessage = "Invalid results data";
			debug.warn(error);
			return;
		}

		results = data.sort((a, b) => a.score - b.score);
		statusMessage = null;
	}

	onMount(() => {
		browser.storage.local.get("results").then((localData) => {
			if (localData.results) {
				updateResults(localData.results);
			}
		});

		browser.storage.onChanged.addListener((changes) => {
			if (changes.results) {
				updateResults(changes.results.newValue);
			}
		});
	});

	const selectedPlugins = plugins.map((plugin) => ({
		name: plugin.name,
		checked: true,
	}));

	async function startScan() {
		browser.storage.local.set({ results: [] });
		statusMessage = "Scanning...";

		const [tab] = await browser.tabs.query({
			active: true,
			currentWindow: true,
		});

		if (!tab?.id) return;

		const message: StartScan = {
			action: MessageLiterals.StartScan,
			selectedPluginNames: selectedPlugins
				.filter((p) => p.checked)
				.map((p) => p.name),
			querySelectors: {
				include: [], //["nav", "footer"],
				exclude: [], //[".menu-icon", ".submenu-close"],
			},
		};

		try {
			await browser.tabs.sendMessage(tab.id, message);
		} catch (e) {
			if (e instanceof Error) statusMessage = e.message;
		}
	}
</script>

<div class="container">
	<h1>Green Machine</h1>
	<nav>
		<ul>
			<li>
				<button
					onclick={() => {
						tab = Tabs.Plugins;
					}}>Plugins</button
				>
			</li>
			<li>
				<button
					onclick={() => {
						tab = Tabs.DOMSelection;
					}}>DOM Selection</button
				>
			</li>
		</ul>
	</nav>
	{#if tab === Tabs.Plugins}
		{#each selectedPlugins as { name }, index}
			<PluginSelect
				bind:checked={selectedPlugins[index].checked}
				{name}
			/>
		{/each}
	{:else if tab === Tabs.DOMSelection}
		<form>
			<label
				><input name="selection" type="radio" /> Specify targets</label
			>
			<label
				><input name="selection" type="radio" /> Scan entire site</label
			>
		</form>
		<h2>Targets</h2>
		<button>Add</button>
		<CSSTarget></CSSTarget>
		<CSSTarget></CSSTarget>
	{/if}
	<button onclick={startScan}>Scan now</button>
	{#if statusMessage}
		<p>{statusMessage}</p>
	{/if}
	{#if results.length > 0}
		<h2>Results</h2>
		{#if results.some((result) => result.status == StatusCodes.Success)}
			<h3>Success</h3>
			<ul>
				{#each results.filter((result) => result.status == StatusCodes.Success) as result}
					<li>
						{result.name} - {result.score}
					</li>
				{/each}
			</ul>
		{/if}
		{#if results.some((result) => result.status != StatusCodes.Success)}
			<h3>Failure</h3>
			<ul>
				{#each results.filter((result) => result.status != StatusCodes.Success) as result}
					<li>
						{result.name} - {result.score}
					</li>
				{/each}
			</ul>
		{/if}
	{/if}
</div>

<style>
	.container {
		min-width: 500px;
	}
</style>
