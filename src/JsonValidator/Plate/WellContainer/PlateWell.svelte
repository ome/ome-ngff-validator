<script>
  import { getJson, validate, getSearchParam, range } from "../../../utils";

  export let wellAttrs;
  export let source;
  export let path;

  const wellToValidate = getSearchParam("well");
  let wellIndex = parseInt(wellToValidate);
  let wellIndices = [0];
  if (isNaN(wellIndex)) {
    if (wellToValidate == "all") {
      wellIndices = range(wellAttrs.well.images.length);
    }
  } else {
    wellIndices = [wellIndex];
  }

  let loadingIndex = 0;

  async function loadAndValidate() {
    console.log("wellAttrs", wellAttrs, wellAttrs.well);
    let errs = [];
    const imgs = wellAttrs.well.images;
    for (let i=0; i < wellIndices.length; i++) {
      // this will fail if e.g. any getJson() raises exception
      let index = wellIndices[i];
      if (index >= imgs.length) {
        return ["Invalid Well index: " + index];
      }
      loadingIndex = index;
      let imgAttrs = await getJson(source + path + "/" + imgs[index].path + "/.zattrs");
      errs = errs.concat(await validate(imgAttrs));
    };
    return errs;
  }

  let validatePromise = validate(wellAttrs);

  let imagePromise = loadAndValidate();

  const url = window.location.origin + window.location.pathname;
</script>

{#await validatePromise}
  <td>...</td>
{:then errors}
  <td class={errors.length === 0 ? "valid" : "invalid"}>
    <a title="{path}: Open Well" href="{url}?source={source + path}/">
      {#await imagePromise}
        {#if wellToValidate == "all"}
          <span title="Loading Well index: {loadingIndex}" style="color:rgba(0,0,0,0.2)">{loadingIndex}</span>
        {/if}
      {:then imgErrors}
        {#if imgErrors.length === 0}
          ✓
        {:else}
          <span title={imgErrors.join(", ")} style="color:red">⨯</span>
        {/if}
      {:catch error}
        <span style="color:red">⨯</span>
      {/await}
    </a>
  </td>
{:catch error}
  <td style="color: red">{error.message}</td>
{/await}

<style>
  td {
    width: 20px;
    height: 20px;
  }
  td.valid {
    background-color: #eeffee;
  }
  td.invalid {
    background-color: #ffeeee;
  }
  a {
    text-decoration: none;
    color: inherit;
  }
</style>
