<script>
  import { CURRENT_VERSION, getVersion, getSchema } from "./utils";

  import WellContainer from "./WellContainer.svelte";

  export let source;
  export let rootAttrs;

  let plateJson = rootAttrs.plate;
  let wellPaths = plateJson.wells.map((well) => well.path);
  console.log("wellPaths", wellPaths);
  const version = getVersion(rootAttrs) || CURRENT_VERSION;

  // wait for schemas to be cached, so we don't load them multiple times
  let schemasPromise = Promise.all([
    getSchema(version, "well"),
    getSchema(version, "image"),
  ]);
</script>

<article>
  {#await schemasPromise}
    <div>loading schemas...</div>
  {:then ok}
    <p>Validating {wellPaths.length} Wells and first Image in each:</p>
    <table>
      {#each plateJson.rows as row}
        <tr>
          {#each plateJson.columns as column}
            {#if wellPaths.indexOf(`${row.name}/${column.name}`) > -1}
              <WellContainer path={`${row.name}/${column.name}`} {source} />
            {:else}
              <td />
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

  td {
    background-color: #eee;
    width: 20px;
    height: 20px;
  }
</style>
