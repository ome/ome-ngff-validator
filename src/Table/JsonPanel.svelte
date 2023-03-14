<script>
  import { getJson } from "../utils";

  export let title;
  export let urls;

  const promise = Promise.all(urls.map(async (url) => getJson(url)));
</script>

{#await promise}
  <p>Loading {title}...</p>
{:then jsonObjs}
  <details>
    <summary>{title}</summary>
    {#each jsonObjs as jsonData}
      <pre><code>{JSON.stringify(jsonData, null, 2)}</code></pre>
    {/each}
  </details>
{:catch error}
  <p style="color: red">Failed to load {urls} {error}</p>
{/await}

<style>
  p {
    margin-top: 20px;
    text-align: left;
  }

  pre {
    color: #faebd7;
    background-color: #2c3e50;
    padding: 8px;
    font-size: 14px;
    margin: 3px;
  }
</style>
