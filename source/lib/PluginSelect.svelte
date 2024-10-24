<script lang="ts">
  let { name, checked = $bindable(true) as boolean } = $props();
</script>

<form>
  <label><input type="checkbox" bind:checked />{name}</label>
</form>
