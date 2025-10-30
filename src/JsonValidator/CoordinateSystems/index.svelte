<script>
  import { getVersion, getZarrArrayAttrsFileName } from "../../utils";
  import DetailsPrePanel from "../../JsonBrowser/DetailsPrePanel.svelte";
  import CoordinateTransformation from "./CoordinateTransformation.svelte";

  export let source;
  export let rootAttrs;

  const msVersion = getVersion(rootAttrs);
  const zarrAttrsFileName = getZarrArrayAttrsFileName(msVersion);

  // We want to show CoordinateSystems with 'child' coordinateTransformations that
  // have 'output' -> coordinateSystem

  //TODO: show WARNING if:
  // any coordinateTransformation has 'output' that does not match a CoordinateSystem name
  // OR is a path to image...

  const csByNames = {};
  rootAttrs.coordinateSystems?.forEach((cs) => {
    csByNames[cs.name] = cs;
  });
  const csNames = Object.keys(csByNames);

  const warnings = [];

  const ctByOutputs = {};
  try {
    rootAttrs.coordinateTransformations?.forEach((ct) => {
      if (!ct.input) {
        warnings.push(
          "CoordinateTransformation missing required 'input' field"
        );
      }
      if (!ct.output) {
        warnings.push(
          "CoordinateTransformation missing required 'output' field"
        );
      } else {
        if (!csNames.includes(ct.output)) {
          warnings.push(
            `CoordinateTransformation 'output': '${ct.output}' does not match any CoordinateSystem 'name': '${ct.output}'`
          );
        } else {
          // add to dictionary of CoordinateTransformations by output name
          if (!ctByOutputs[ct.output]) {
            ctByOutputs[ct.output] = [];
          }
          ctByOutputs[ct.output].push(ct);
        }
      }
    });
  } catch (e) {
    warnings.push("Error processing coordinateTransformations: " + e.message);
  }
</script>

{#if warnings.length > 0}
  <article>
    <h2>Warnings</h2>
    <ul>
      {#each warnings as warning}
        <li class="warning">{warning}</li>
      {/each}
    </ul>
  </article>
{/if}

{#each csNames as csName}
  <article>
    <h2>
      <span class="grey">Coordinate System:</span>
      <strong>{csName}</strong>
      <span
        class="info"
        title="This Coordinate System and the Coordinate Transformations below are specified within the zarr.json shown on the left"
        >i</span
      >
    </h2>
    <DetailsPrePanel jsonData={csByNames[csName]} summary={"Axes details"} />
    {#if ctByOutputs[csName]}
      <p style="margin-top: 15px;">
        Coordinate Transformations:
        <span style="font-style: italic; font-size: 90%; opacity: 0.7"
          >(with output: {csName})</span
        >
      </p>
      {#each ctByOutputs[csName] as transform, idx}
        <CoordinateTransformation {source} transformAttrs={transform} />
      {/each}
    {:else}
      <p class="warning">
        <em
          >No Coordinate Transformations found with output to this Coordinate
          System.</em
        >
      </p>
    {/if}
  </article>
{/each}

<style>
  h2 {
    font-weight: 300;
  }
  strong {
    font-weight: 600;
  }
  .grey {
    color: #777;
  }
  article {
    text-align: left;
  }
  .warning {
    color: red;
  }
  .info {
    border-radius: 50%;
    padding: 2px 5px;
    font-size: 60%;
    margin-left: 5px;
    cursor: pointer;
    background-color: #263749;
    color: white;
    display: inline-block;
    width: 20px;
    height: 20px;
    text-align: center;
    font-weight: bold;
    font-style: italic;
  }
</style>
