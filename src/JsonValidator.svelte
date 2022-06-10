<script>
  import MultiscaleArrays from "./MultiscaleArrays.svelte";
  import Plate from "./Plate.svelte";
  import {
    CURRENT_VERSION,
    getSchemaUrlForJson,
    validate,
    getVersion,
  } from "./utils";

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
</article>

<article>
  <details>
    <summary>{zarrName}/.zattrs</summary>
    <pre><code>
        {JSON.stringify(rootAttrs, null, 2)}
    </code>
    </pre>
  </details>
</article>

{#if rootAttrs.multiscales}
  <MultiscaleArrays {source} {rootAttrs} />
{:else if rootAttrs.plate}
  <Plate {source} {rootAttrs} />
{/if}

<style>
  article {
    color: #343a40;
    border: solid #ddd 1px;
    border-radius: 10px;
    padding: 15px;
    background: white;
    margin: 20px 0;
    text-align: center;
    box-shadow: 10px 10px 20px rgba(125, 22, 2, 0.5);
  }

  a,
  a:visited {
    color: #ff512f;
  }

  summary {
    font-size: 1.2em;
  }

  pre {
    margin-top: 10px;
    color: #faebd7;
    background-color: #2c3e50;
    padding: 10px;
    font-size: 14px;
    border-radius: 10px;
  }

  .error pre {
    color: black;
    background-color: wheat;
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

  details {
    text-align: left;
  }
</style>
