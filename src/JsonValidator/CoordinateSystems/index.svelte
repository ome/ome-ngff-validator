<script>
  import { getVersion, getZarrArrayAttrsFileName } from "../../utils";
  import Thumbnail from "../Thumbnail/index.svelte";

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
  rootAttrs.coordinateTransformations?.forEach((ct) => {
    if (!ct.input) {
      warnings.push("CoordinateTransformation missing required 'input' field");
    }
    if (!ct.output) {
      warnings.push("CoordinateTransformation missing required 'output' field");
    } else {
      if (!csNames.includes(ct.output)) {
        warnings.push(
          `CoordinateTransformation 'output' does not match any CoordinateSystem name: ${ct.output}`
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

  console.log("CoordinateSystems names:", csByNames);
  console.log("CoordinateTransformations by output:", ctByOutputs);
</script>

{#each csNames as csName}
  <article>
    <h2>Coordinate System: {csName}</h2>
    <details>
      <summary>Details</summary>
      <pre>{JSON.stringify(csByNames[csName], null, 2)}</pre>
    </details>
    {#if ctByOutputs[csName]}
      <p>This Coordinate System has the following Coordinate Transformations:</p>
      {#each ctByOutputs[csName] as transform, idx}
        <div class="input_path">
          <Thumbnail source = {`${source}/${transform.input}`} targetSize=150 maxCssSize=300 /> <br/>
          Input: {transform.input} <br />
          Output: {transform.output} <br />
          Type: {transform.type} <br />
          Scale: {transform.scale ? transform.scale.join(", ") : "n/a"} <br />
          Translation: {transform.translation
            ? transform.translation.join(", ")
            : "n/a"} <br />
          Rotation: {transform.rotation ? transform.rotation.join(", ") : "n/a"}
          <br />
        </div>
      {/each}
    {:else}
      <p><em>No Coordinate Transformations found with output to this Coordinate System.</em></p>
    {/if}
  </article>
{/each}

{#if warnings.length > 0}
  <article>
    <h2>Warnings</h2>
    <ul>
      {#each warnings as warning}
        <li>{warning}</li>
      {/each}
    </ul>
  </article>
{/if}


<style>
  h2 {
    font-weight: 300;
  }
  article {
    text-align: left;
  }
  .input_path {
    border-radius: 10px;
    padding: 15px 0;
    margin: 15px 0;
    box-shadow: 5px 5px 10px #c3c0c0;
    background: linear-gradient(to right, #ccc, #aaa);
    text-align: center;
  }
</style>
