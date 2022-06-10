<script>
  import ZarrArray from "./ZarrArray.svelte";

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
    color: #343a40;
    border: solid #ddd 1px;
    border-radius: 10px;
    padding: 15px;
    background: white;
    margin: 20px 0;
    text-align: left;
    box-shadow: 10px 10px 20px rgba(125, 22, 2, 0.5);
  }
</style>
