<script lang="ts">
  import type { Tab } from "./tab";
  import type { TabType } from "./TabType";

  let {
    Tabs = $bindable([]),
    current = $bindable(),
  }: { Tabs: Tab[]; current: TabType } = $props();
</script>

<div class="tab">
  {#each Tabs as tab}
    <button
      class:selected={current === tab.label}
      class="nav-button"
      onclick={() => {
        current = tab.label;
      }}><span class="text">{tab.title}</span></button
    >
  {/each}
</div>

<style>
  .tab {
    overflow: hidden;
    background-color: rgb(50, 53, 59);
  }

  .nav-button {
    background-color: rgb(50, 53, 59);
    float: left;
    border: none;
    margin: 0;
    outline: none;
    cursor: pointer;
    transition: 0.3s;
    border-radius: 0%;
    box-shadow: none;
  }

  .nav-button:not(.selected):hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .nav-button.selected {
    background-color: rgb(20, 23, 30);
  }
</style>
