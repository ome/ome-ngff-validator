<script>
  import { getXmlDom, getZarrGroupAttrs, validate, getVersion, getZarrGroupAttrsFileName } from "../utils";
  import JsonBrowser from "../JsonBrowser/index.svelte";
  import ImageContainer from "../JsonValidator/Well/ImageContainer.svelte";
  import RoCrate from "../JsonValidator/RoCrate/index.svelte";

  export let source;
  export let rootAttrs;

  const metadataName = "OME/METADATA.ome.xml";

  const version = getVersion(rootAttrs);
  console.log("BF2RAW version", version, rootAttrs);
  const zarrAttrsFileName = getZarrGroupAttrsFileName(version);
  console.log("zarrAttrsFileName", zarrAttrsFileName);

  // source/OME/METADATA.ome.xml
  const metadataUrl = `${source}/${metadataName}`;

  async function loadXml(url) {
    let dom = await getXmlDom(url);
    const root = dom.documentElement;

    let rsp = { images: [] };
    for (const child of root.children) {
      console.log(child.tagName);
      if (child.tagName === "Image") {
        rsp.images.push({
          name: child.getAttribute("Name"),
          id: child.getAttribute("ID"),
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
  const promise = loadXml(metadataUrl);

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

  <div class="json">
    <JsonBrowser name="" version="" contents={rootAttrs} expanded />
  </div>

  Loading metadata:<a href={metadataUrl}>{metadataName}</a><br />

  {#await promise}
    <div>loading {metadataUrl}...</div>
  {:then metadataJson}
    <!-- Show list of Images -->
    <h1>Images</h1>
    <ol>
      {#await preloadSchema(source + "/0")}
        <div>loading schema...</div>
      {:then ok}
        <ul>
          {#each metadataJson.images as image, i}
            <li class="image">
              /{i}
              <a title="Open Image" href="{url}?source={source}/{i}/"
                >{image.name}</a
              >

              <ImageContainer {source} path={i} />
            </li>
          {/each}
        </ul>
      {:catch error}
        <p style="color: red">{error.message}</p>
      {/await}
    </ol>

    <!-- Error handling... -->
    {#if metadataJson.errors}
      <div class="error">
        <h2>Error parsing {metadataName}</h2>
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
    color: #ff512f;
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
