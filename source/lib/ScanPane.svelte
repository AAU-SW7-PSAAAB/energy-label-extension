<script lang="ts">
  import "@picocss/pico";
  import { onMount } from "svelte";
  import CSSTarget from "../lib/CSSTarget.svelte";
  import PluginSelect from "../lib/PluginSelect.svelte";
  import browser from "../lib/browser";
  import plugins from "../plugins";
  import {
    MessageLiterals,
    type StartScan,
    type Result,
  } from "../lib/communication";

  const Tabs = {
    Plugins: "plugins",
    DOMSelection: "dom-selection",
  };

  let tab = Tabs.Plugins;
  let statusMessage: string | null = null;
  let results: Record<string, Result> = {};

  onMount(() => {
    browser.storage.local.get("results").then((data) => {
      if (data.results) {
        results = data.results;
      }
    });

    browser.storage.onChanged.addListener((changes) => {
      if (changes.results) {
        results = changes.results.newValue;
        if (Object.keys(changes.results.newValue).length > 0)
          statusMessage = null;
      }
    });
  });

  const selectedPlugins = plugins.map((plugin) => ({
    name: plugin.name,
    checked: true,
  }));

  async function startScan() {
    browser.storage.local.set({ results: {} });
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
    };

    try {
      await browser.tabs.sendMessage(tab.id, message);
    } catch (e) {
      if (e instanceof Error) statusMessage = e.message;
    }
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
  {#if Object.keys(results).length > 0}
    <h2>Results</h2>
    {#if Object.keys(results).some((result) => results[result].success)}
      <h3>Success</h3>
      <ul>
        {#each Object.keys(results).filter((result) => results[result].success) as pluginName}
          <li>
            {pluginName} - {results[pluginName].score}
          </li>
        {/each}
      </ul>
    {/if}
    {#if Object.keys(results).some((result) => !results[result].success)}
      <h3>Failure</h3>
      <ul>
        {#each Object.keys(results).filter((result) => !results[result].success) as pluginName}
          <li>
            {pluginName} - {results[pluginName].score}
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
