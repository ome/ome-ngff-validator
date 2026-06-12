<script>
  import { getZarrArrayJson } from "../../utils";
  import CheckMark from "../../CheckMark.svelte";

  export let source;
  export let multiscale;
  export let version;

  const WARNING = "warning";

  const SPACE_UNITS = ["angstrom", "attometer", "centimeter", "decimeter", "exameter",
    "femtometer", "foot", "gigameter", "hectometer", "inch", "kilometer", "megameter",
    "meter", "micrometer", "mile", "millimeter", "nanometer", "parsec", "petameter",
    "picometer", "terameter", "yard", "yoctometer", "yottameter", "zeptometer", "zettameter"];

  const TIME_UNITS = ["attosecond", "centisecond", "day", "decisecond", "exasecond",
    "femtosecond", "gigasecond", "hectosecond", "hour", "kilosecond", "megasecond",
    "microsecond", "millisecond", "minute", "nanosecond", "petasecond", "picosecond",
    "second", "terasecond", "yoctosecond", "yottasecond", "zeptosecond", "zettasecond"];

  const AXIS_TYPES_PRE_06 = ["space", "time", "channel"];
  const AXIS_TYPES_06 = ["array", "space", "time", "channel", "coordinate", "displacement"];

  // We check that all multiscale Datasets have same dtype and
  // shape.length (number of dimensions)

  // If multiscale.axes (version > 0.3) check it matches shape.

  // In v0.6+ axes are no longer on multiscale.axes but on the coordinateSystems,
  // Checking the first coordinate system as a fallback
  const { datasets } = multiscale;
  const axes = multiscale.axes || multiscale.coordinateSystems?.[0]?.axes;

  const isV06plus = !["0.1", "0.2", "0.3", "0.4", "0.5"].includes(version);

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

  // Validate a single axis object, returning a list of checks.
  // https://ngff.openmicroscopy.org/0.5/#axes-md
  function validateAxis(axis) {
    const checks = [];
    const hasProp = (prop) => Object.prototype.hasOwnProperty.call(axis, prop);

    // Checks shared by OME-Zarr 0.5 and 0.6:
    if (hasProp("units")) {
      checks.push({
        msg: `Axis "${axis.name}" has property "units" — did you mean "unit"?`,
        status: WARNING,
      });
    }
    if (hasProp("type") && axis.type == "space" && axis.unit && !SPACE_UNITS.includes(axis.unit)) {
      checks.push({
        msg: `Axis "${axis.name}" has type space but unit "${axis.unit}" is not a recommended UDUNITS-2 unit`,
        status: WARNING,
      });
    }
    if (hasProp("type") && axis.type == "time" && axis.unit && !TIME_UNITS.includes(axis.unit)) {
      checks.push({
        msg: `Axis "${axis.name}" has type time but unit "${axis.unit}" is not a recommended UDUNITS-2 unit`,
        status: WARNING,
      });
    }

    if (isV06plus) {
      // Checks implementing changes in 0.6dev4
      if (typeof axis.name != "string" || axis.name.length == 0) {
        checks.push({ msg: `Axis name must be a non-empty string` });
      }
      if (hasProp("type") && !AXIS_TYPES_06.includes(axis.type)) {
        checks.push({
          msg: `Axis "${axis.name}" has type "${axis.type}" which is not one of ${AXIS_TYPES_06.join(", ")}`,
          status: WARNING,
        });
      }
      if (hasProp("discrete") && typeof axis.discrete != "boolean") {
        checks.push({ msg: `Axis "${axis.name}" has "discrete" with a value that is not a boolean` });
      }
      if (hasProp("longName") && typeof axis.longName != "string") {
        checks.push({ msg: `Axis "${axis.name}" has "longName" with a value that is not a string` });
      }
    } else {
      // Checks invalid types in versions 0.5 or earlier:
      if (hasProp("type") && !AXIS_TYPES_PRE_06.includes(axis.type)) {
        checks.push({
          msg: `Axis "${axis.name}" has type "${axis.type}" which is not one of ${AXIS_TYPES_PRE_06.join(", ")}`,
          status: WARNING,
        });
      }
    }

    return checks;
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
      axes.forEach((axis) => checks.push(...validateAxis(axis)));

      // v0.6+: axis names must be unique within the coordinate system.
      if (isV06plus) {
        const names = axes.map((a) => a.name);
        const dupes = names.filter((n, i) => names.indexOf(n) !== i);
        if (dupes.length) {
          checks.push({
            msg: `Duplicate axis name(s): ${[...new Set(dupes)].join(", ")}`,
          });
        }
      }

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
