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
  import debug from "../lib/debug.ts";
  import Navbar from "./components/nav/Navbar.svelte";
  import type { Tab } from "./components/nav/tab.ts";
  import ListTitle from "./components/ListTitle.svelte";
  import CssTarget from "./components/CssTarget.svelte";
  import DeleteButton from "./components/buttons/DeleteButton.svelte";

  let NavTabs: Tab[] = $state([
    { label: "plugins", title: "Plugin Selection" },
    { label: "dom-selection", title: "DOM Selection" },
  ]);
  let currentTab: string = $state("plugins");

  const Selections = {
    SpecifyTarget: "specifytarget",
    FullScan: "fullscan",
  };

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

  let selection: String = $state(Selections.SpecifyTarget);

  let domSelectComponents: { id: number }[] = $state([]);
  let domSelectComponentCount: number = 0;

  let createDOMButtonClicked: boolean = $state(false);

  function handleClick(): void {
    debug.debug("New dom selector element button was clicked");
    domSelectComponents = [
      ...domSelectComponents,
      { id: domSelectComponentCount++ },
    ];
    createDOMButtonClicked = false;
  }

  function removeDomComponent(id: number): void {
    domSelectComponents = domSelectComponents.filter(
      (component) => component.id !== id,
    );
  }

  $effect(() => {
    if (createDOMButtonClicked) {
      handleClick();
    }
  });
</script>

<Navbar bind:Tabs={NavTabs} bind:current={currentTab} />
<div class="container">
  <!--Select plugins-->
  {#if currentTab == "plugins"}
    {#each selectedPlugins as { name }, index}
      <PluginSelect bind:checked={selectedPlugins[index].checked} {name} />
    {/each}

    <!--DOM Selection and entire website scan-->
  {:else if currentTab == "dom-selection"}
    <div class="radio-choice">
      <label>
        <input
          type="radio"
          name="Specify Target"
          value={Selections.SpecifyTarget}
          bind:group={selection}
        />
        Specify Target
      </label>
      <label>
        <input
          type="radio"
          name="Full Scan"
          value={Selections.FullScan}
          bind:group={selection}
        />
        Full Scan
      </label>
    </div>

    {#if selection === Selections.SpecifyTarget}
      <ListTitle title="Targets" bind:btnClicked={createDOMButtonClicked} />
      {#each domSelectComponents as component (component.id)}
        <CssTarget></CssTarget>
        <DeleteButton
          onDelete={() => {
            removeDomComponent(component.id);
          }}
        />
        <hr />
      {/each}
    {:else if selection === Selections.FullScan}
      <h3>Noting to Pick 😄👍</h3>
    {/if}
  {/if}

  <button onclick={startScan}>Scan Now</button>

  {#if statusMessage}
    <p>{statusMessage}</p>
  {/if}
  {#if results.length > 0}
    <h2>Results</h2>
    {#if results.some((result) => result.success)}
      <h3>Success</h3>
      <ul>
        {#each results.filter((result) => result.success) as result}
          <li>
            {result.name} - {result.score}
          </li>
        {/each}
      </ul>
    {/if}
    {#if results.some((result) => !result.success)}
      <h3>Failure</h3>
      <ul>
        {#each results.filter((result) => !result.success) as result}
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
  .radio-choice {
    display: flex;
    gap: 20px;
    margin-bottom: 10px;
  }
</style>
