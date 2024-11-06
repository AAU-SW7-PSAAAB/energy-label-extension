<script lang="ts">
  import "@picocss/pico";
  import { onMount } from "svelte";
  import CSSTarget from "../lib/CSSTarget.svelte";
  import PluginSelect from "../lib/PluginSelect.svelte";
  import browser from "../lib/browser.ts";
  import plugins from "../plugins.ts";
  import { storage } from "../lib/communication.ts";
  import type { Results } from "../lib/communication.ts";
  import { scanState, ScanStates } from "./ScanState.ts";
  import debug from "./debug.ts";
  import { StatusCodes } from "../../energy-label-types/lib/index.ts";

  const Tabs = {
    Plugins: "plugins",
    DOMSelection: "dom-selection",
  };

  let tab = Tabs.Plugins;
  let statusMessage: string | null = null;
  let results: Results = [];

  function updateResults(data: Results | null) {
    // Do not delete status message when intentionally clearing results when a scan is started
    if (!data || data.length === 0) {
      results = [];
      return;
    }

    results = data.sort((a, b) => a.score - b.score);
    statusMessage = null;
  }

  onMount(async () => {
    storage.analysisResults.initAndUpdate(updateResults);
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
  });

  const selectedPlugins = plugins.map((plugin) => ({
    name: plugin.name,
    checked: true,
  }));

  async function startScan() {
    await storage.analysisResults.clear();
    statusMessage = "Scanning...";

    const [tab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab?.id){
      debug.error("Could not start scanning, no tab id");
      return;
    }

    await storage.selectedPlugins.set(
      selectedPlugins
        .map((p) => p.name)
    );
    await storage.querySelectors.set({
        include: ["nav", "footer"],
        exclude: [".menu-icon", ".submenu-close"],
    });

    await scanState.set(ScanStates.LoadNetwork);
  }
</script>

<div class="container">
  <h1>Green Machine</h1>
  <nav>
    <ul>
      <li>
        <button
          onclick={() => {
            tab = Tabs.Plugins;
          }}>Plugins</button
        >
      </li>
      <li>
        <button
          onclick={() => {
            tab = Tabs.DOMSelection;
          }}>DOM Selection</button
        >
      </li>
    </ul>
  </nav>
  {#if tab === Tabs.Plugins}
    {#each selectedPlugins as { name }, index}
      <PluginSelect bind:checked={selectedPlugins[index].checked} {name} />
    {/each}
  {:else if tab === Tabs.DOMSelection}
    <form>
      <label><input name="selection" type="radio" /> Specify targets</label>
      <label><input name="selection" type="radio" /> Scan entire site</label>
    </form>
    <h2>Targets</h2>
    <button>Add</button>
    <CSSTarget></CSSTarget>
    <CSSTarget></CSSTarget>
  {/if}
  <button onclick={startScan}>Scan now</button>
  {#if statusMessage}
    <p>{statusMessage}</p>
  {/if}
  {#if results.length > 0}
    <h2>Results</h2>
    {#if results.some((result) => result.status == StatusCodes.Success)}
      <h3>Success</h3>
      <ul>
        {#each results.filter((result) => result.status == StatusCodes.Success) as result}
          <li>
            {result.name} - {result.score}
          </li>
        {/each}
      </ul>
    {/if}
    {#if results.some((result) => result.status != StatusCodes.Success)}
      <h3>Failure</h3>
      <ul>
        {#each results.filter((result) => result.status != StatusCodes.Success) as result}
          <li>
            {result.name} - {result.score}
          </li>
        {/each}
      </ul>
    {/if}
  {/if}
</div>

<style>
  .container {
    min-width: 500px;
  }
</style>
