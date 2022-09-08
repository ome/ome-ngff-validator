<script>
  import { getJson, validate } from "../../utils";

  export let source;
  export let path;

  // const promise = getJson(source + path + "/.zattrs");

  async function loadAndValidate() {
    let imgAttrs = await getJson(source + path + "/.zattrs");
    console.log("imgAttrs", imgAttrs);
    let errs = await validate(imgAttrs);
    return errs;
  }

  const promise = loadAndValidate();

  const url = window.location.origin + window.location.pathname;
</script>

<a title="{path}: Open Image" href="{url}?source={source + path}/">
{#await promise}
  <li>{path}.</li>
{:then errs}
  {#if errs.length > 0}
    <li class="error"> ⨯ Error! </li>
  {:else}
    <li class="valid">{path}: ✓ </li>
  {/if}
{:catch error}
  <li class="error">{error.message}</li>
{/await}
</a>

<style>
  li {
    display: block;
    list-style: none;
    float: left;
    border: solid #ddd 1px;
    margin: 3px;
    padding: 3px;
    border-radius: 3px;
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
