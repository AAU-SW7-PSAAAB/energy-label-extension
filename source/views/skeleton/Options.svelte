<script lang="ts">
	import "@picocss/pico";
	import { storage } from "../../lib/communication";
	let sendReports = $state(false);
	storage.settings.initAndUpdate((value) => {
		sendReports = value?.sendReports || false;
	});
	$effect(() => {
		storage.settings.set({ sendReports });
	});
</script>

<form>
	<fieldset>
		<legend>Privacy</legend>
		<label
			>Send scan reports to the Green Machine developers <input
				type="checkbox"
				bind:checked={sendReports}
			/></label
		>
		<p>
			Sending scan reports to us helps us find bugs in the extension and
			detect anomalies on websites. We do not collect any personally
			identifiable information as part of this program.
		</p>
	</fieldset>
</form>
