<script lang="ts">
  import "@picocss/pico";
  import CSSTarget from "./components/CSSTarget.svelte";
  import PluginSelect from "./components/PluginSelect.svelte";
  import browser from "../lib/browser.ts";
  import plugins from "../plugins.ts";
  import { MessageLiterals, type StartScan } from "../lib/communication.ts";
  import debug from "../lib/debug.ts";
  import statusMessageStore from "../lib/stores/statusMessage.ts";

  import ViewEnum from "./ViewEnum.ts";

  let { currentView = $bindable() }: { currentView: ViewEnum } = $props();

  const Tabs = {
    Plugins: "plugins",
    DOMSelection: "dom-selection",
  };

  let tab = $state(Tabs.Plugins);
  let statusMessage: string | null = $state(null); // TODO: STATUS BINDING

  const selectedPlugins = plugins.map((plugin) => ({
    name: plugin.name,
    checked: true,
  }));

  async function startScan() {
    browser.storage.local.set({ results: [] });
    statusMessageStore.set([]);

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
        include: [],
        exclude: [],
      },
    };

    try {
      await browser.tabs.sendMessage(tab.id, message);
      currentView = ViewEnum.ResultView;
    } catch (e) {
      if (e instanceof Error)
        statusMessageStore.update((prev) => prev.concat([e.message]));
    }
  }
</script>

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
