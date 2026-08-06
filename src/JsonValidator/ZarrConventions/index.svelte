<script>
  import DetailsPrePanel from "../../JsonBrowser/DetailsPrePanel.svelte";
  import ZarrConventionsTooltip from "./ZarrConventionsTooltip.svelte";

  export let source;
  export let rootAttrs;

  const zarrAttrs = rootAttrs?.attributes || rootAttrs;
  const conventions = zarrAttrs?.zarr_conventions || [];
  // Per spec README, only the underscore key "metadata_assets" is valid.
  const assets = zarrAttrs?.metadata_assets || [];

  const isAbsolute = (href) => /^https?:\/\//i.test(href) || href?.startsWith("/");
  const assetUrl = (href) => (isAbsolute(href) ? href : `${source}/${href}`);
</script>

<div class="zarr-conventions">
  {#if conventions.length > 0}
    <h2>
      Zarr Conventions found: {conventions.length}
      <ZarrConventionsTooltip></ZarrConventionsTooltip>
    </h2>
    <DetailsPrePanel jsonData={conventions} summary="zarr_conventions" />

    {#if assets.length > 0}
      <h3>Metadata assets</h3>
      <ul>
        {#each assets as asset}
          <li>
            <a href={assetUrl(asset.href)} target="_blank">{asset.href}</a>
            {#if asset.kind}<span class="badge">{asset.kind}</span>{/if}
            {#if asset.media_type}<span class="badge">{asset.media_type}</span>{/if}
            {#if asset.attributes}
              <DetailsPrePanel jsonData={asset.attributes} summary="attributes" />
            {/if}
          </li>
        {/each}
      </ul>
    {/if}
  {:else}
    <p>No Zarr Conventions found <ZarrConventionsTooltip></ZarrConventionsTooltip></p>
  {/if}
</div>

<style>
  .zarr-conventions {
    border-radius: 10px;
    padding: 15px 0;
    margin: 15px 0;
    box-shadow: 5px 5px 10px #c3c0c0;
    background: linear-gradient(to right, #ccc, #aaa);
    text-align: center;
  }

  .zarr-conventions ul {
    list-style: none;
    padding: 0;
    margin: 10px 0;
    text-align: left;
    display: inline-block;
  }

  .zarr-conventions li {
    margin: 6px 0;
  }

  .zarr-conventions a,
  .zarr-conventions a:visited {
    color: var(--omeLinkBlue);
  }

  .badge {
    display: inline-block;
    margin-left: 8px;
    padding: 2px 8px;
    font-size: 0.8em;
    border-radius: 10px;
    background-color: #555;
    color: #fff;
  }
</style>
