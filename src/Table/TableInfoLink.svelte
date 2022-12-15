<script>

  export let source;
  export let tablesAttrs;

  console.log("TABLE tablesAttrs:", tablesAttrs);

  const url = window.location.origin + window.location.pathname;

  let tableNames;
  if (tablesAttrs.tables) {
    tableNames = tablesAttrs.tables;
  }
</script>

<div>
  Tables:

  {#if tableNames}
    <ul>
    {#each tableNames as tableName}
      <li><a title="Open Table" href="{url}?source={source}tables/{tableName}/">{tableName}</a></li>
    {/each}
    </ul>
  {:else}
    <div style="color:red">tables/.zattrs has no 'tables' list</div>
  {/if}

  <details>
    <summary>tables/.zattrs</summary>
    <pre><code>{JSON.stringify(tablesAttrs, null, 2)}</code></pre>
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
