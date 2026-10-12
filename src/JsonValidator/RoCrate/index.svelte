<script>
  import DetailsPrePanel from "../../JsonBrowser/DetailsPrePanel.svelte";
  import { getJson } from "../../utils.js";
  import RoCrateValidator from "./RoCrateValidator.svelte";
  import RoCrateTooltip from "./RoCrateTooltip.svelte"; // adjust path as needed

  export let source;
  const promise = getJson(source + "/ro-crate-metadata.json");
</script>

<div class="rocrate">
  {#await promise}
    <p>Loading ro-crate-metadata.json… <RoCrateTooltip></RoCrateTooltip></p>
  {:then jsonData}
    {#if jsonData}
      <h1>
        RO-Crate metadata
        <RoCrateTooltip></RoCrateTooltip>
      </h1>
      <RoCrateValidator {jsonData} />
      <DetailsPrePanel {jsonData} summary="ro-crate-metadata.json" />
    {/if}
  {:catch}
    <p>No ro-crate-metadata.json found <RoCrateTooltip></RoCrateTooltip></p>
  {/await}
</div>

<style>
  .rocrate {
    border-radius: 10px;
    padding: 15px 0;
    margin: 15px 0;
    box-shadow: 5px 5px 10px #c3c0c0;
    background: linear-gradient(to right, #ccc, #aaa);
    text-align: center;
  }
</style>
