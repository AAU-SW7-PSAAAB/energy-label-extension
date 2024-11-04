<script lang="ts">
  import PlusButton from "./buttons/PlusButton.svelte";

  let {
    title,
    btnClicked = $bindable(false),
  }: { title: string; btnClicked: boolean } = $props();
</script>

<div class="dom-title">
  <h3>{title}</h3>
  <PlusButton bind:clicked={btnClicked} />
</div>
<hr class="line" />

<style>
  .dom-title {
    display: flex;
    align-items: center;
    margin-bottom: 0px;
  }

  .dom-title h3 {
    margin: 0;
  }

  .line {
    background-color: whitesmoke;
    margin-top: 5px;
    margin-bottom: 15px;
  }
</style>
