<script>
  import * as zarr from "zarrita";
  import * as omezarr from "ome-zarr.js";
  import { selectBestThumbnail, getZarrGroupAttrs } from "../../utils";

  export let source;
  // Default target size 0 will get thumbnail from smallest resolution
  export let targetSize = 0;
  export let maxCssSize = 250;
  // Optional: pass rootAttrs to avoid re-fetching
  export let rootAttrs = null;

  // Convention identifiers
  const THUMBNAILS_UUID = "49326c01-1180-4743-b15f-f7157038a6ab";
  const THUMBNAILS_NAME = "thumbnails";

  // Per zarr-conventions spec, a convention can be identified by uuid, name,
  // schema_url, or spec_url. We check all since only one is required.
  function hasThumbnailsConvention(conventions) {
    return conventions?.some(
      (c) =>
        c.uuid === THUMBNAILS_UUID ||
        c.name === THUMBNAILS_NAME ||
        c.schema_url?.includes("/thumbnails/") ||
        c.spec_url?.includes("/thumbnails/"),
    );
  }

  async function loadThumbnail() {
    // Get attrs (use passed or fetch)
    const attrs = rootAttrs || (await getZarrGroupAttrs(source));
    const zarrAttrs = attrs?.attributes || attrs;

    // Check for thumbnails convention
    const conventions = zarrAttrs?.zarr_conventions || [];

    if (
      hasThumbnailsConvention(conventions) &&
      zarrAttrs?.thumbnails?.length > 0
    ) {
      const best = selectBestThumbnail(zarrAttrs.thumbnails, 512);
      if (best) {
        if (best.path) {
          return `${source}/${best.path}`;
        } else if (best.url) {
          return best.url;
        }
      }
    }

    // Fallback to ome-zarr rendering
    const store = new zarr.FetchStore(source);
    return omezarr.renderThumbnail(store, targetSize);
  }

  const promise = loadThumbnail();
</script>

{#await promise}
  <!-- placeholder is also an img so it can be styled same as thumbnail -->
  <div title="Loading Thumbnail..." class="spinner">
    <img
      src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
      alt="Thumbnail"
      class="thumbnail"
    />
  </div>
{:then src}
  <img
    {src}
    alt="Thumbnail"
    class="thumbnail"
    style="--max-css-size: {maxCssSize}px"
  />
{:catch error}
  <div title="Failed to load thumbnail: {error.message}" class="failed">
    <img
      src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
      alt="Failed to load thumbnail: {error.message}"
      class="thumbnail"
    />
    <div>×</div>
  </div>
{/await}

<style>
  @keyframes spinner {
    to {
      transform: rotate(360deg);
    }
  }

  .spinner {
    position: relative;
  }
  .failed {
    position: relative;
    width: 100px;
    height: 100px;
    display: inline-block;
  }
  .failed img {
    top: 0;
    left: 0;
    position: absolute;
  }
  .failed div {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 3em;
    color: darkgrey;
  }
  .spinner img,
  .failed img {
    background-color: #ddd;
    width: 100px;
    height: 100px;
  }

  .spinner:after {
    content: "";
    box-sizing: border-box;
    position: absolute;
    top: 50%;
    left: 50%;
    width: 40px;
    height: 40px;
    margin-top: -20px;
    margin-left: -20px;
    border-radius: 50%;
    border: 3px solid rgba(180, 180, 180, 0.6);
    border-top-color: rgba(0, 0, 0, 0.6);
    animation: spinner 1s linear infinite;
  }
  .thumbnail {
    border-radius: 5px;
    max-width: var(--max-css-size);
    max-height: var(--max-css-size);
  }
</style>
