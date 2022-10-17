<script>
  import { CURRENT_VERSION, getVersion, getSchema, getSearchParam } from "../../utils";

  import WellContainer from "./WellContainer/index.svelte";

  export let source;
  export let rootAttrs;

  const wellToValidate = getSearchParam("well");
  let testParse = parseInt(wellToValidate);
  let wellIndex = 0;
  if (!isNaN(testParse)) {
    wellIndex = testParse;
  }

  const searchParams = new URLSearchParams(window.location.search);
  function wellUrl(wellIndex) {
    searchParams.set("well", "" + wellIndex);
    return window.location.origin + window.location.pathname + "?" + searchParams;
  }


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
    <p>
      Validating {wellPaths.length} Wells and
      {#if wellToValidate == "all"}
        ALL Images in each
        <a href={wellUrl(0)} title="Validate Image at index {wellIndex}">index:0 only</a>
      {:else}
        one Image in each (index: {wellIndex})
        <a href={wellUrl('all')} title="Validate ALL Images in each Well">all</a>
        {#if wellIndex > 0}
          <a href={wellUrl(wellIndex - 1)} title="Validate Image at index {wellIndex - 1}"> &lt; </a>
        {/if}
        <a href={wellUrl(wellIndex + 1)} title="Validate Image at index {wellIndex + 1}"> &gt; </a>
      {/if}
    </p>
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

  a {
    text-decoration: none;
  }
</style>
