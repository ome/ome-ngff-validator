<script>
    import { getJson, range } from "../utils";
    import { AnnDataSource } from "../vitessce-utils";
  
    export let source;
  
    const annDataStore = new AnnDataSource({ url: source });
  
    async function loadTableData() {
  
      // 'var' array contains column metadata
      let varAttrs = await getJson(source + "var/.zattrs");
      let varColNames = varAttrs["column-order"];
      let toLoad = varColNames.map((colName) => `var/${colName}`);
      let varData = await annDataStore.loadObsColumns(toLoad);
  
      // load xColNames and xRowData for X table
      // FIXME: don't hard-code 'var/_index' - not universal
      let columns = ["var/_index", "X"];
      let data = await annDataStore.loadObsColumns(columns);
      let xColNames = data[0];
      const xRowData = data[1];

      // in case 'var/_index' isn't loaded, just use column index:
      if (!xColNames) {
        // use first row of X to get column count:
        const colCount = xRowData[0].length;
        console.log("colCount....", xRowData[0], colCount)
        xColNames = range(colCount);
      }
      console.log({xColNames,xRowData,varColNames,varData})

      return {
        xColNames,
        xRowData,
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
              {#each data.xColNames as colName, colIndex}
                <th class="var">
                  {colName}
                  <!-- hover popup with column metadata -->
                  <ul class="tooltip var">
                    <li>var:</li>
                    {#each data.varColNames as varAttr, i}
                      <li>
                        <span class="key">{varAttr}</span>:
                        {data.varData?.[i]?.[colIndex]}
                      </li>
                    {/each}
                  </ul>
                </th>
              {/each}
            </thead>
            <tbody class="X">
              {#each data.xRowData as xRowData, rowIndex}
                <tr>
                  <th class="X">{rowIndex}</th>
                  {#each xRowData as cellData}
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
  