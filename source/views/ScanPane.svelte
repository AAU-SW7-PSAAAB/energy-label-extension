<script lang="ts">
  import "@picocss/pico";
  import { onMount } from "svelte";
  import PluginSelect from "./components/PluginSelect.svelte";
  import browser from "../lib/browser.ts";
  import plugins from "../plugins.ts";
  import {
    MessageLiterals,
    ResultsSchema,
    type StartScan,
    type Results,
  } from "../lib/communication.ts";
  import { StatusCodes } from "../../energy-label-types/lib/index.ts";
  import debug from "../lib/debug.ts";
  import Navbar from "./components/nav/Navbar.svelte";
  import type { Tab } from "./components/nav/tab.ts";
  import { TabType } from "./components/nav/TabType.ts";
  import DomSelect from "./components/DomSelect.svelte";

  let NavTabs: Tab[] = $state([
    { label: TabType.PLUGINS, title: "Plugin Selection" },
    { label: TabType.DOMSELECTION, title: "DOM Selection" },
  ]);
  let currentTab: TabType = $state(TabType.PLUGINS);

  let statusMessage: string | null = $state(null);
  let results: Results = $state([]);

  function updateResults(rawResults: Results) {
    // Do not delete status message when intentionally clearing results when a scan is started
    if (Object.keys(rawResults).length === 0) {
      results = [];
      return;
    }

    const { success, data, error } = ResultsSchema.safeParse(rawResults);
    if (!success) {
      results = [];
      statusMessage = "Invalid results data";
      debug.warn(error);
      return;
    }

    results = data.sort((a, b) => a.score - b.score);
    statusMessage = null;
  }

  onMount(() => {
    browser.storage.local.get("results").then((localData) => {
      if (localData.results) {
        updateResults(localData.results);
      }
    });

    browser.storage.onChanged.addListener((changes) => {
      if (changes.results) {
        updateResults(changes.results.newValue);
      }
    });
  });

  const selectedPlugins = plugins.map((plugin) => ({
    name: plugin.name,
    checked: true,
  }));

  async function startScan() {
    browser.storage.local.set({ results: [] });
    statusMessage = "Scanning...";
    const [tab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab?.id) return;

    const message: StartScan = {
      action: MessageLiterals.StartScan,
      selectedPluginNames: selectedPlugins
        .filter((p) => p.checked)
        .map((p) => p.name),
      querySelectors: {
        include: ["nav", "footer"],
        exclude: [".menu-icon", ".submenu-close"],
      },
    };

    try {
      await browser.tabs.sendMessage(tab.id, message);
    } catch (e) {
      if (e instanceof Error) statusMessage = e.message;
    }
  }
</script>

<Navbar bind:Tabs={NavTabs} bind:current={currentTab} />
<div class="container">
  <!--Select plugins-->
  {#if currentTab === TabType.PLUGINS}
    {#each selectedPlugins as { name }, index}
      <PluginSelect bind:checked={selectedPlugins[index].checked} {name} />
    {/each}

    <!--DOM Selection and entire website scan-->
  {:else if currentTab === TabType.DOMSELECTION}
    <DomSelect></DomSelect>
  {/if}

  <button onclick={startScan}>Scan Now</button>

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
    margin-top: 15px;
    margin-bottom: 15px;
  }
</style>
