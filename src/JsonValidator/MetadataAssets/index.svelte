<script>
  export let source;
  export let traits = [];

  const TRAIT = "https://ngff.openmicroscopy.org/extensions/metadata_assets";
  const assets = traits.filter((t) => t?.type === TRAIT).flatMap((t) => t.assets || []);
  const assetUrl = (href) => (/^https?:\/\//i.test(href) ? href : `${source}/${href.replace(/^\.\//, "")}`);
  const kindMap = {
    "ro-crate": "https://www.researchobject.org/ro-crate/",
    croissant: "https://docs.mlcommons.org/croissant/",
    "ome-xml": "https://ome-model.readthedocs.io/en/stable/ome-xml/",
    "czi-xml": "https://www.zeiss.com/microscopy/en/products/software/zeiss-zen/czi-image-file-format.html",
    datapackage: "https://datapackage.org/",
  };
</script>

{#if assets.length > 0}
  <div class="assets">
    <h1><a href={TRAIT} target="_blank">Metadata assets</a></h1>
    <ul>
      {#each assets as asset}
        <li>
          <a href={assetUrl(asset.href)} target="_blank">{asset.href}</a>
          {#if asset.kind}
            <span class="badge">
              {#if kindMap[asset.kind]}<a href={kindMap[asset.kind]} target="_blank">{asset.kind}</a>{:else}{asset.kind}{/if}
            </span>
          {/if}
          {#if asset.media_type}<code>{asset.media_type}</code>{/if}
        </li>
      {/each}
    </ul>
  </div>
{/if}

<style>
  .assets {
    border-radius: 10px;
    padding: 15px 0;
    margin: 15px 0;
    box-shadow: 5px 5px 10px #c3c0c0;
    background: linear-gradient(to right, #ccc, #aaa);
    text-align: center;
  }
  h1 a, h1 a:visited { color: inherit; text-decoration: none; }
  ul { list-style: none; display: inline-block; text-align: left; margin: 0; padding: 0; }
  li { margin: 5px 0; }
  .badge {
    margin-left: 8px;
    padding: 2px 8px;
    font-size: 0.8em;
    border-radius: 10px;
    background-color: #6e6c6c60;
  }
  code { margin-left: 8px; font-size: 0.8em; color: #444; }
</style>
