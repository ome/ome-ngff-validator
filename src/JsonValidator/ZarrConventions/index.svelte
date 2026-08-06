    <script>
    import ZarrConventionsTooltip from "./ZarrConventionsTooltip.svelte";
    import JsonBrowser from "../../JsonBrowser/index.svelte";

    export let source;
    export let rootAttrs;

    const zarrAttrs = rootAttrs?.attributes || rootAttrs;

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
    }
    </script>

    <div class="zarr-conventions">
    {#if conventions.length > 0}
        <h3>
        Zarr Conventions found: {conventions.length}
        <ZarrConventionsTooltip></ZarrConventionsTooltip>
        </h3>
        <div class="json">
        <JsonBrowser
        name=""
        contents={{ "zarr_conventions": conventions }}
        expanded={false}
        />
        </div>
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

    .badge {
        display: inline-block;
        margin-left: 8px;
        padding: 2px 8px;
        font-size: 0.8em;
        border-radius: 10px;
        background-color: #6e6c6c60;
        color: rgb(27, 27, 27)000;
    }
    </style>
