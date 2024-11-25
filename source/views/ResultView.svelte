<script lang="ts">
	import { average } from "../lib/average";
	import debug from "../lib/debug";

	import { onMount } from "svelte";
	import { tweened } from "svelte/motion";
	import ResultContainer from "./components/ResultContainer.svelte";

	import { StatusCodes } from "energy-label-types";
	import ViewEnum from "./ViewEnum.ts";
	import { type Results, storage } from "../lib/communication";

	import statusMessageStore from "../lib/stores/statusMessage.ts";

	import { TabType } from "./components/nav/TabType.ts";
	import type { Tab } from "./components/nav/tab.ts";
	import Navbar from "./components/nav/Navbar.svelte";
	import type { PluginCheck } from "../lib/pluginTypes.ts";
	import CheckContainer from "./components/CheckContainer.svelte";
	import {
		scanState as scanStateStorage,
		ScanStates,
	} from "../lib/ScanState.ts";

	let NavTabs: Tab[] = $state([
		{ label: TabType.RESULTBYIMPACT, title: "Sort by impact" },
		{ label: TabType.RESULTBYPLUGIN, title: "Sort by plugin" },
		{ label: TabType.RESULTFAILED, title: "Failed plugins" },
	]);

	let { currentView = $bindable() }: { currentView: ViewEnum } = $props();
	let currentTab: TabType = $state(TabType.RESULTBYIMPACT);

	let results: Results = $state([]);
	let allChecks: PluginCheck[] = $derived.by(() => {
		const checks: PluginCheck[] = [];
		for (const result of results.filter(
			(result) => result.status === StatusCodes.Success,
		)) {
			for (const resultCheck of result.pluginResult.checks) {
				checks.push({
					...resultCheck,
					name: `${result.name} - ${resultCheck.name}`,
				});
			}
		}
		checks.sort((a, b) => a.score - b.score);
		return checks;
	});
	let scanState: ScanStates = $state(ScanStates.Idle);
	scanStateStorage.initAndUpdate((state) => {
		scanState = state;
	});
	let finishedAnalysis: boolean = $state(false);
	let averageScore: number = $state(0);

	let tweenedProgressValue: number = $state(0);
	let progressTweened = tweened(0, {
		duration: 500,
	});

	let piechartProgressStyle: string = $state(
		"radial-gradient(circle, white 0%, white 55%, transparent 55%), conic-gradient(rgb(239, 239, 239))",
	);

	progressTweened.subscribe((progress) => {
		if (progress === 100) {
			finishedAnalysis = true;
			averageScore = average(
				results
					.filter((result) => result.status === StatusCodes.Success)
					.map((result) => result.pluginResult.score),
			);
		}

		let blueColor = "rgb(27, 118, 200)";
		let grayColor = "rgb(239, 239, 239)";
		let gradient = `${grayColor} 0%, ${grayColor} 100%`;

		if (progress !== 0)
			gradient = `${blueColor} 0%, ${blueColor} ${progress}%, ${grayColor} ${progress}%, ${grayColor} 100%`;

		tweenedProgressValue = progress;
		piechartProgressStyle = `radial-gradient(circle, white 0%, white 55%, transparent 55%), conic-gradient(${gradient})`;
	});

	let piechartResultStyle: string = $derived.by(() => {
		if (results.length === 0) return "";

		let gradient = "";

		const filteredResults = results.filter(
			(result) => result.status === StatusCodes.Success,
		);
		const segmentSize = 360 / filteredResults.length;

		filteredResults.forEach((result, index) => {
			const start = index * segmentSize;
			const end = (index + 1) * segmentSize;
			gradient += `${getColor(result.pluginResult.score)} ${start}deg ${end}deg`;
			if (index < filteredResults.length - 1) gradient += ", ";
		});

		return `radial-gradient(circle, white 0%, white 55%, transparent 55%), conic-gradient(${gradient})`;
	});

	function getColor(score: number): string {
		switch (true) {
			case score <= 40:
				return "#c94f4f";
			case score <= 60:
				return "#d39e4f";
			case score <= 80:
				return "#e3c66d";
			default:
				return "#5c8a4f";
		}
	}

	async function updateResults(data: Results | null) {
		// Do not delete status message when intentionally clearing results because a scan is started
		if (!data || data.length === 0) {
			results = [];
			return;
		}

		results = data.sort(
			(a, b) => a.pluginResult.score - b.pluginResult.score,
		);

		const selectedPlugins = await storage.selectedPlugins.get();

		if (
			selectedPlugins?.length === undefined ||
			selectedPlugins.length === 0
		) {
			debug.error("Length of 'selectedPlugins' is null or 0");
			currentView = ViewEnum.ScanOptionsView;
			return;
		}

		const currentProgress = results.map(
			(result) => result.pluginResult.progress,
		);
		// We might have some plugins that have not yet returned a result, we need to take those into account
		while (currentProgress.length < selectedPlugins.length) {
			currentProgress.push(0);
		}
		progressTweened.set(average(currentProgress));
	}

	function continueScan() {
		scanStateStorage.set(ScanStates.LoadNetworkFinished);
	}

	onMount(() => {
		storage.analysisResults.initAndUpdate(updateResults);
	});
</script>

<div class="container">
	<div class="top-container">
		{#if !finishedAnalysis}
			<div
				class="piechart"
				style="background-image: {piechartProgressStyle}"
			>
				<span class="score">{Math.round(tweenedProgressValue)} %</span>
			</div>
		{:else}
			<div
				class="piechart"
				style="background-image: {piechartResultStyle};"
			>
				<span class="score">{Math.round(averageScore)}</span>
			</div>
		{/if}
	</div>
	<hr class="rounded" />
	{#if scanState === ScanStates.LoadNetwork}
		<div id="network-load-message">
			<p>
				You can now perform any actions needed to load the content that
				you want to test.
			</p>
			<p>
				When you are ready, wait for the content to finish loading and
				press "Continue".
			</p>
			<button onclick={continueScan}>Continue</button>
			<br />
		</div>
	{:else}
		<Navbar bind:Tabs={NavTabs} bind:current={currentTab} />
		<br />
		<div class="results-box-container">
			{#if currentTab === TabType.RESULTFAILED}
				{#if results.some((result) => result.status !== StatusCodes.Success)}
					{#each results.filter((result) => result.status !== StatusCodes.Success) as result (result.name)}
						<ResultContainer {result}></ResultContainer>
					{/each}
					{#if $statusMessageStore.length > 0}
						<h5>Status Messages:</h5>
						<ul>
							{#each $statusMessageStore as statusMessage}
								<li>
									{statusMessage}
								</li>
							{/each}
						</ul>
					{/if}
				{/if}
			{:else if currentTab === TabType.RESULTBYIMPACT}
				{#each allChecks.filter((check) => check) as check}
					<CheckContainer {check}></CheckContainer>
				{/each}
			{:else if currentTab === TabType.RESULTBYPLUGIN}
				{#each results.filter((result) => result.status === StatusCodes.Success) as result (result.name)}
					<ResultContainer {result}></ResultContainer>
				{/each}
			{/if}
		</div>
	{/if}
</div>

<style>
	.top-container {
		padding: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.piechart {
		position: relative;
		width: 200px;
		height: 200px;
		border-radius: 50%;
	}

	.score {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);

		font-size: 24px;
		font-weight: bold;
		color: black;
	}
	#network-load-message {
		text-align: center;
		margin-bottom: 20px;
	}
</style>
