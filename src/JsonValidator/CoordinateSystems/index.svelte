<script>
  import { getVersion, getZarrArrayAttrsFileName } from "../../utils";
  import DetailsPrePanel from "../../JsonBrowser/DetailsPrePanel.svelte";
  import CoordinateTransformation from "./CoordinateTransformation.svelte";
  import ChildMultiscales from "./ChildMultiscales.svelte";

  export let source;
  export let rootAttrs;

  const url = window.location.origin + window.location.pathname;

  // We want to show CoordinateSystems with 'child' coordinateTransformations that
  // have 'output' -> coordinateSystem

  //TODO: show WARNING if:
  // - any coordinateTransformation has 'output' that does not match a CoordinateSystem name
  //   OR is a path to image...
  // - any coordinateSystem is not listed as 'output' in any coordinateTransformation

  function pathName(inputOutput) {
    return (inputOutput.path ? `${inputOutput.path}/` : "") + inputOutput.name;
  }

  const csByNames = {};
  rootAttrs.coordinateSystems?.forEach((cs) => {
    csByNames[cs.name] = cs;
  });

  // Every transform.output is a CoordinateSystem name (even if the CoordinateSystem is not defined)
  const csNames = Array.from(new Set(rootAttrs.coordinateTransformations?.map((ct) => pathName(ct.output)) || []));

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
        if (!csNames.includes(pathName(ct.output))) {
          warnings.push(
            `CoordinateTransformation 'output': '${pathName(ct.output)}' does not match any CoordinateSystem 'name': '${pathName(ct.output)}' or any image path.`
          );
        } else {
          // add to dictionary of CoordinateTransformations by output name
          if (!ctByOutputs[pathName(ct.output)]) {
            ctByOutputs[pathName(ct.output)] = [];
          }
          ctByOutputs[pathName(ct.output)].push(ct);
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

    <!-- If we have a coordinateSystem in hand, show axes... -->
    {#if csByNames[csName]}
      <DetailsPrePanel jsonData={csByNames[csName]} summary={"Axes details"} />
    {:else}
      <!-- Try to load child image for this path. -->
       Child multiscales Image: <a
          title="Open multiscales image"
          href="{url}?source={source}/{csName}/"
        >
          {csName}<br />
      <ChildMultiscales multiscalesUrl={`${source}/${csName}`} />
      </a>
    {/if}


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

  a {
    text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
  }
</style>
