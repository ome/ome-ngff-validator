<script>
  import MultiscaleArrays from "./MultiscaleArrays/index.svelte";
  import Plate from "./Plate/index.svelte";
  import Well from "./Well/index.svelte"
  import JsonBrowser from "../JsonBrowser/index.svelte";
  import CheckMark from "../CheckMark.svelte";
  import LabelsInfoLink from "./Labels/LabelsInfoLink.svelte";
  import OpenWith from "./OpenWith.svelte";
  import {
    CURRENT_VERSION,
    getSchemaUrlsForJson,
    validate,
    getJson,
    getVersion,
    getDataType,
  } from "../utils";

  export let source;
  export let rootAttrs;

  const msVersion = getVersion(rootAttrs);

  const dtype = getDataType(rootAttrs);
  const schemaUrls = getSchemaUrlsForJson(rootAttrs);
  const promise = validate(rootAttrs);

  const dirs = source.split("/").filter(Boolean);
  const zarrName = dirs[dirs.length - 1];

  // check for labels/.zattrs
  const labelsPromise = getJson(source + '/labels/.zattrs');
</script>

<article>
  <p>
    Validating: <a href={source}>/{zarrName}/.zattrs</a>
  </p>

  {#if !msVersion}No version found. Using {CURRENT_VERSION}<br />{/if}

  Using schema{schemaUrls.length > 1 ? "s" : ""}: 
  {#each schemaUrls as url, i}
    {i > 0 ? " and " : ""}
    <a href={url} target="_blank">{url.split("main")[1]}</a>
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

{#if rootAttrs.multiscales}
  <MultiscaleArrays {source} {rootAttrs} />
{:else if rootAttrs.plate}
  <Plate {source} {rootAttrs} />
{:else if rootAttrs.well}
  <Well {source} {rootAttrs} />
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

  .viewer_icon {
    height: 24px;
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
