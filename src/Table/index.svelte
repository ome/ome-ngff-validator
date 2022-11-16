<script>
  import { each } from "svelte/internal";

  import { loadTable, range } from "../utils";
  import { AnnDataSource } from "../vitessce-utils";

  export let source;
  export let tableAttrs;

  const annDataStore = new AnnDataSource({ url: source });

  async function loadTableData() {
    // E.g. "obs/cell_id" fails with: Error: Dtype not recognized or not supported in zarr.js, got <i8.
    // "obs/category/categories" loads a list of categories, e.g. ["carcinoma"]
    // and "obs/category/codes" loads a list of indecies for those, e.g. [0, 0, ]
    // let columns = ["obs/category/codes", "obs/X1", "obs/center_rowcoord", "obs/center_colcoord"];

    // column names for the main table data, and other stats:
    // let columns = ["var/_index", "var/mean-0"];

    let varAttrs = await loadTable(source, "var");
    let varColNames = varAttrs["column-order"];
    let toLoad = varColNames.map(colName => `var/${colName}`);
    let varData = await annDataStore.loadObsColumns(toLoad);

    let columns = ["var/_index", "X"];
    let data = await annDataStore.loadObsColumns(columns);

    return {
      colNames: data[0],
      rowData: data[1],
      varColNames,
      varData,
    };
  }

  const tableDataPromise = loadTableData();

  const tablePromise = loadTable(source);

  console.log("TABLE", tableAttrs);
</script>

<article>
  <!-- code blocks for JSON for the table itself and the required 'obs' group -->
  <div>
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
    {:catch error}
      <p style="color: red">Failed to load /obs/.zattrs {error}</p>
    {/await}
  </div>

  <!-- Show the main X data table -->
  <div class="tableScroller">
    {#await tableDataPromise}
      <p>Loading data...</p>
    {:then data}
      <table>
        <thead>
          <th>Row</th>
          {#each data.colNames as colName, colIndex}
            <th>
              {colName}
              <ul class="tooltip">
                <li>var:</li>
                {#each data.varColNames as varAttr, i}
                <li>
                  <span class="key">{varAttr}</span>:
                  {data.varData[i][colIndex]}
                </li>
                {/each}
              </ul>
            </th>
          {/each}
        </thead>
        <tbody>
        {#each data.rowData as rowData, i}
          <tr>
            <td>{i}</td>
            {#each rowData as cellData}
              <td>{cellData}</td>
            {/each}
          </tr>
        {/each}
        </tbody>
      </table>
    {:catch error}
      <p style="color: red">{error}</p>
    {/await}
  </div>
</article>

<style>
  article {
    display: flex;
    flex-direction: column;
  }

  article>div {
    flex: 0;
  }

  .tableScroller {
    flex: 1;
    position: relative;
    width: 100%;
    overflow: auto;
  }
  article {
    text-align: left;
  }

  @media (min-width: 0) {
    article {
      width: 100%;
      height: calc(100% - 100px);
    }
  }

  table {
    border-collapse: collapse;
    border-spacing: 0;
  }

  td,
  th {
    border: solid #ddd 1px;
    padding: 5px;
    width: 100px;
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  th {
    vertical-align: middle;
    text-align: center;
    position: sticky;
    top: 0;
    left: 0;
    background: white;
    z-index: 1;
    border-width: 0;
    overflow: visible;
  }

  .tooltip {
    position: absolute;
    text-align: left;
    padding: 5px;
    font-weight: normal;
    top: 110%;
    z-index: 2;
    background: rgb(51, 151, 190);
    visibility: hidden;
    border: 1px solid #666;
    border-radius: 5px;
    color: white;
  }
  th:hover .tooltip {
    visibility: visible;
  }

  li {
    list-style: none;
    white-space: nowrap;
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
