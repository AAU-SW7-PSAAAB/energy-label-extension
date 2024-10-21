<script lang="ts">
  import "@picocss/pico";
  import CSSTarget from "../lib/CSSTarget.svelte";
  import PluginSelect from "../lib/PluginSelect.svelte";
  import browser from "../lib/browser.ts";
  import { MessageLiterals } from "../lib/communication.ts";

  let tab = "domselection";

  async function startScan() {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab || !tab.id) {
      return;
    }

    browser.tabs.sendMessage(tab.id, { action: MessageLiterals.StartScan });
  }
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
  <PluginSelect name="Image"></PluginSelect>
  <PluginSelect name="DOM"></PluginSelect>
  <PluginSelect name="Meta"></PluginSelect>
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
