<script>
import ZarrConventionsTooltip from "./ZarrConventionsTooltip.svelte";
import JsonBrowser from "../../JsonBrowser/index.svelte";
export let source;
export let rootAttrs;
const zarrAttrs = rootAttrs?.attributes || rootAttrs;
const attrKeys = Object.keys(zarrAttrs);
const conventions = zarrAttrs?.zarr_conventions || [];
const assets = zarrAttrs?.metadata_assets || [];
const isAbsolute = (href) => /^https?:\/\//i.test(href) || href?.startsWith("/");
const assetUrl = (href) => (isAbsolute(href) ? href : `${source}/${href}`);
const kindMap = {
    "ro-crate": "https://www.researchobject.org/ro-crate/",
    "croissant": "https://docs.mlcommons.org/croissant/",
    "ome-xml": "https://ome-model.readthedocs.io/en/stable/ome-xml/",
    "czi-xml": "https://www.zeiss.com/microscopy/en/products/software/zeiss-zen/czi-image-file-format.html",
    "datapackage": "https://datapackage.org/",
};

// For each convention: collect its name (if present) and check whether
// that name actually appears in the root attributes. A convention that's
// stated but has no matching key is "stated but not used".
const names = conventions.map((c) => c.name).filter(Boolean);
const unusedConventions = conventions.filter(
    (c) => c.name && !(c.name in zarrAttrs)
);
</script>
<div class="zarr-conventions">
{#if conventions.length > 0}
    <h3>
    Zarr Conventions found: {conventions.length}
    <ZarrConventionsTooltip></ZarrConventionsTooltip>
    </h3>

{#each conventions as convention, index}
    <!--
        Each Convention Metadata Object MUST contain at least one of the following fields:
        uuid, schema_url, or spec_url.
    -->

<!-- The zarr_conventions attribute MUST be an array of Convention Metadata Objects (CMO).
Each CMO:
https://github.com/zarr-conventions/zarr-conventions-spec

At least one of schema_url, spec_url, or uuid MUST be present.
If uuid is present, it serves as the primary unique identifier for the Convention.
If uuid is not present and both schema_url and spec_url are present, the schema_url serves as the identifier.
If only spec_url is present (and no uuid), it serves as the identifier.
If the Convention uses versioning, the schema_url
SHOULD include a reference to the specific version (e.g., v1)
and the spec_url MAY include a reference to the specific version.
The Convention SHOULD provide a convenient way to find the specification associated with each version.

Additionally, a Convention Metadata Object SHOULD contain the following fields:

    name - a short human-readable name
    schema_url and spec_url - when using uuid as the primary identifier, they are RECOMMENDED
 -->

 <!-- Each Convention Metadata Object MUST contain at least one of the following fields: -->

          {#if convention.name}
            <h4>Convention {index + 1}: <code>{convention.name}</code></h4 >
          {:else}
            <h4>Convention {index + 1}</h4>
          {/if}
         {#if !(convention.uuid || convention.schema_url || convention.spec_url)}
            <p class="warning">
                Convention must have at least one of uuid, schema_url, or spec_url
            </p>
        {:else}
            <p>
                {#if convention.uuid}
                    UUID: <code>{convention.uuid}</code>
                {/if}
                {#if convention.schema_url}
                    <a href={convention.schema_url} target="_blank">Schema URL</a>
                {/if}
                {#if convention.spec_url}
                    <a href={convention.spec_url} target="_blank">Spec URL</a>
                {/if}
            </p>
        {/if}

    <!-- Spec says:

         If the Convention isolates metadata using a namespace prefix or a key for nesting,
         the name SHOULD match the namespace prefix (e.g., proj:)
         or the key used to nest attributes (e.g., ome), depending on which method is used.
        -->

          {#if convention.name}
            <!-- TODO: check for namespace prefixes (e.g. ome:)-->
            {#if !(convention.name in zarrAttrs)}
                <p class="warning">
                  <code>{convention.name}</code> not found in the attributes
                </p>
                <p>Found: <code>{attrKeys.filter((k) => k !== "zarr_conventions")}</code></p>

            {/if}
        {:else}
            <p>(No name provided for convention)</p>
        {/if}
    {/each}

    {#if assets.length > 0}
    <h3>Metadata assets</h3>
    <div class="metadata-assets">
    <ul>
        {#each assets as asset}
        <li>
            <a href={assetUrl(asset.href)} target="_blank">{asset.href}</a>
            {#if asset.kind}
                {#if kindMap[asset.kind]}
                    <span class="badge"><a href={kindMap[asset.kind]} target="_blank">{asset.kind}</a></span>
                {:else}
                    <span class="badge">{asset.kind}</span>
                {/if}
            {/if}
            </li>
        {/each}
    </ul>
    </div>
    {/if}
{:else}
    <p>No Zarr Conventions found <ZarrConventionsTooltip></ZarrConventionsTooltip></p>
{/if}
</div>
<style>
.metadata-assets ul {
    list-style: none;
    margin: 10px 0;
    text-align: left;
    display: inline-block;
}
.json {
    text-align: left;
    margin-top: 10px;
    margin: 15px;
    margin-bottom: 20px;
    color: #faebd7;
    background-color: #263749;
    padding: 20px;
    font-size: 14px;
    border-radius: 10px;
    font-family: monospace;
}
.zarr-conventions {
    border-radius: 10px;
    padding: 15px 0;
    margin: 15px 0;
    margin-top: 30px;
    margin-bottom: 30px;
    box-shadow: 5px 5px 10px #c3c0c0;
    background: linear-gradient(to right, #ccc, #aaa);
    text-align: center;
}
.warning {
    color: #8a761c;
    font-weight: bold;
}
.badge {
    display: inline-block;
    margin-left: 8px;
    padding: 2px 8px;
    font-size: 0.8em;
    border-radius: 10px;
    background-color: #6e6c6c60;
    color: rgb(27, 27, 27);
}
</style>
