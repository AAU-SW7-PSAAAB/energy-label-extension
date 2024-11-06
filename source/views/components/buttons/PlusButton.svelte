<script lang="ts">
  let { onAdd = () => {} }: { onAdd: () => void } = $props();

  function handleClick(): void {
    onAdd();
  }
</script>

<button class="plus-btn" aria-label="Add" onclick={handleClick}></button>

<style>
  .plus-btn {
    width: 20px;
    height: 20px;
    background: #2196f3;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    position: relative;
    transition: background 0.3s;
    margin-left: auto;
  }

  .plus-btn::before,
  .plus-btn::after {
    content: "";
    position: absolute;
    background: white;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .plus-btn::before {
    width: 10px;
    height: 2px;
  }

  .plus-btn::after {
    width: 2px;
    height: 10px;
  }

  .plus-btn:hover {
    background: #1976d2;
  }
</style>
