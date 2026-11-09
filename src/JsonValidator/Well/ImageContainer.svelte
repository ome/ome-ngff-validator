<script>
  import { getZarrGroupAttrs, validate, basename } from "../../utils";

  export let source;
  export let path;

  // const promise = getJson(source + path + "/.zattrs");
  const fullPath = path.startsWith("http") ? path : source + "/" + path;

  async function loadAndValidate() {
    let imgAttrs = await getZarrGroupAttrs(fullPath);
    let errs = await validate(imgAttrs);
    return errs;
  }

  const promise = loadAndValidate();

  const url = window.location.origin + window.location.pathname;
</script>

<a title="{path}: Open Image" href="{url}?source={fullPath}">
{#await promise}
  <span>{path}.</span>
{:then errs}
  {#if errs.length > 0}
    <span class="error"> ⨯ Error! </span>
  {:else}
    <span class="valid">{basename(path)}: ✓ </span>
  {/if}
{:catch error}
  <span class="error">{error.message}</span>
{/await}
</a>

<style>
  a {
    text-decoration: none;
  }
  span {
    border: solid #ddd 1px;
    padding: 3px;
    border-radius: 3px;
    display: inline-block;
  }
  .valid {
    color: green;
    background-color: #eeffee;
  }
  .error {
    color: red;
    background-color: #ffeeee;
  }
</style>
