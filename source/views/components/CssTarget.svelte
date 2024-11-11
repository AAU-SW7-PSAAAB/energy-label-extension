<script lang="ts">
  import {CSSTargetInclude, type ICSSTargetValue} from "./ICSSTargetValue";
  let {
    value = $bindable(),
  }:{
    value: ICSSTargetValue,
  } = $props();
</script>

<form>
  <fieldset>
    <legend>Include or exclude DOM element</legend>
    <label>
      <input type="radio" id="include" name="include-exclude" value="{CSSTargetInclude.include}" bind:group={value.include} checked />
      Include
    </label>
    <label>
      <input type="radio" id="exclude" name="include-exclude" value="{CSSTargetInclude.exclude}" bind:group={value.include} />
      Exclude
    </label>
  </fieldset>
  <legend>QuerySelector input</legend>
  <input type="text" placeholder=".my-image-class" bind:value={value.selector} />
</form>

<style>
  label:has(input[type="radio"]) {
    display: inline;

    &:not(:first-of-type) {
      margin-left: 1em;
    }
  }
</style>
