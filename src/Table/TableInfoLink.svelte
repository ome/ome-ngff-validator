<script>
  import { each } from "svelte/internal";
import { parseConsolidatedMetadata } from "../utils";

  export let source;
  export let consolidatedMetadata;

  console.log("TABLE", consolidatedMetadata);

  const url = window.location.origin + window.location.pathname;

  const tableMetadata = parseConsolidatedMetadata(consolidatedMetadata);

  const tableNames = Object.keys(tableMetadata).filter(key => key[0] != ".");
</script>

<div>
  Tables:

  <ul>
  {#each tableNames as tableName}
    <li><a title="Open Table" href="{url}?source={source}tables/{tableName}/">{tableName}</a></li>
  {/each}
  </ul>

  <details>
    <summary>tables/.zmetadata</summary>
    <pre><code>{JSON.stringify(consolidatedMetadata, null, 2)}</code></pre>
  </details>
</div>

<style>
  div {
    margin-top: 20px;
    text-align: left;
  }
  li {
    list-style: none;
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
