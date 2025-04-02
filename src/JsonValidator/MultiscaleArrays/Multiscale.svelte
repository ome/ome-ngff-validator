<script>
  import { getZarrArrayJson } from "../../utils";
  import CheckMark from "../../CheckMark.svelte";

  export let source;
  export let multiscale;
  export let version;

  const WARNING = "warning";

  // We check that all multiscale Datasets have same dtype and
  // shape.length (number of dimensions)

  // If multiscale.axes (version > 0.3) check it matches shape
  const { axes, datasets } = multiscale;

  const permitDtypeMismatch = ["0.1", "0.2", "0.3", "0.4"].includes(version);
  const checkDimSeparator = ["0.2", "0.3", "0.4"].includes(version);
  const allowMissingDimNames = ["0.1", "0.2", "0.3", "0.4"].includes(version);
  let successMsg = "dtypes match and shapes are consistent";
  if (!allowMissingDimNames) {
    successMsg = "dimension_names checked, " + successMsg;
  }

  function allEqual(items) {
    return items.every((value) => value == items[0]);
  }

  function containsError(checks) {
    return checks.some((check) => check.status != WARNING);
  }

  async function loadAndValidate() {
    let dtypes = [];
    let dimCounts = [];
    let shapes = [];
    let dimSeparators = [];
    let zarrayJsonList = [];

    for (let i = 0; i < datasets.length; i++) {
      let dataset = datasets[i];
      let zarray = await getZarrArrayJson(source + "/" + dataset.path);
      zarrayJsonList.push(zarray);
      // Need to handle Zarr v2 and Zarr v3:
      dimCounts.push(zarray.shape.length);
      dtypes.push(zarray.dtype || zarray.data_type);
      shapes.push(zarray.shape);
      dimSeparators.push(zarray.dimension_separator || zarray.chunk_key_encoding?.configuration?.separator);
    }

    // Each check is {msg: "Message"}, with status: "warning" if it isn't an Error.
    let checks = [];
    if (dtypes.length === 0) {
      checks.push({ msg: "No multiscale datasets" });
    }

    if (!allEqual(dtypes)) {
      if (permitDtypeMismatch) {
        checks.push({
          msg: `dtypes mismatch: ${dtypes.join(
            ", "
          )} not valid after version 0.4`,
          status: WARNING,
        });
      } else {
        checks.push({ msg: `dtypes mismatch: ${dtypes.join(", ")}` });
      }
    }
    if (!allEqual(dimCounts)) {
      checks.push({
        msg: `number of dimensions mismatch: ${dimCounts.join(", ")}`,
      });
    }
    if (axes) {
      shapes.forEach((shape) => {
        if (shape.length != axes.length) {
          checks.push({
            msg: `Shape (${shape.join(", ")}) doesn't match axes length: ${
              axes.length
            }`,
          });
        }
      });

      if (!allowMissingDimNames) {
        let axesNames = JSON.stringify(axes.map(axis => axis.name));
        zarrayJsonList.forEach((arrData, i) => {
          let msg;
          if (!arrData.dimension_names) {
            msg = `No dimension_names found for dataset ${i}`;
          } else {
            let dimNames = JSON.stringify(arrData.dimension_names);
            if (dimNames != axesNames) {
              msg = `dimension_names: ${dimNames} don't match axes names: ${axesNames}`;
            }
          }
          if (msg) {
            checks.push({msg});
          }
        });
      }
    }
    if (checkDimSeparator) {
      dimSeparators.forEach((sep) => {
        if (sep != "/") {
          checks.push({
            msg: `Dimension separator must be / for version ${version}`,
          });
        }
      });
    }
    return checks;
  }

  const promise = loadAndValidate();
</script>

{#await promise}
  <p>loading...</p>
{:then checks}
  {#if containsError(checks)}
    <!-- only show X if not valid - no tick if valid -->
    <CheckMark valid={false} />
  {:else}
    <p title="{successMsg}">
      {datasets.length} Datasets checked <span style="color:green">✓</span>
    </p>
  {/if}
  {#each checks as check}
    {#if check.status == "warning"}
      <p style="color: orange">Warning: {check.msg}</p>
    {:else}
      <p style="color: red">Error: {check.msg}</p>
    {/if}
  {/each}
{:catch error}
  <p style="color: red">{error.message}</p>
{/await}
