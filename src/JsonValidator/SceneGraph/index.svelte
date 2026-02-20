<script>
  import { getJson } from "../../utils";
  import GraphSvgArrows from "./GraphSvgArrows.svelte";

  export let source;
  export let rootAttrs;

  const url = window.location.origin + window.location.pathname;

  let sceneAttrs = rootAttrs.scene;

  let graphData;

  let buildGraph = async function() {

    graphData = {
      links: [],
      errors: [],
      multiscales: {},
      scene: sceneAttrs,
    };

    let childUrls = new Set();

    // First find any child multiscales load multiscales...
    for (const ct of sceneAttrs.coordinateTransformations || []) {
      console.log("ct", ct);
      if (ct.output?.path) {
        childUrls.add(ct.output.path);
      }
      if (ct.input?.path) {
        childUrls.add(ct.input.path);
      }
    }
    const promises = Array.from(childUrls).map((name) => {
      return getJson(`${source}/${name}/zarr.json`)
        .then((json) => [name, json])
        .catch((error) => [name, null]);
    });
    let results = await Promise.all(promises);

    results.forEach(([name, attrs]) => {
      if (attrs?.attributes?.ome?.multiscales) {
        graphData.multiscales[name] = attrs.attributes.ome.multiscales;
      } else {
        graphData.errors.push(`Failed to load multiscales from ${name}`);
      }
    });

    function systemId(coordSystem, parent) {
      let path = parent ?? coordSystem.path;
      let name = coordSystem.name ?? coordSystem;  // if coordSystem is a string, use it as the name and assume no path
      return `${path ? `${path}/` : ""}${name}`;
    }

    // ...now we can build the graph links with the multiscales metadata available
    for (const ct of sceneAttrs.coordinateTransformations || []) {
      graphData.links.push({
        source: systemId(ct.input),
        target: systemId(ct.output),
        transform: ct,
      });

      for (let io of ["input", "output"]) {
        let obj = ct[io];
        if (obj?.path) {
          let multiscales = graphData.multiscales[obj.path];
          // if (!multiscales) {
          //   graphData.errors.push(`Coordinate transformation ${ct.name} ${io} references path ${obj.path} which failed to load as a multiscales image.`);
          // } else if (!multiscales.multiscales) {
          //   graphData.errors.push(`Coordinate transformation ${ct.name} ${io} references path ${obj.path} which does not have 'multiscales' metadata.`);
          // }
        }
        for (const msAttrs of graphData.multiscales[obj.path] || []) {
          // handle top-level transforms...
          for (const msCt of msAttrs.coordinateTransformations || []) {
            graphData.links.push({
              source: systemId(msCt.input, obj.path),
              target: systemId(msCt.output, obj.path),
              transform: msCt
            });
          }
          // handle datasets transforms... - just first one
          for (const ds of msAttrs.datasets.slice(0, 1) || []) {
            let tr = ds.coordinateTransformations[0];
            graphData.links.push({
              source: systemId(tr.input, obj.path),
              target: systemId(tr.output, obj.path),
              transform: tr
            });
          }
        }
      }
    }

    // We have graph links!

    console.log("graphData", graphData);

    return graphData;
  }

  let graphDataPromise = buildGraph();

</script>

<article class="scene">

{#await graphDataPromise}
  <div>Loading scene graph...</div>
{:then graphData}

  <div id="diagram" class="diagram">
    <GraphSvgArrows {graphData} />
    <div class="columns">
        <div>
          <div class="column-title">
            scene
          </div>
          <section class="multiscale">
          <div class="ms-title">scene</div>
          {#each graphData.scene.coordinateSystems as cs}
            <div id="{cs.name}" class="coordinateSystem">
              {cs.name}
            </div>
          {/each}
          </section>
        </div>
        <div>
          <div class="column-title">
            multiscales
          </div>
          {#each Object.entries(graphData.multiscales) as [path, multiscales]}
            <section class="multiscale">
              <div class="ms-title">
                <a
                  title="Open multiscales image"
                  href="{url}?source={source}/{path}/"
                  >{path}</a></div>
              {#each multiscales as ms}
                <div>
                  {#each ms.coordinateSystems as cs}
                    <div id="{path}/{cs.name}" class="coordinateSystem">
                      {cs.name}
                    </div>
                  {/each}
                </div>
                <!-- first multiscale dataset -->
                <div id="{path}/{ms.datasets[0].path}" class="coordinateSystem">
                  {(ms.datasets.map(d => d.path).join(", "))}
                </div>
              {/each}
            </section> 
          {/each}
        </div>
    </div>
  </div>
  
  {#if graphData.errors.length > 0}
    <div>
      <h2>Errors</h2>
      <ul>
        {#each graphData.errors as error}
          <li class="warning">{error}</li>
        {/each}
      </ul>
    </div>
  {/if}

{:catch error}
  <p style="color: red">{error.message}</p>
{/await}

</article>


<style>
  h2 {
    font-weight: 300;
  }
  .diagram {
    position: relative;
    padding: 0px;
    overflow: auto;
  }
  .columns {
    position: relative;
    display: grid;
    grid-template-columns: minmax(280px, 1fr) minmax(280px, 1fr);
    gap: 10px;
    min-height: 320px;
  }
  .column-title {
    margin-bottom: 10px;
    font-weight: 700;
    color: #334155;
    text-transform: lowercase;
  }
  section.multiscale {
    border: 1px solid #ddd;
    border-radius: 12px;
    padding: 10px;
    margin-bottom: 14px;
    background: #fafcff;
    text-align: left;
  }
  .ms-title {
    font-weight: 500;
    color: #334155;
    margin-bottom: 6px;
  }
  .coordinateSystem {
    padding: 7px 9px;
    margin: 6px 0;
    border-radius: 8px;
    border: 1px solid #d7e1f3;
    background: #fff;
    font-size: 0.92rem;
    width: fit-content;
  }
  a {
    text-decoration: none;
    color: inherit;
  }
  a:hover {
    text-decoration: underline;
  }
</style>
