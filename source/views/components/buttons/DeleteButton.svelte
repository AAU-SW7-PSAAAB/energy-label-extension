<script lang="ts">
  let { onDelete = () => {} }: { onDelete: () => void } = $props();

  function handleClick(): void {
    onDelete();
  }
</script>

<button type="button" onclick={handleClick}> Delete </button>

<style>
  button {
  }
</style>
