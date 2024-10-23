<script lang="ts">
  import "@picocss/pico"

  import { MessageLiterals, type StartScan } from "../lib/communication"
  import CSSTarget from "../lib/CSSTarget.svelte"
  import PluginSelect from "../lib/PluginSelect.svelte"
  import plugins from "../plugins"

  const Tabs = {
    Plugins: "plugins",
    DOMSelection: "dom-selection"
  }

  let tab = Tabs.Plugins

  const selectedPlugins = plugins.map((plugin) => ({
    name: plugin.name,
    checked: true
  }))

  async function startScan() {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    })

    if (!tab?.id) return

    const message: StartScan = {
      action: MessageLiterals.StartScan,
      selectedPluginNames: selectedPlugins
        .filter((p) => p.checked)
        .map((p) => p.name)
    }

    chrome.tabs.sendMessage(tab.id, message)
  }
</script>

<h1>Green Machine</h1>
<nav>
  <ul>
    <li>
      <button
        on:click={() => {
          tab = Tabs.Plugins
        }}>Plugins</button>
    </li>
    <li>
      <button
        on:click={() => {
          tab = Tabs.DOMSelection
        }}>DOM Selection</button>
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
<button on:click={startScan}>Scan now</button>
