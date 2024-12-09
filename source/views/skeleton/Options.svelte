<script lang="ts">
	import "@picocss/pico";
	import { storage } from "../../lib/communication";
	import { onMount } from "svelte";
	let storageValueSet = false;
	let sendReportsValue: boolean = $state(false);

	$effect(() => {
		const newValue = sendReportsValue;
		if (!storageValueSet) return;
		storage.settings.set({ sendReports: newValue });
	});

	async function getStorage(): Promise<boolean> {
		const value = await storage.settings.get();
		return value?.sendReports ?? false;
	}

	onMount(async () => {
		sendReportsValue = await getStorage();
		storageValueSet = true;
	});
</script>

<form>
	<fieldset>
		<legend>Privacy</legend>
		<label
			>Send scan reports to the Green Machine developers <input
				type="checkbox"
				bind:checked={sendReportsValue}
			/></label
		>
		<p>
			Sending scan reports to us helps us find bugs in the extension and
			detect anomalies on websites. We do not collect any personally
			identifiable information as part of this program.
		</p>
	</fieldset>
</form>
