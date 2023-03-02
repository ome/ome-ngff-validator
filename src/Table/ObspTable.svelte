<script>
  import { getJson, range } from "../utils";
  import { AnnDataSource } from "../vitessce-utils";

  export let source;

  const PAGE_SIZE = 100;

  const annDataStore = new AnnDataSource({ url: source });

  async function loadObsmData() {
    let obsmAttrs = await getJson(source + "obsp/.zattrs");

    // NB: we rely on custom listing of "keys" in the obsp/.zattrs
    // See https://github.com/kevinyamauchi/ome-ngff-tables-prototype/pull/12/commits/284406d1a309203bef9d58aca76817c66ebb5912
    let obspDataNames = obsmAttrs["keys"];
    if (obspDataNames == undefined) {
      throw Error(
        "No 'keys' list found in obsp/.zattrs as required by OME-NGFF spec"
      );
    }

    const obspData = {};
    for (let k = 0; k < obspDataNames.length; k++) {
      let colName = obspDataNames[k];
      let sparseData = await annDataStore.loadSparseData(
        "obsp/" + colName,
        PAGE_SIZE
      );
      obspData[colName] = sparseData;
    }

    return {
      colNames: obspDataNames,
      rowData: obspData,
    };
  }

  const promise = loadObsmData();
</script>

{#await promise}
  <p>Loading Obsm...</p>
{:then data}
  <table>
    <thead>
      <th class="row obsm">Row</th>
      {#each data.colNames as matrixName}
        {#each data.rowData[matrixName][0] as x}
          <!-- duplicate obsm name for each column of matrix -->
          <th class="obsm">{matrixName}</th>
        {/each}
      {/each}
    </thead>
    <tbody>
      {#each data.rowData[data.colNames[0]] as firstM, rowIndex}
        <tr>
          <th class="obsm">{rowIndex}</th>
          {#each data.colNames as matrixName}
            {#each data.rowData[matrixName][rowIndex] as value}
              <td class="obsm">
                <!-- If matrix is more than 2D, this value will be a list -->
                {value}
              </td>
            {/each}
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
{:catch error}
  <p style="color: red">Failed to load obsm {error}</p>
{/await}

<style>
  .obsm {
    background-color: rgb(224, 102, 96);
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
    white-space: nowrap;
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

  p {
    margin-top: 20px;
    text-align: left;
  }
</style>
