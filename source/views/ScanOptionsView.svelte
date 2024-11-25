<script lang="ts">
	import "@picocss/pico";
	import PluginSelect from "./components/PluginSelect.svelte";
	import plugins from "../plugins.ts";
	import { storage } from "../lib/communication.ts";
	import { scanState, ScanStates } from "../lib/ScanState.ts";
	import statusMessageStore from "../lib/stores/statusMessage.ts";
	import ViewEnum from "./ViewEnum.ts";
	import Navbar from "./components/nav/Navbar.svelte";
	import type { Tab } from "./components/nav/tab.ts";
	import { TabType } from "./components/nav/TabType.ts";
	import DomSelect from "./components/DomSelect.svelte";

	import { onMount } from "svelte";
	import { getActiveTab } from "../lib/activeTab.ts";
	import debug from "../lib/debug.ts";

	let NavTabs: Tab[] = $state([
		{ label: TabType.PLUGINS, title: "Plugin Selection" },
		{ label: TabType.DOMSELECTION, title: "DOM Selection" },
	]);

	let { currentView = $bindable() }: { currentView: ViewEnum } = $props();
	let currentTab: TabType = $state(TabType.PLUGINS);

	let selectedPlugins: { name: string; checked: boolean }[] = $state([]);

	async function startScan() {
		const targetTab = await getActiveTab();
		if (!targetTab?.id) {
			debug.error("Could not start scanning, no tab id");
			return;
		}
		await storage.analysisMeta.set({
			id: crypto.randomUUID(),
			targetTab: targetTab.id,
		});
		await storage.analysisResults.clear();
		statusMessageStore.set([]);

		const filteredPlugins = selectedPlugins.filter(
			(element) => element.checked,
		);

		await storage.selectedPlugins.set(filteredPlugins.map((p) => p.name));

		await scanState.set(ScanStates.BeginLoad);
		currentView = ViewEnum.ResultView;
	}

	onMount(async () => {
		const previousPlugins = await storage.selectedPlugins.get();

		selectedPlugins = plugins.map((plugin) => ({
			name: plugin.name,
			checked: previousPlugins
				? previousPlugins.includes(plugin.name)
				: true,
		}));
	});
</script>

<Navbar bind:Tabs={NavTabs} bind:current={currentTab} />
<div class="container">
	<!--Select plugins-->
	{#if currentTab === TabType.PLUGINS}
		{#each selectedPlugins as { name }, index}
			<PluginSelect
				{name}
				bind:checked={selectedPlugins[index].checked}
			/>
		{/each}

		<!--DOM Selection and entire website scan-->
	{:else if currentTab === TabType.DOMSELECTION}
		<DomSelect></DomSelect>
	{/if}

	<button onclick={startScan}>Scan Now</button>
</div>

<style>
	.container {
		margin-top: 15px;
		margin-bottom: 15px;
	}
</style>
