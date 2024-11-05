<script lang="ts">
  import "@picocss/pico";
  import PluginSelect from "./components/PluginSelect.svelte";
  import browser from "../lib/browser.ts";
  import plugins from "../plugins.ts";
  import { MessageLiterals, type StartScan } from "../lib/communication.ts";
  import debug from "../lib/debug.ts";
  import statusMessageStore from "../lib/stores/statusMessage.ts";
  import ViewEnum from "./ViewEnum.ts";
  import Navbar from "./components/nav/Navbar.svelte";
  import type { Tab } from "./components/nav/tab.ts";
  import { TabType } from "./components/nav/TabType.ts";
  import DomSelect from "./components/DomSelect.svelte";

  let NavTabs: Tab[] = $state([
    { label: TabType.PLUGINS, title: "Plugin Selection" },
    { label: TabType.DOMSELECTION, title: "DOM Selection" },
  ]);

  let { currentView = $bindable() }: { currentView: ViewEnum } = $props();
  let currentTab: TabType = $state(TabType.PLUGINS);

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
</div>

<style>
  .container {
    margin-top: 15px;
    margin-bottom: 15px;
  }
</style>
