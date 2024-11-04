<script lang="ts">
</script>

<form>
  <fieldset>
    <legend>Include of exclude DOM element</legend>
    <input
      type="radio"
      id="hindi"
      name="include-exclude"
      aria-invalid="false"
      checked
    />
    <label for="hindi">Include</label>
    <input
      type="radio"
      id="swahili"
      name="include-exclude"
      aria-invalid="true"
    />
    <label for="swahili">Exclude</label>
  </fieldset>
  <legend>QuerySelector input</legend>
  <input placeholder=".my-image-class" type="text" />
</form>
