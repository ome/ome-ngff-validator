<script>
    import { getJson } from "../utils";
    import { AnnDataSource } from "../vitessce-utils";
  
    export let source;
  
    const annDataStore = new AnnDataSource({ url: source });
  
    async function loadTableData() {
      // E.g. "obs/cell_id" fails with: Error: Dtype not recognized or not supported in zarr.js, got <i8.
      // "obs/category/categories" loads a list of categories, e.g. ["carcinoma"]
      // and "obs/category/codes" loads a list of indecies for those, e.g. [0, 0, ]
      // let columns = ["obs/category/codes", "obs/X1", "obs/center_rowcoord", "obs/center_colcoord"];
  
      // column names for the main table data, and other stats:
      // let columns = ["var/_index", "var/mean-0"];
  
      let varAttrs = await getJson(source + "var/.zattrs");
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

  </script>
  
      {#await tableDataPromise}
        <p>Loading X data...</p>
      {:then data}
          <table>
            <thead>
              <th class="var row">Row</th>
              {#each data.colNames as colName, colIndex}
                <th class="var">
                  {colName}
                  <ul class="tooltip var">
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
            <tbody class="X">
              {#each data.rowData as rowData, rowIndex}
                <tr>
                  <th class="X">{rowIndex}</th>
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
  
  <style>
  
    .X {
      background-color: rgb(84, 185, 114);
    }
  
    .var {
      background-color: rgb(51, 151, 190);
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
      left: 0px;
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
  </style>
  