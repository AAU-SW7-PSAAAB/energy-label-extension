<script lang="ts">
	import debug from "../lib/debug";
	import browser from "../lib/browser.ts";

	import { onMount } from "svelte";
	import { tweened } from "svelte/motion";
	import ResultContainer from "./components/ResultContainer.svelte";

	import { StatusCodes } from "energy-label-types";
	import ViewEnum from "./ViewEnum.ts";
	import { type Results, storage } from "../lib/communication";

	import statusMessageStore from "../lib/stores/statusMessage.ts";

	let { currentView = $bindable() }: { currentView: ViewEnum } = $props();

	let results: Results = $state([]);
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

			const total = results.reduce((accumulator, currentValue) => {
				return accumulator + currentValue.score;
			}, 0);

			averageScore = total / results.length;
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

		const filteredResults = results.filter((e) => e.status === 0);
		const segmentSize = 360 / filteredResults.length;

		filteredResults.forEach((result, index) => {
			const start = index * segmentSize;
			const end = (index + 1) * segmentSize;
			gradient += `${getColor(result.score)} ${start}deg ${end}deg`;
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
		// Do not delete status message when intentionally clearing results when a scan is started
		if (!data || data.length === 0) {
			results = [];
			return;
		}

		results = data.sort((a, b) => a.score - b.score);

		const selectedPlugins = await storage.selectedPlugins.get();

		if (
			selectedPlugins?.length === undefined ||
			selectedPlugins.length === 0
		) {
			debug.error("Length of 'selectedPlugins' is null or 0");
			currentView = ViewEnum.ScanOptionsView;
			return;
		}

		progressTweened.set((results.length / selectedPlugins.length) * 100);
	}

	onMount(() => {
		storage.analysisResults.initAndUpdate(updateResults);
	});
</script>

<div class="container">
	{#if !finishedAnalysis}
		<div class="top-container">
			<div
				class="piechart"
				style="background-image: {piechartProgressStyle}"
			>
				<span class="score">{Math.round(tweenedProgressValue)} %</span>
			</div>
		</div>
		<ResultContainer header={null}>
			{#if results.some((result) => result.status !== StatusCodes.Success)}
				<h5>Failed Plugins:</h5>
				<ul>
					{#each results.filter((result) => result.status !== StatusCodes.Success) as result}
						<li>
							{result.name}
						</li>
					{/each}
				</ul>
			{/if}
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
		</ResultContainer>
	{:else}
		<div class="top-container">
			<div
				class="piechart"
				style="background-image: {piechartResultStyle};"
			>
				<span class="score">{Math.round(averageScore)}</span>
			</div>
		</div>
		<hr class="rounded" />
		<div class="results-box-container">
			{#if results.some((result) => result.status === StatusCodes.Success)}
				{#each results.filter((result) => result.status === StatusCodes.Success) as result}
					<ResultContainer header={result.name}>
						<h4>Score: {result.score}</h4>
					</ResultContainer>
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
</style>
