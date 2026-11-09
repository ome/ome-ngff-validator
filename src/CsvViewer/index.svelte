<script>
  import ImageContainer from "../JsonValidator/Well/ImageContainer.svelte";
  import OpenWith from "../JsonValidator/OpenWithViewers/index.svelte";
  import Thumbnail from "../JsonValidator/Thumbnail/index.svelte";
  import { basename } from "../utils";

  export let source;
  export let csvData;

  const url = window.location.origin + window.location.pathname;

  const csvLines = csvData.split("\n");
  const headers = csvLines[0].split(",");
  const rows = csvLines.slice(1).map(line => line.split(","));

  // Read BFF "File Path" or MoBIE "uri" csvs
  let zarrColumnIndex = headers.indexOf("File Path");
  if (zarrColumnIndex === -1) {
    zarrColumnIndex = headers.indexOf("uri");
  }
  if (zarrColumnIndex === -1) {
    console.error("No 'File Path' column found in CSV");
  }

  function getFullPath(row) {
    let path = row[zarrColumnIndex];
    console.log("zarrColumnIndex: " + zarrColumnIndex);
    console.log("Original path: " + path);
    if (!path) {
      return;
    }
    if (path.endsWith("/")) {
      path = path.slice(0, -1); // Remove trailing slash if present
    }
    return path;
  }


</script>

<article>
  {#if zarrColumnIndex == -1}

  {:else}
    <!-- Show list of Images -->
    <h1>{rows.length} Images</h1>

    <ul>
      {#each rows as row}
        {@const fullPath = getFullPath(row)}
        {#if !fullPath}
          <li class="image">Missing path</li>
        {:else}
        <li class="image">
          <div>
          <a title="Open Image" href="{url}?source={getFullPath(row)}"
            >{basename(row[zarrColumnIndex])}</a
          >

          <ImageContainer {source} path={getFullPath(row)} />

          <div style="margin-top: 10px">
            <OpenWith source={getFullPath(row)} dtype={"image"} />
          </div>
          </div>
          <div class="thumbnail_wrapper">
            <a title="Open Image in Validator" href="{url}?source={getFullPath(row)}">
            <Thumbnail source={getFullPath(row)} targetSize=100 maxCssSize=100 />
            </a>
          </div>
        </li>
        {/if}
      {/each}
    </ul>
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
    display: flex;
    flex-direction: row;
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
  .image div {
    flex: 1 1 auto;
  }

  .image .thumbnail_wrapper {
    flex: 0 0 auto;
  }

  .thumbnail_wrapper :global(.thumbnail) {
    border-radius: 5px;
  }
</style>
