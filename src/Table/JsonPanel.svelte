<script>
  import { getJson } from "../utils";

  export let title;
  export let url;

  const promise = getJson(url);
</script>

{#await promise}
  <p>Loading {title}...</p>
{:then jsonData}
  <details>
    <summary>{title}</summary>
    <pre><code>{JSON.stringify(jsonData, null, 2)}</code></pre>
  </details>
{:catch error}
  <p style="color: red">Failed to load {url} {error}</p>
{/await}

<style>
  p {
    margin-top: 20px;
    text-align: left;
  }

  pre {
    color: #faebd7;
    background-color: #2c3e50;
    padding: 10px;
    font-size: 14px;
  }
</style>
