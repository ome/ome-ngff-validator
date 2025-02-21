<script>
  import * as zarr from "zarrita";
  import * as omezarr from "ome-zarr.js";

  export let source;
  // Default target size 0 will get thumbnail from smallest resolution
  export let targetSize = 0;

  const store = new zarr.FetchStore(source);
  const promise = omezarr.renderThumbnail(store, targetSize);
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
  <img {src} alt="Thumbnail" class="thumbnail" />
{:catch error}
  <div>Failed to load thumbnail: {error.message}</div>
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
  .spinner img {
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
</style>
