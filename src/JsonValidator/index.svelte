<script>
  import MultiscaleArrays from "./MultiscaleArrays/index.svelte";
  import Plate from "./Plate/index.svelte";
  import Well from "./Well/index.svelte"
  import JsonBrowser from "../JsonBrowser/index.svelte";
  import {
    CURRENT_VERSION,
    getSchemaUrlForJson,
    validate,
    getVersion,
  } from "../utils";

  export let source;
  export let rootAttrs;

  const msVersion = getVersion(rootAttrs);

  const schemaUrl = getSchemaUrlForJson(rootAttrs);
  const shortenedUrl = schemaUrl.split("main")[1];
  const promise = validate(rootAttrs);

  const dirs = source.split("/").filter(Boolean);
  const zarrName = dirs[dirs.length - 1];
</script>

<article>
  Validating: <a href={source}>{zarrName}/.zattrs</a><br />

  {#if !msVersion}No version found. Using {CURRENT_VERSION}<br />{/if}

  Using schema: <a href={schemaUrl} target="_blank">{shortenedUrl}</a>

  {#await promise}
    <div>loading schema...</div>
  {:then errors}
    {#if errors.length > 0}
      <div class="invalid">×</div>
      <div class="error">
        Errors:
        {#each errors as error}
          <pre><code>{JSON.stringify(error, null, 2)}</code></pre>
        {/each}
      </div>
    {:else}
      <div class="valid">✓</div>
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

  .error pre {
    margin-top: 10px;
    color: black;
    background-color: wheat;
    padding: 10px;
    font-size: 14px;
    border-radius: 10px;
  }

  .invalid,
  .valid {
    border-radius: 50%;
    padding: 10px;
    margin: 10px auto;
    color: white;
    width: 100px;
    height: 100px;
    font-size: 50px;
    text-align: center;
    padding: 15px;
  }
  .invalid {
    background-color: red;
    border: solid red 1px;
  }

  .valid {
    background-color: green;
    border: solid green 1px;
  }

  .error {
    text-align: left;
    overflow: auto;
    background-color: wheat;
    padding: 10px;
    border-radius: 10px;
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
</style>
