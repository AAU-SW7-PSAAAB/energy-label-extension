<script lang="ts">
  let { onDelete = () => {} }: { onDelete: () => void } = $props();

  function handleClick(): void {
    onDelete();
  }
</script>

<button aria-label="delete" onclick={handleClick} class="noselect">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    ><path
      d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z"
    ></path></svg
  >
</button>

<style>
  * {
    margin: 0;
    padding: 0;
  }
  button {
    width: 40px;
    height: 30px;
    cursor: pointer;
    display: flex;
    align-items: center;
    display: flex;
    justify-content: center;
    background: rgb(140, 78, 81);
    border: none;
    border-radius: 5px;
  }

  button svg {
    width: 15px;
    fill: #eee;
  }

  button:hover {
    background: rgb(166, 73, 77);
  }
</style>
