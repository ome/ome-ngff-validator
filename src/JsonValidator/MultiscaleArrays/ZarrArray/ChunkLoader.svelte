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

  const chunks = zarray.chunks;
  const chunkCounts = zarray.shape.map((sh, index) =>
    Math.ceil(sh / chunks[index])
  );

  const chunkIndices = writable(chunkCounts.map((c) => 0));
  const chunkSlice = writable(chunks.map((c) => 0));

  // Only need to slice the chunk if it is 3D or greater
  const showSliceControls = chunks.slice(0, -2).some((c) => c > 1);
  let slices = chunks.map((c) => 0);

  async function handleLoadChunks() {
    if (!showChunks) return;
    // clear previous chunk
    chunk = undefined;
    const store = await openArray({ store: source + path, mode: "r" });
    chunk = await store.getRawChunk(get(chunkIndices));
  }

  chunkIndices.subscribe(function () {
    // whenever the chunk indices change, we load a new chunk...
    handleLoadChunks();
  });

  chunkSlice.subscribe(function () {
    // whenever the slices change... this will update <ChunkViewer/>
    slices = get(chunkSlice);
  });
</script>

<div class="chunkLoader">
  Load chunk:
  <input
    type="checkbox"
    bind:checked={showChunks}
    on:change={handleLoadChunks}
  />
  {#each chunkCounts as cc, dim}
    <select disabled={cc == 1} name="dim_{dim}" bind:value={$chunkIndices[dim]}>
      {#each range(cc) as opt}
        <option value={opt}>{opt}</option>
      {/each}
    </select>
  {/each}

  {#if showChunks}
    <div class="sliceControls">
    Slice chunk to 2D:
    {#each chunks.slice(0, -2) as cc, dim}
      {#if cc > 1}
        <input
          title={"Dimension:" + dim}
          type="range"
          min="0"
          max={chunks[dim] - 1}
          bind:value={$chunkSlice[dim]}
        />
      {/if}
    {/each}
    <br />
    Slice: [{slices.slice(0, -2)},:,:]
    </div>
  {/if}
</div>

{#if showChunks}
  {#if chunk}
    <ChunkViewer {chunk} chunkSlice={slices} />
  {:else}
    <p>Loading chunk...</p>
  {/if}
{/if}

<style>
  .chunkLoader {
    width: max-content;
    margin: 10px auto;
    background: white;
    border-radius: 10px;
    padding: 10px;
  }

  .sliceControls {
    margin-top: 5px;
  }

  select {
    border: solid 1px #ccc;
    border-radius: 3px;
    margin: 1px;
  }
</style>
