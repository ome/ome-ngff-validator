<script>
  import { CURRENT_VERSION, getVersion, getSchema, getSchemaUrl } from "../../utils";

  import ImageContainer from "./ImageContainer.svelte";

  export let source;
  export let rootAttrs;

  let wellJson = rootAttrs.well;
  let imagePaths = wellJson.images.map((img) => img.path);
  // const column_count = Math.ceil(Math.sqrt(imagePaths.length))
  // const row_count = Math.ceil(imagePaths.length / column_count)
  const version = getVersion(rootAttrs) || CURRENT_VERSION;

  // wait for schema to be cached, so we don't load them multiple times
  let schemasPromise = getSchema(getSchemaUrl("image", version))
</script>

<article>
  Images:
  {#await schemasPromise}
    <div>loading schema...</div>
  {:then ok}
    <ul>
      {#each imagePaths as path}
        <li><ImageContainer {source} {path} /></li>
      {/each}
    </ul>
  {:catch error}
    <p style="color: red">{error.message}</p>
  {/await}
</article>

<style>

  ul {
    margin-top: 20px;
  }

  li {
    list-style: none;
    display: inline-block;
    margin: 3px;
  }

</style>
