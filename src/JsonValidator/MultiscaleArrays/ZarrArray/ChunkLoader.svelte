<script>
  import { openArray } from "zarr";
  import { range } from "../../../utils";
  import { get, writable } from "svelte/store";
  import ChunkViewer from "./ChunkViewer.svelte";

  export let source;
  export let path;
  export let zarray;

  let showChunks = false;
  let chunk;

  const ch = zarray.chunks;
  const chunkCounts = zarray.shape.map((sh, index) =>
    Math.ceil(sh / ch[index])
  );

  const chunkIndices = writable(chunkCounts.map((c) => 0));

  async function handleLoadChunks() {
    if (!showChunks) return;

    const store = await openArray({store: source + path, mode: 'r'});
    chunk = await store.getRawChunk(get(chunkIndices));
  }

  chunkIndices.subscribe(function () {
    // whenever the chunk indices change, we load a new chunk...
    handleLoadChunks();
  });

</script>

<div class="chunkLoader">
  Load chunk:
  <input type="checkbox" bind:checked={showChunks} on:change={handleLoadChunks} />
  {#each chunkCounts as cc, dim}
    <select disabled={(cc == 1)} name="dim_{dim}" bind:value={$chunkIndices[dim]}>
      {#each range(cc) as opt}
        <option value={opt}>{opt}</option>
      {/each}
    </select>
  {/each}
</div>

{#if showChunks && chunk}
  <ChunkViewer {chunk}/>
{/if}

<style>
  .chunkLoader {
    width: max-content;
    margin: 10px auto;
    background: white;
    border-radius: 10px;
    padding: 10px;
  }

  select {
    border: solid 1px #ccc;
    border-radius: 3px;
    margin: 1px;
  }
</style>
