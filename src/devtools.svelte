<script lang="ts">
  import Home from "./views/Home.svelte"

  chrome.devtools.panels.create("Energy Label", null, "devtools.html")
</script>

<Home />
