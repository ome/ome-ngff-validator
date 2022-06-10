<script>
  import { getJson } from "./utils";
  import Well from "./Well.svelte";

  export let source;
  export let path;

  const promise = getJson(source + path + "/.zattrs");
</script>

{#await promise}
  <td>.</td>
{:then data}
  <Well wellAttrs={data} {source} {path} />
{:catch error}
  <td style="color: red">{error.message}</td>
{/await}

<style>
  td {
    width: 20px;
    height: 20px;
  }
</style>
