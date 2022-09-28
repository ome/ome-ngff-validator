<script>
  import ZarrArray from "./ZarrArray/index.svelte";

  export let source;
  export let rootAttrs;
</script>

{#each rootAttrs.multiscales as multiscale, idx}
  <article>
    <h2>Dataset {idx}</h2>
    {#each multiscale.datasets as dataset}
      <ZarrArray {source} path={dataset.path} />
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
