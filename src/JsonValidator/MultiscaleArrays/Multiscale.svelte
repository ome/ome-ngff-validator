<script>
  import { getJson } from "../../utils";
  import CheckMark from "../../CheckMark.svelte";

  export let source;
  export let multiscale;

  // We check that all multiscale Datasets have same dtype and
  // shape.length (number of dimensions)

  // If multiscale.axes (version > 0.3) check it matches shape
  const {axes, datasets, version} = multiscale;

  const checkDtypes = !["0.1", "0.2", "0.3", "0.4"].includes(version);
  const checkDimSeparator = ["0.2", "0.3", "0.4"].includes(version);

  function allEqual(items) {
    return items.every((value) => value == items[0]);
  }

  async function loadAndValidate() {
    let dtypes = [];
    let dimCounts = [];
    let shapes = [];
    let dimSeparators = [];

    for (let i = 0; i < datasets.length; i++) {
      let dataset = datasets[i];
      let zarray = await getJson(source + dataset.path + "/.zarray");
      dimCounts.push(zarray.shape.length);
      dtypes.push(zarray.dtype);
      shapes.push(zarray.shape);
      dimSeparators.push(zarray.dimension_separator);
    }

    let errors = [];
    if (dtypes.length === 0) {
      errors.push("No multiscale datasets")
    }

    if (checkDtypes && !allEqual(dtypes)) {
      errors.push(`dtypes mismatch: ${dtypes.join(", ")}`)
    }
    if (!allEqual(dimCounts)) {
      errors.push(`number of dimensions mismatch: ${dimCounts.join(", ")}`)
    }
    if (axes) {
      shapes.forEach((shape) => {
        if (shape.length != axes.length) {
          errors.push(`Shape (${shape.join(", ")}) doesn't match axes length: ${axes.length}`)
        }
      });
    }
    if (checkDimSeparator) {
      dimSeparators.forEach((sep) => {
        if (sep != "/") {
          errors.push(`Dimension separator must be / for version ${version}`)
        }
      });
    }
    return errors;
  }

  const promise = loadAndValidate();
</script>

{#await promise}
  <p>loading...</p>
{:then errors}
  {#if errors.length > 0}
    <!-- only show X if not valid - no tick if valid -->
    <CheckMark valid={false} />
    {#each errors as error}
      <p style="color: red">Error: {error}</p>
    {/each}
  {:else}
    <p title="dtypes match and shapes are consistent">
      {datasets.length} Datasets checked <span style="color:green">✓</span>
    </p>
  {/if}
{:catch error}
  <p style="color: red">{error.message}</p>
{/await}
