<script>
  import MultiscaleArrays from "./MultiscaleArrays/index.svelte";
  import Plate from "./Plate/index.svelte";
  import Well from "./Well/index.svelte"
  import JsonBrowser from "../JsonBrowser/index.svelte";
  import CheckMark from "../CheckMark.svelte";
  import {
    CURRENT_VERSION,
    getSchemaUrlForJson,
    validate,
    getVersion,
    getDataType,
  } from "../utils";
  import vizarrLogoUrl from "../assets/vizarr_logo.png"

  export let source;
  export let rootAttrs;

  const msVersion = getVersion(rootAttrs);

  const dtype = getDataType(rootAttrs);
  const schemaUrl = getSchemaUrlForJson(rootAttrs);
  const shortenedUrl = schemaUrl.split("main")[1];
  const promise = validate(rootAttrs);

  const dirs = source.split("/").filter(Boolean);
  const zarrName = dirs[dirs.length - 1];
</script>

<article>
  <a title="View {dtype} in vizarr" class="vizarr_link" target="_blank"
                href="https://hms-dbmi.github.io/vizarr/?source={source}"
                ><img src={vizarrLogoUrl}/></a>

  <!-- leave space on the right for vizarr link -->
  <p class="margin_right">
    Validating: <a href={source}>{zarrName}/.zattrs</a>
  </p>

  {#if !msVersion}No version found. Using {CURRENT_VERSION}<br />{/if}

  Using schema: <a href={schemaUrl} target="_blank">{shortenedUrl}</a>

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
    <p style="color: red">{error.message}</p>
  {/await}

  <div class="json">
    <JsonBrowser name="" version={msVersion || CURRENT_VERSION} contents={rootAttrs} expanded />
  </div>
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

  .vizarr_link {
    position: absolute;
    right: 0;
    top: 0;
  }
  .vizarr_link img {
    height: 24px;
    margin: 15px;
  }

  .margin_right {
    margin-right: 30px;
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
