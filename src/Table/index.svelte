<script>
  import { loadTable } from "../utils";
  import { AnnDataSource } from "../vitessce-utils";

  export let source;
  export let tableAttrs;

  let showObsInfo = false;
  let obsColNames;
  let obsData;

  function toggleObsInfo() {
    showObsInfo = !showObsInfo;
    if (!obsData) {
      loadObsData();
    }
  }

  const annDataStore = new AnnDataSource({ url: source });

  async function loadObsData() {
    let obsAttrs = await loadTable(source, "obs");

    // manually validate without a schema...
    // `.zattrs` MUST contain `"_index"`, which is the name of the column in obs to be used as the index.
    // `.zattrs` MUST contain `"column-order"`, which is a list of the order of the non-_index columns.
    // `.zattrs` MUST contain `"encoding-type"`, which is set to `"dataframe"` by AnnData.
    // `.zattrs` MUST contain `"encoding-version"`, which is set to `"0.2.0"` by AnnData.
    ["_index", "column-order", "encoding-type", "encoding-version"].forEach(
      (attr) => {
        if (!obsAttrs[attr]) {
          throw Error(`No ${attr} in obs/.zattrs`);
        }
      }
    );

    obsColNames = obsAttrs["column-order"];

    let toLoad = obsColNames.map((colName) => `obs/${colName}`);
    // NB: some unsupported '<i8' dtype columns may have failed (undefined)
    obsData = await annDataStore.loadObsColumns(toLoad);
  }

  async function loadTableData() {
    // E.g. "obs/cell_id" fails with: Error: Dtype not recognized or not supported in zarr.js, got <i8.
    // "obs/category/categories" loads a list of categories, e.g. ["carcinoma"]
    // and "obs/category/codes" loads a list of indecies for those, e.g. [0, 0, ]
    // let columns = ["obs/category/codes", "obs/X1", "obs/center_rowcoord", "obs/center_colcoord"];

    // column names for the main table data, and other stats:
    // let columns = ["var/_index", "var/mean-0"];

    let varAttrs = await loadTable(source, "var");
    let varColNames = varAttrs["column-order"];
    let toLoad = varColNames.map((colName) => `var/${colName}`);
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

  // we have separate tables for X and obs so that each
  // can scroll in x-dimension independently, BUT we want
  // to syncronise the scrolling in y -> need JS solution
  let table1;
  let table2;
  function handleScroll(event) {
    if (event.target.id == "scroll1") {
      if (table2) {
        table2.scrollTop = event.target.scrollTop;
      }
    } else {
      table1.scrollTop = event.target.scrollTop;
    }
  }
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

    <button class="obs" on:click={toggleObsInfo}>Load obs</button>
  </div>

  <!-- Show the main X data table -->
  <div class="tablesContainer">
    {#await tableDataPromise}
      <p>Loading data...</p>
    {:then data}
      <!-- two tables side by side -->
      <div
        id="scroll1"
        class="tableScroller"
        on:scroll={handleScroll}
        bind:this={table1}
      >
        <table>
          <thead>
            <th class="row">Row</th>
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
            {#each data.rowData as rowData, rowIndex}
              <tr>
                <th>{rowIndex}</th>
                {#each rowData as cellData}
                  <td>{cellData}</td>
                {/each}
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <!-- If we've loaded obsData, add extra table -->
      {#if obsData && showObsInfo}
        <div
          id="scroll2"
          class="tableScroller"
          on:scroll={handleScroll}
          bind:this={table2}
        >
          <table>
            <thead>
              <th class="obs row">Row</th>
              {#each obsColNames as colName}
                <th class="obs">{colName}</th>
              {/each}
            </thead>
            <tbody>
              {#each data.rowData as rowData, rowIndex}
                <tr>
                  <th class="obs">{rowIndex}</th>
                  {#each obsColNames as colName, obsIndex}
                    <td class="obs">
                      <!-- check if column has loaded -->
                      {#if obsData[obsIndex]}
                        {obsData[obsIndex][rowIndex]}
                      {/if}
                    </td>
                  {/each}
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
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

  button {
    padding: 5px;
    border-radius: 5px;
    border: solid 1px #666;
  }

  .obs {
    background-color: rgb(238, 195, 54);
  }

  article > div {
    flex: 0;
  }

  .tablesContainer {
    flex: 1;
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: row;
    overflow-y: auto;
  }

  .tableScroller {
    overflow: auto;
    flex: 1;
  }
  #scroll2 {
    flex: 0.5;
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
    padding: 3px;
    width: 90px;
    max-width: 90px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  th {
    vertical-align: middle;
    text-align: center;
    position: sticky;
    top: 0;
    left: 50px;
    background: white;
    z-index: 1;
    border-width: 0;
    overflow: visible;
  }

  tbody th,
  th.row {
    left: 0;
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
