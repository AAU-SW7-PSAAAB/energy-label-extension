<script lang="ts">
	import PlusButton from "./buttons/PlusButton.svelte";

	let { title, onAdd = () => {} }: { title: string; onAdd: () => void } =
		$props();

	function btnClicked(): void {
		onAdd();
	}
</script>

<div class="dom-title">
	<h3>{title}</h3>
	<PlusButton onAdd={btnClicked} />
</div>
<hr class="line" />

<style>
	.dom-title {
		display: flex;
		align-items: center;
		margin-bottom: 0px;
	}

	.dom-title h3 {
		margin: 0;
	}

	.line {
		background-color: whitesmoke;
		margin-top: 5px;
		margin-bottom: 15px;
	}
</style>
