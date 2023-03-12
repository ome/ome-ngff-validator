<script>
  import { getJson, range } from "../utils";
  import { AnnDataSource } from "../vitessce-utils";

  export let source;

  const annDataStore = new AnnDataSource({ url: source });

  async function loadObsData() {
    let obsAttrs = await getJson(source + `/obs/.zattrs`);

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

    const obsColNames = obsAttrs["column-order"];

    let toLoad = obsColNames.map((colName) => `obs/${colName}`);
    // NB: some unsupported '<i8' dtype columns may have failed (undefined)
    // each obs column is a 1D array of data. obsData is 2D list (table)
    const obsData = await annDataStore.loadObsColumns(toLoad);

    // use first valid column to get rowCount
    const rowCount = obsData.find(c => c?.length > 0).length;

    return {
      colNames: obsColNames,
      rowData: obsData,
      rowCount
    };
  }

  const promise = loadObsData();
</script>

{#await promise}
  <p>Loading Obs...</p>
{:then data}
  <table>
    <thead>
      <th class="obs row">Row</th>
      {#each data.colNames as colName}
        <th class="obs">{colName}</th>
      {/each}
    </thead>
    <tbody>
      {#each range(data.rowCount) as rowIndex}
        <tr>
          <th class="obs">{rowIndex}</th>
          {#each data.colNames as colName, obsIndex}
            <td class="obs">
              <!-- check if column has loaded -->
              {#if data.rowData[obsIndex]}
                {data.rowData[obsIndex][rowIndex]}
              {/if}
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
{:catch error}
  <p style="color: red">Failed to load obsm {error}</p>
{/await}

<style>
  .obs {
    background-color: rgb(238, 195, 54);
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
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  th {
    vertical-align: middle;
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

  p {
    margin-top: 20px;
    text-align: left;
  }
</style>
