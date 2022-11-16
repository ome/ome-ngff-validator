<script>
  import { each } from "svelte/internal";

  import { loadTable } from "../utils";

  export let source;
  export let tableAttrs;

  const tablePromise = loadTable(source);

  console.log("TABLE", tableAttrs);
</script>

<article>
  obs:

  <details>
    <summary>table/.zattrs</summary>

    <pre><code>{JSON.stringify(tableAttrs, null, 2)}</code></pre>
  </details>

  {#await tablePromise}
    <p>checking for obs...</p>
  {:then obsAttrs}
    <details>
      <summary>table/obs/.zattrs</summary>

      <pre><code>{JSON.stringify(obsAttrs, null, 2)}</code></pre>
    </details>

    <table>
      <tr>
        {#each obsAttrs["column-order"] as colName}
          <td>{colName}</td>
        {/each}
      </tr>
    </table>
  {:catch error}
    <p style="color: red">Failed to load /obs/.zattrs</p>
  {/await}
</article>

<style>
  article {
    text-align: left;
  }

  @media (min-width: 1000px) {
    article {
      width: 100%;
    }
  }

  table {
    border-collapse: collapse;
    border-spacing: 0;
  }

  td {
    border: solid #ddd 1px;
    padding: 5px;
  }

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

  a,
  a:visited {
    color: #ff512f;
  }
</style>
