<script>
  import MultiscaleArrays from "./MultiscaleArrays/index.svelte";
  import Plate from "./Plate/index.svelte";
  import Well from "./Well/index.svelte"
  import JsonBrowser from "../JsonBrowser/index.svelte";
  import CheckMark from "../CheckMark.svelte";
  import LabelsInfoLink from "./Labels/LabelsInfoLink.svelte";
  import OpenWith from "./OpenWithViewers/index.svelte";

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

  // v0.5+ unwrap the attrs under "ome"
  const omeAttrs = rootAttrs.ome || rootAttrs;

  const msVersion = getVersion(rootAttrs);

  const dtype = getDataType(omeAttrs);
  const schemaUrls = getSchemaUrlsForJson(omeAttrs);
  console.log("index.svelte schemaUrls", schemaUrls)
  const promise = validate(omeAttrs);

  const dirs = source.split("/").filter(Boolean);
  const zarrName = dirs[dirs.length - 1];

  // check for labels/.zattrs
  const zarrAttrsFileName = getZarrGroupAttrsFileName(msVersion);
  const labelsPromise = getJson(source + '/labels/' + zarrAttrsFileName);
</script>

<article>
  <p>
    Validating: <a href={source}>/{zarrName}/{zarrAttrsFileName}</a>
  </p>

  {#if !msVersion}No version found. Using {CURRENT_VERSION}<br />{/if}

  Using schema{schemaUrls.length > 1 ? "s" : ""}: 
  {#each schemaUrls as url, i}
    {i > 0 ? " and " : ""}
    <a href={url} target="_blank">{url.split("ngff")[1]}</a>
  {/each}

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
    <CheckMark valid={false}/>
    <p style="color: red">{error.message}</p>
  {/await}

  <OpenWith {source} {dtype} />

  <div class="json">
    <JsonBrowser name="" version={msVersion || CURRENT_VERSION} contents={rootAttrs} expanded />
  </div>

  {#await labelsPromise}
    <p>checking for labels...</p>
  {:then labelsAttrs}
    <LabelsInfoLink {labelsAttrs} source={source}></LabelsInfoLink>
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
  a,
  a:visited {
    color: #ff512f;
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
