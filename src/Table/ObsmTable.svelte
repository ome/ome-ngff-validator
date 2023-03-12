<script>
  import { getJson } from "../utils";
  import { AnnDataSource } from "../vitessce-utils";

  export let source;

  const annDataStore = new AnnDataSource({ url: source });

  async function loadObsmData() {
    // obsm is "dense matrices annotating each row. For example, the coordinates of the
    // centroid of each labeled object (Nx3 array for N cells in 3D) or output dimensions
    // of a dimentionality reduction algorithm.""
    let obsmAttrs = await getJson(source + "/obsm/.zattrs");

    // NB: we rely on custom listing of "keys" in the obsm/.zattrs
    // See https://github.com/kevinyamauchi/ome-ngff-tables-prototype/pull/12/commits/284406d1a309203bef9d58aca76817c66ebb5912
    let obsmDataNames = obsmAttrs["keys"];
    if (obsmDataNames == undefined) {
      throw Error("No 'keys' list found in obsm/.zattrs as required by OME-NGFF spec")
    }
    let toLoad = obsmDataNames.map((colName) => `obsm/${colName}`);
    // NB: some unsupported '<i8' dtype columns may have failed (undefined)
    // each obsm is a ND array of data.
    const data = await annDataStore.loadObsColumns(toLoad);
    const obsmData = {};
    obsmDataNames.forEach((colName, i) => {
      obsmData[colName] = data[i];
    });

    return {
      colNames: obsmDataNames,
      rowData: obsmData,
    };
  }

  const promise = loadObsmData();
</script>

{#await promise}
  <p>Loading Obsm...</p>
{:then data}
  {#if data.colNames.length > 0}
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
  {:else}
    <p>No obsm data</p>
  {/if}
{:catch error}
  <p style="color: red">Failed to load obsm {error}</p>
{/await}

<style>
  .obsm {
    background-color: rgb(237, 144, 50);
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
    margin: 20px;
    text-align: left;
  }
</style>
