<script lang="ts">
  const name = "Green Machine";
  let gender = "Man";

  function changeGender() {
    gender = gender === "Man" ? "Woman" : "Man";
  }
</script>

<h1>I am the {name} {gender}</h1>
<button on:click={changeGender}>Click me</button>
