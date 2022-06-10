<script>
      import {
    CURRENT_VERSION,
    getVersion,
    getSchema,
  } from "./utils";

    import WellContainer from "./WellContainer.svelte";

    export let source;
    export let rootAttrs;

    let plateJson = rootAttrs.plate;
    let wellPaths = plateJson.wells.map(well => well.path);
    console.log("wellPaths", wellPaths);
    const version = getVersion(rootAttrs) || CURRENT_VERSION;

    // wait for schemas to be cached, so we don't load them multiple times
    let schemasPromise = Promise.all([getSchema(version, "well"), getSchema(version, "image")]);
</script>

<article>
{#await schemasPromise}
  <div>loading schemas...</div>
{:then ok}
  <table>
    {#each plateJson.rows as row}
    <tr>
      {#each plateJson.columns as column}
        {#if wellPaths.indexOf(`${row.name}/${column.name}`) > -1}
          <WellContainer path={`${row.name}/${column.name}`} source={source} />
        {:else}
          <td></td>
        {/if}
      {/each}
    </tr>
    {/each}
  </table>
{:catch error}
  <p style="color: red">{error.message}</p>
{/await}
</article>


<style>
  table {
    max-width: 100%;
    margin: auto;
  }
  article {
    color: #343a40;
    border: solid #ddd 1px;
    border-radius: 10px;
    padding: 15px;
    background: white;
    margin: 20px 0;
    text-align: center;
    box-shadow: 10px 10px 20px rgba(125, 22, 2, 0.5);
  }
  td {
    background-color: #eee;
    width: 20px;
    height: 20px;
  }
</style>