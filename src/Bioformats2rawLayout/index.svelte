<script>
  import {
    getJson,
    getXmlDom,
    getZarrGroupAttrs,
    validate,
    getVersion,
    getZarrGroupAttrsFileName,
  } from "../utils";
  import JsonBrowser from "../JsonBrowser/index.svelte";
  import ImageContainer from "../JsonValidator/Well/ImageContainer.svelte";
  import RoCrate from "../JsonValidator/RoCrate/index.svelte";
  import OpenWith from "../JsonValidator/OpenWithViewers/index.svelte";

  export let source;
  export let rootAttrs;

  const metadataName = "OME/METADATA.ome.xml";

  const version = getVersion(rootAttrs);
  console.log("BF2RAW version", version, rootAttrs);
  const zarrAttrsFileName = getZarrGroupAttrsFileName(version);
  console.log("zarrAttrsFileName", zarrAttrsFileName);

  // source/OME/METADATA.ome.xml
  const metadataUrl = `${source}/${metadataName}`;

  async function loadXmlOrSeries(url) {
    // We can get the series info from /OME/METADATA.ome.xml or
    // /OME/zarr.json group attributes
    // returns {images: [{name, id}]} or {error: message}
    let dom;
    try {
      dom = await getXmlDom(url);
    } catch (error) {}
    let xmlRsp;
    if (dom) {
      xmlRsp = parseXml(dom);
    }
    // Try to get series info
    let rsp = {};
    let series;
    try {
      let zarrAttrs = await getJson(`${source}/OME/${zarrAttrsFileName}`);
      series = zarrAttrs?.attributes?.ome?.series || zarrAttrs.series;
    } catch (error) {}

    if (series && xmlRsp && xmlRsp?.images) {
      // MUST match if we have both...
      if (series.length !== xmlRsp.images.length) {
        rsp.errors = [
          `Length mismatch: series: ${series.length} != ome.xml: ${5}`,
        ];
      }
    }
    if (series) {
      rsp.images = series.map((seriesName) => ({
        name: seriesName,
        path: seriesName,
      }));
    } else if (xmlRsp) {
      rsp = xmlRsp;
    } else {
      rsp.errors = ["No OME/METADATA.ome.xml or /OME series found"];
    }
    return rsp;
  }

  function parseXml(dom) {
    const root = dom.documentElement;

    let rsp = { images: [] };
    let index = 0;
    for (const child of root.children) {
      console.log(child.tagName);
      if (child.tagName === "Image") {
        rsp.images.push({
          name: child.getAttribute("Name"),
          id: child.getAttribute("ID"),
          path: "" + index++,
        });
      }
      // error handling - parsererror gives html doc
      if (child.tagName === "body") {
        if (child.firstElementChild.tagName == "parsererror") {
          rsp.errors = [...child.firstElementChild.children].map(
            (el) => el.innerHTML
          );
        }
      }
    }
    return rsp;
  }
  const promise = loadXmlOrSeries(metadataUrl);

  // wait for schema to be cached, so we don't load them multiple times
  // let schemasPromise = getSchema("0.2", "image");
  async function preloadSchema(imagePath) {
    let imgAttrs = getZarrGroupAttrs(imagePath);
    console.log("preloadSchema", imgAttrs);
    let errs = await validate(imgAttrs);
    return errs;
  }

  const dirs = source.split("/").filter(Boolean);
  const zarrName = dirs[dirs.length - 1];

  const url = window.location.origin + window.location.pathname;
</script>

<article>
  Reading: <a href={source}>/{zarrName}/{zarrAttrsFileName}</a>

  Loading metadata:<a href={metadataUrl}>{metadataName}</a><br />

  {#await promise}
    <div>loading {metadataUrl}...</div>
  {:then metadataJson}
    <!-- Show list of Images -->
    <h1>{metadataJson.images.length} Images</h1>
    <ol>
      {#await preloadSchema(source + "/0")}
        <div>loading schema...</div>
      {:then ok}
        <ul>
          {#each metadataJson.images as image}
            <li class="image">
              /{image.path}
              <a title="Open Image" href="{url}?source={source}/{image.path}/"
                >{image.name}</a
              >

              <ImageContainer {source} path={image.path} />

              <a title="Open Image" href="{url}?source={source}/{image.path}/"
                >Open in validator</a
              >

              <div style="margin-top: 10px">
                <OpenWith {source} dtype={"image"} {version} />
              </div>
            </li>
          {/each}
        </ul>
      {:catch error}
        <p style="color: red">{error.message}</p>
      {/await}
    </ol>

    <h3>{zarrName}/{zarrAttrsFileName}</h3>
    <div class="json">
      <JsonBrowser name="" version="" contents={rootAttrs} expanded />
    </div>

    <!-- Error handling... -->
    {#if metadataJson.errors}
      <div class="error">
        <h3>Error loading series metadata:</h3>
        {#each metadataJson.errors as err, i}
          <div>{err}</div>
        {/each}
      </div>
    {/if}
  {:catch error}
    <p style="color: red">{error.message}</p>
  {/await}

  <!-- for v0.5+ we check for ro-crate-metadata.json -->
  {#if !["0.1", "0.2", "0.3", "0.4"].includes(version)}
    <RoCrate {source}></RoCrate>
  {/if}
</article>

<style>
  h1 {
    margin-top: 20px;
  }
  a,
  a:visited {
    color: var(--omeLinkBlue);
  }

  .json {
    text-align: left;
    margin-top: 10px;
    margin-bottom: 10px;
    color: #faebd7;
    background-color: #263749;
    padding: 10px;
    font-size: 14px;
    border-radius: 10px;
    font-family: monospace;
  }

  .image {
    list-style: none;
    text-align: left;
    margin-top: 10px;
    margin-bottom: 10px;
    color: #faebd7;
    background-color: #263749;
    padding: 10px;
    font-size: 14px;
    border-radius: 10px;
    font-family: monospace;
  }
</style>
