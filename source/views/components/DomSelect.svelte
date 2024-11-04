<script lang="ts">
  import ListTitle from "./ListTitle.svelte";
  import CssTarget from "./CssTarget.svelte";
  import DeleteButton from "./buttons/DeleteButton.svelte";
  import debug from "../../lib/debug";

  const Selections = {
    SpecifyTarget: "specifytarget",
    FullScan: "fullscan",
  };

  let selection: string = $state(Selections.SpecifyTarget);

  let domSelectComponents: { id: number }[] = $state([]);
  let domSelectComponentCount: number = 0;

  function handleAddButtonClick(): void {
    debug.debug("New dom selector element button was clicked");
    domSelectComponents = [
      ...domSelectComponents,
      { id: domSelectComponentCount++ },
    ];
  }

  function removeDomComponent(id: number): void {
    domSelectComponents = domSelectComponents.filter(
      (component) => component.id !== id,
    );
  }
</script>

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
  <ListTitle title="Targets" onAdd={handleAddButtonClick} />
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

<style>
  .radio-choice {
    display: flex;
    gap: 20px;
    margin-bottom: 10px;
  }
</style>
