<script lang="ts">
  let {
    name,
    checked = $bindable(true),
  }: {
    name: string;
    checked: boolean;
  } = $props();
</script>

<form>
  <label><input type="checkbox" bind:checked />{name}</label>
</form>
