<script>
  import DetailsPrePanel from "../../JsonBrowser/DetailsPrePanel.svelte";
  import { getJson } from "../../utils.js";

  export let source;

  const promise = getJson(source + "/ro-crate-metadata.json");
</script>

{#await promise}
  <p>Loading ro-crate-metadata.json...</p>
{:then jsonData}
  {#if jsonData}
    <DetailsPrePanel {jsonData} summary="Ro-Crate Metadata" />
  {/if}
{:catch error}
  <p>No ro-crate-metadata.json found</p>
{/await}
