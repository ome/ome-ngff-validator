<script>
  import DetailsPrePanel from "../../JsonBrowser/DetailsPrePanel.svelte";
  import { getJson } from "../../utils.js";
  import RoCrateValidator from "./RoCrateValidator.svelte";

  export let source;
  const promise = getJson(source + "/ro-crate-metadata.json");
</script>


<div class="rocrate">
<h1>Ro-crate metadata</h1>



{#await promise}
  <p>Loading ro-crate-metadata.json...</p>
{:then jsonData}
  {#if jsonData}
    <RoCrateValidator {jsonData} />
    <DetailsPrePanel {jsonData} summary="ro-crate-metadata.json" />
  {/if}
{:catch error}
  <p>No ro-crate-metadata.json found</p>
{/await}

</div>


<style>
.rocrate {
    /* same as Array panels */
    border-radius: 10px;
    padding: 15px 0;
    margin: 15px 0;
    box-shadow: 5px 5px 10px #c3c0c0;
    background: linear-gradient(to right, #ccc, #aaa);
    text-align: center;
}
</style>