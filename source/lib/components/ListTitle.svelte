<script lang="ts">
  import PlusButton from "./buttons/PlusButton.svelte";
  let { title }: { title: string } = $props();
</script>

<div class="dom-title">
  <h3>{title}</h3>
  <PlusButton />
</div>
<hr class="line" />

<style>
  .dom-title {
    display: flex;
    align-items: center;
    margin-bottom: 0px;
  }

  .dom-title h3 {
    margin: 0; /* removes default margin */
  }

  .line {
    background-color: whitesmoke;
    margin-top: 5px;
    margin-bottom: 15px;
  }
</style>
