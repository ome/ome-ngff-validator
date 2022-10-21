<script>
  import { getJson } from "../../utils";
  import CheckMark from "../../CheckMark.svelte";

  export let source;
  export let multiscale;

  // We check that all multiscale Datasets have same dtype and
  // shape.length (number of dimensions)

  // If multiscale.axes (version > 0.3) check it matches shape

  const datasets = multiscale.datasets;
  const axes = multiscale.axes;

  function allEqual(items) {
    return items.every((value) => value == items[0]);
  }

  async function loadAndValidate() {
    let dtypes = [];
    let dimCounts = [];
    let shapes = [];

    for (let i = 0; i < datasets.length; i++) {
      let dataset = datasets[i];
      let zarray = await getJson(source + dataset.path + "/.zarray");
      dimCounts.push(zarray.shape.length);
      dtypes.push(zarray.dtype);
      shapes.push(zarray.shape);
    }

    let errors = [];
    if (dtypes.length === 0) {
      errors.push("No multiscale datasets")
    }

    if (!allEqual(dtypes)) {
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
