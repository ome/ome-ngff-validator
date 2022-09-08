<script>
  import { CURRENT_VERSION, getVersion, getSchema } from "../../utils";

  import ImageContainer from "./ImageContainer.svelte";

  export let source;
  export let rootAttrs;

  let wellJson = rootAttrs.well;
  let imagePaths = wellJson.images.map((img) => img.path);
  // const column_count = Math.ceil(Math.sqrt(imagePaths.length))
  // const row_count = Math.ceil(imagePaths.length / column_count)
  const version = getVersion(rootAttrs) || CURRENT_VERSION;

  // wait for schema to be cached, so we don't load them multiple times
  let schemasPromise = getSchema(version, "image")
</script>

<article>
  Images:
  {#await schemasPromise}
    <div>loading schema...</div>
  {:then ok}
    <ul>
      {#each imagePaths as path}
        <ImageContainer {source} {path} />
      {/each}
    </ul>
  {:catch error}
    <p style="color: red">{error.message}</p>
  {/await}
</article>

<style>

  li {
    list-style: none;
  }

</style>
