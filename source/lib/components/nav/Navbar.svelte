<script lang="ts">
  import type { Tab } from "./tab";

  let {
    Tabs = $bindable([]),
    current = $bindable(""),
  }: { Tabs: Tab[]; current: string } = $props();
</script>

<div class="tab">
  {#each Tabs as tab}
    {#if current == tab.label}
      <button
        class="nav-button selected"
        onclick={() => {
          current = tab.label;
        }}><span class="text">{tab.title}</span></button
      >
    {:else}
      <button
        class="nav-button not-selected"
        onclick={() => {
          current = tab.label;
        }}><span class="text">{tab.title}</span></button
      >
    {/if}
  {/each}
</div>

<style>
  .tab {
    overflow: hidden;
    background-color: rgb(50, 53, 59);
  }

  /* Style the buttons that are used to open the tab content */
  .nav-button {
    background-color: inherit;
    float: left;
    border: none;
    outline: none;
    cursor: pointer;
    transition: 0.3s;
    border-radius: 0%;
  }

  /* Change background color of buttons on hover */
  .not-selected:hover {
    background-color: rgba(
      255,
      255,
      255,
      0.1
    ); /* White overlay with 10% opacity */
  }

  .selected {
    background-color: rgb(20, 23, 30);
  }
</style>
