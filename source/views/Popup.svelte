<script lang="ts">
  import { onMount } from "svelte";
  import "@picocss/pico";
  import CSSTarget from "../lib/CSSTarget.svelte";
  import PluginSelect from "../lib/PluginSelect.svelte";
  import browser from "../lib/browser.ts";
  import { MessageLiterals } from "../lib/communication.ts";
  import plugins from "../plugins.ts";

  let tab = "plugins";
  let pluginList: { plugin: IPlugin; checked: bool }[] = [];

  async function startScan() {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab || !tab.id) {
      return;
    }

    browser.tabs.sendMessage(tab.id, {
      action: MessageLiterals.StartScan,
    });
  }

  onMount(async () => {
    plugins.forEach((element) => {
      pluginList.push({ plugin: element, checked: true });
    });
  });
</script>

<h1>Green Machine</h1>
<nav>
  <ul>
    <li>
      <button
        on:click={() => {
          tab = "plugins";
        }}>Plugins</button
      >
    </li>
    <li>
      <button
        on:click={() => {
          tab = "domselection";
        }}>DOM Selection</button
      >
    </li>
  </ul>
</nav>
{#if tab === "plugins"}
  {#each pluginList as plugin}
    <PluginSelect bind:checked={plugin.checked} name={plugin.plugin.name} />
  {/each}
{:else if tab === "domselection"}
  <form>
    <label><input name="selection" type="radio" /> Specify targets</label>
    <label><input name="selection" type="radio" /> Scan entire site</label>
  </form>
  <h2>Targets</h2>
  <button>Add</button>
  <CSSTarget></CSSTarget>
  <CSSTarget></CSSTarget>
{/if}
<button on:click={startScan}>Scan now</button>
