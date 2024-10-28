<script>
  import ZarrArray from "./ZarrArray/index.svelte";
  import Multiscale from "./Multiscale.svelte";
  import {getVersion, getZarrArrayAttrsFileName} from "../../utils";

  export let source;
  export let rootAttrs;

  const msVersion = getVersion(rootAttrs);
  const zarrAttrsFileName = getZarrArrayAttrsFileName(msVersion);
</script>

{#each rootAttrs.multiscales as multiscale, idx}
  <article>
    <h2>Multiscale {idx}</h2>
    <Multiscale {source} {multiscale} /> 
    {#each multiscale.datasets as dataset}
      <ZarrArray {source} path={dataset.path + "/" + zarrAttrsFileName} />
    {/each}
  </article>
{/each}

<style>
  h2 {
    font-weight: 300;
  }
  article {
    text-align: left;
  }
</style>
