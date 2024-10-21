<script lang="ts">
  export let name;
  export let checked = false;
</script>

<form>
  <label><input type="checkbox" bind:checked />{name}</label>
</form>
