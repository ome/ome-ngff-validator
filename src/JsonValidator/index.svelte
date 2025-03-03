<script>
  import MultiscaleArrays from "./MultiscaleArrays/index.svelte";
  import Plate from "./Plate/index.svelte";
  import RoCrate from "./RoCrate/index.svelte";
  import Well from "./Well/index.svelte";
  import JsonBrowser from "../JsonBrowser/index.svelte";
  import CheckMark from "../CheckMark.svelte";
  import LabelsInfoLink from "./Labels/LabelsInfoLink.svelte";
  import OpenWith from "./OpenWithViewers/index.svelte";
  import Thumbnail from "./Thumbnail/index.svelte";

  import {
    CURRENT_VERSION,
    getSchemaUrlsForJson,
    validate,
    getJson,
    getVersion,
    getDataType,
    getZarrGroupAttrsFileName,
  } from "../utils";

  export let source;
  export let rootAttrs;

  let versionMessage = "";
  let version = null;
  // Initial validation of version
  // Top level 'version' is required "MUST" for v0.5+
  if (rootAttrs?.attributes?.ome) {
    if (!rootAttrs.attributes.ome.version) {
      versionMessage = "Missing 'version' field under attributes.ome.";
    } else {
      version = rootAttrs.attributes.ome.version;
      versionMessage = `Using version ${version}.`;
    }
  } else {
    // version for older versions can be nested under "multiscales" or "plate" or "well"
    version = getVersion(rootAttrs);
    if (!version) {
      versionMessage = "No version found. Using version 0.4.";
      version = "0.4";
    } else {
      versionMessage = `Using version ${version}.`;
    }
  }

  // v0.5+ unwrap the attrs under "ome"
  const omeAttrs = rootAttrs?.attributes?.ome || rootAttrs;

  // For Plate or Well, we need to get the first image (field '0') for Thumbnail
  const firstPlateImageUrl = omeAttrs.plate?.wells[0].path ? `${source}/${omeAttrs.plate.wells[0].path}/0` : null;
  const firstWellImageUrl = omeAttrs.well ? `${source}/0` : null;

  const dtype = getDataType(omeAttrs);
  const schemaUrls = getSchemaUrlsForJson(omeAttrs);
  console.log("index.svelte schemaUrls", schemaUrls);
  const promise = validate(rootAttrs);

  const dirs = source.split("/").filter(Boolean);
  const zarrName = dirs[dirs.length - 1];

  // check for labels/.zattrs
  const zarrAttrsFileName = getZarrGroupAttrsFileName(version);
  const labelsPromise = getJson(source + "/labels/" + zarrAttrsFileName);
</script>

<article>
  <div class="thumbnail_row">
    <div class="thumbnail_wrapper">
      <Thumbnail source = {firstPlateImageUrl || firstWellImageUrl || source} targetSize=150 />
    </div>
  </div>
  <div class="validation_row">
      <p>
        Validating: <a href="{source}/{zarrAttrsFileName}"
          >/{zarrName}/{zarrAttrsFileName}</a
        >
        <br />
        {versionMessage}

        Using schema{schemaUrls.length > 1 ? "s" : ""}: <br>
        {#each schemaUrls as url, i}
          {i > 0 ? " and " : ""}
          <a href={url} target="_blank">{url.split("ngff")[1]}</a>
        {/each}
      </p>

    <div class="checkmark">
      {#await promise}
        <div>loading schema...</div>
      {:then errors}
        <CheckMark valid={errors.length == 0} />
        {#if errors.length > 0}
          <div class="error">
            Errors:
            {#each errors as error}
              <pre><code>{JSON.stringify(error, null, 2)}</code></pre>
            {/each}
          </div>
        {/if}
      {:catch error}
        <CheckMark valid={false} />
        <p style="color: red">{error.message}</p>
      {/await}
    </div>
  </div>

  <OpenWith {source} {dtype} {version} />

  <div class="json">
    <JsonBrowser
      name=""
      version={version || CURRENT_VERSION}
      contents={rootAttrs}
      expanded
    />
  </div>

  <!-- for v0.5+ we check for ro-crate-metadata.json -->
  {#if !["0.1", "0.2", "0.3", "0.4"].includes(version)}
    <RoCrate {source}></RoCrate>
  {/if}

  {#await labelsPromise}
    <p>checking for labels...</p>
  {:then labelsAttrs}
    <LabelsInfoLink {labelsAttrs} {source} {zarrAttrsFileName}></LabelsInfoLink>
  {:catch error}
    <!-- <p>No table data</p> -->
  {/await}
</article>

{#if omeAttrs.multiscales}
  <MultiscaleArrays {source} rootAttrs={omeAttrs} />
{:else if omeAttrs.plate}
  <Plate {source} rootAttrs={omeAttrs} />
{:else if omeAttrs.well}
  <Well {source} rootAttrs={omeAttrs} />
{/if}

<style>
  .thumbnail_row {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
  }
  .validation_row {
    max-width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
  }
  .thumbnail_wrapper {
    flex: 1 1 auto;
  }
  .thumbnail_row :global(.thumbnail) {
    border-radius: 6px;
    max-width: 200px;
    max-width: 200px;
  }
  .checkmark {
    flex: 0 0 auto;
  }

  a,
  a:visited {
    color: var(--omeLinkBlue);
  }
  .json {
    text-align: left;
    margin-top: 10px;
    color: #faebd7;
    background-color: #263749;
    padding: 10px;
    font-size: 14px;
    border-radius: 10px;
    font-family: monospace;
  }

  .error pre {
    margin-top: 10px;
    color: black;
    background-color: wheat;
    padding: 10px;
    font-size: 14px;
    border-radius: 10px;
  }
  .error {
    text-align: left;
    overflow: auto;
    background-color: wheat;
    padding: 10px;
    border-radius: 10px;
  }
</style>
