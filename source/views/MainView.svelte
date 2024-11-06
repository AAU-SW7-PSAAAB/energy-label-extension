<script lang="ts">
  import { onMount } from "svelte";
  import { scanState, ScanStates } from "../lib/ScanState.ts";
  import "@picocss/pico";
  import ViewEnum from "./ViewEnum.ts";
  import ScanOptionsView from "./ScanOptionsView.svelte";
  import ResultView from "./ResultView.svelte";

  // View Enum
  let currentView: ViewEnum = $state(ViewEnum.ScanOptionsView);
  $effect(() => {
    console.log(`New val: ${currentView}`);
  });
  onMount(() => {
    scanState.initAndUpdate(async (state: ScanStates) => {
      switch (state) {
        case ScanStates.LoadNetworkFinished: {
          await scanState.set(ScanStates.LoadContent);
          break;
        }
        case ScanStates.LoadContentFinished: {
          await scanState.set(ScanStates.Analyze);
          break;
        }
      }
    });
  })
</script>

<div class="extension-header">
  {#if currentView !== ViewEnum.ScanOptionsView}
    <button
      onclick={() => {
        currentView = ViewEnum.ScanOptionsView;
      }}
    >
      <img src="/images/close_icon_red.svg" alt="Close results view" />
    </button>
  {/if}
  <h1>Green Machine</h1>
</div>
<div class="container">
  {#if currentView === ViewEnum.ScanOptionsView}
    <ScanOptionsView bind:currentView />
  {:else if currentView === ViewEnum.ResultView}
    <ResultView />
  {/if}
</div>

<style>
  .extension-header {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    column-gap: 5px;

    z-index: 1;
    position: fixed;
    overflow: hidden;
    top: 0;
    width: 100%;
    padding: 10px;

    background-color: #739e82;
    color: white;
  }
  .extension-header h1 {
    text-align: center;
    margin: auto;
    grid-column: 2;
  }

  .extension-header button {
    grid-column: 1;
    justify-self: start;

    padding: 5px;
    margin-left: 10px;

    background-color: rgba(248, 248, 255, 0.25);
    border: none;
  }
  .container {
    margin-top: 60px;
    min-width: 500px;
  }
</style>
