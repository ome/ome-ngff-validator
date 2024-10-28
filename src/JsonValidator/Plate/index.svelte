<script>
  import { CURRENT_VERSION, getVersion, getSchema, getSchemaUrl, getSearchParam, range } from "../../utils";

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
  const version = getVersion(rootAttrs) || CURRENT_VERSION;

  // NB: 'field_count' is optional field
  const maxFieldIndex = plateJson.field_count || wellIndex + 1;
  const wellIndecies = range(maxFieldIndex);

  // wait for schemas to be cached, so we don't load them multiple times
  let schemasPromise = Promise.all([
    getSchema(getSchemaUrl("well", version)),
    getSchema(getSchemaUrl("image", version)),
  ]);

  function handleSelect(event) {
    // Update URL to show ?well=index
    window.location.href = wellUrl(event.target.value);
  }
</script>

<article>
  {#await schemasPromise}
    <div>loading schemas...</div>
  {:then ok}
    <p>
      Validating {wellPaths.length} Wells and
      <select on:change={handleSelect}>
        {#each wellIndecies as wellIdx}
          <option value={wellIdx} selected={wellIndex == wellIdx}>
            Image at index: {wellIdx}
          </option>
        {/each}
        <option value="all" selected={wellToValidate == "all"}>ALL Images</option>
      </select>
      in each Well.
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

  select {
    border: solid rgb(100,100,100) 1px;
    border-radius: 5px;
  }
</style>
