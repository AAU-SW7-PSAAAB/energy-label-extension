<script lang="ts">
  let message = "I am the analyzer! (not prank)!";

  async function changeBackgroundColor() {
    message = "oh no what is happen? 👁👄👁";

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab) {
      message = "no tab found 😢";
      return;
    }

    const response = await chrome.tabs.sendMessage(tab.id, {
      action: "changeBackgroundColor",
    });

    if (response === "success") {
      message = "haha that was fun 😂 get pranked nerd LOL 💀";
    } else {
      message = "something went wrong 😢 but get pranked anyway";
    }
  }
</script>

<div class="popup">
  <h1>{message}</h1>
</div>

<button on:click={changeBackgroundColor}>Analyze!</button>

<style>
  .popup {
    width: 300px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
