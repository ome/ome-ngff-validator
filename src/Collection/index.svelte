<script>
  import Node from "../Collection/Node.svelte";

  export let source;
  export let rootAttrs;

  let omeAttrs = rootAttrs?.attributes?.ome || rootAttrs?.ome;

</script>

<article>
     <Node name={"collection"} {source} contents={omeAttrs} expanded />
</article>

<style>
  article {
    padding: 1rem;
    border: 1px solid darkgoldenrod;
  }

  @media (min-width: 1000px) {
        article {
          width: 80%;
        }
      }
</style>
