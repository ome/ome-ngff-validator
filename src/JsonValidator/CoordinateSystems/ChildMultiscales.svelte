<script>
  import Thumbnail from "../Thumbnail/index.svelte";
  import { getJson } from "../../utils";

  export let multiscalesUrl;

  let msAttrsPromise = getJson(multiscalesUrl + "/zarr.json");
</script>

{#await msAttrsPromise}
  <p>Loading {multiscalesUrl}/zarr.json...</p>
{:then msAttrs}
  {#if msAttrs?.attributes?.ome?.multiscales}
    <Thumbnail
      source={multiscalesUrl}
      targetSize="100"
      maxCssSize="100"
    />
  {:else}
    <p class="warning">
      No multiscales found at {multiscalesUrl}
    </p>
  {/if}
{:catch error}
  <details>
    <summary>
      <span class="warning"
        >Could not load multiscales at <strong>{multiscalesUrl}</strong
        ></span
      ></summary
    >
    <p class="warning">
      {error.message}
    </p>
  </details>
{/await}
