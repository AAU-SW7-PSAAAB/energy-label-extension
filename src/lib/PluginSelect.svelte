<script lang="ts">
  export let name: string
  export let checked = true
</script>

<form>
  <label><input type="checkbox" bind:checked />{name}</label>
</form>
