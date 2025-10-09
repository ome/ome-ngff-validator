<script>
  import Thumbnail from "../Thumbnail/index.svelte";
  import DetailsPrePanel from "../../JsonBrowser/DetailsPrePanel.svelte";

  import { getJson } from "../../utils";

  export let source;
  export let transformAttrs;

  let multiscalesUrl = `${source}/${transformAttrs.input}/zarr.json`;

  let msAttrsPromise = getJson(multiscalesUrl);
</script>

<div class="input_path">
  <p>{transformAttrs.input}</p>
  {#await msAttrsPromise}
    <p>checking for labels...</p>
  {:then msAttrs}
    <!-- <DetailsPrePanel jsonData={transformAttrs} summary={transformAttrs.name || "CoordinateTransformation"} /> -->
    <Thumbnail
      source={`${source}/${transformAttrs.input}`}
      targetSize="150"
      maxCssSize="300"
    />
  {:catch error}
    <details>
      <summary>
        <span class="warning"
          >Could not load multiscales at <strong>{transformAttrs.input}</strong
          ></span
        ></summary
      >
      <p class="warning">
        {error.message}
      </p>
    </details>
  {/await}
</div>

<style>
  .warning {
    color: red;
  }
  .input_path {
    border-radius: 10px;
    padding: 10px;
    margin: 5px 0 15px 0;
    box-shadow: 5px 5px 10px #c3c0c0;
    background: linear-gradient(to right, #ccc, #aaa);
    text-align: center;
  }
</style>
