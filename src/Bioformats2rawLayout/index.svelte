<script>
  import { getXmlDom } from "../utils";
  import JsonBrowser from "../JsonBrowser/index.svelte";

  export let source;
  export let rootAttrs;

  const metadataName = "/OME/METADATA.ome.xml";

  // source/OME/METADATA.ome.xml
  const metadataUrl = `${source}${metadataName}`;

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
    console.log(rsp);
    return rsp;
  }
  const promise = loadXml(metadataUrl);

  const dirs = source.split("/").filter(Boolean);
  const zarrName = dirs[dirs.length - 1];

  const url = window.location.origin + window.location.pathname;
</script>


<article>
  Reading: <a href={source}>{zarrName}/.zattrs</a>
  <JsonBrowser name="" version="" contents={rootAttrs} expanded />

  &nbsp<br />

  Loading metadata: <a href={metadataUrl}>{metadataName}</a><br />

  {#await promise}
    <div>loading {metadataUrl}...</div>
  {:then metadataJson}
    <!-- Show list of Images -->
    <h1>Images</h1>
    <ol>
      {#each metadataJson.images as image, i}
        <li><a title="Open Image" href="{url}?source={source}{i}/">{image.name}</a></li>
      {/each}
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
</article>

<style>
  a,
  a:visited {
    color: #ff512f;
  }
</style>
