<script>
  import { openArray, slice } from "zarr";
  import { range, getChunkShape } from "../../../utils";
  import { get, writable } from "svelte/store";
  import ChunkViewer from "./ChunkViewer.svelte";

  export let source;
  export let path;
  export let zarray;

  let showChunks = false;
  let chunk;

  const chunks = getChunkShape(zarray);
  const chunkCounts = zarray.shape.map((sh, index) =>
    Math.ceil(sh / chunks[index])
  );

  const chunkIndices = writable(chunkCounts.map((c) => 0));

  // Only need to slice the chunk if it is 3D or greater
  const showSliceControls = chunks.slice(0, -2).some((c) => c > 1);
  // slice dimensions that are > 1. (NB we won't slice x and y)
  // E,g, if chunks is [1, 125, 125, 125] chunk shape will be (125, 125, 125)
  let chunkShape = chunks.filter((c) => c > 1);
  let chunkSlice = chunkShape.map((c) => 0);

  const writeableChunkSlice = writable(
    chunks.filter((c) => c > 1).map((c) => 0)
  );

  async function handleLoadChunks() {
    if (!showChunks) return;
    // clear previous chunk
    chunk = undefined;
    const store = await openArray({ store: source + "/" + path, mode: "r" });

    // we want to get exactly 1 chunk
    // e.g. chunkIndices is (0, 1, 0, 0) and chunk is (1, 125, 125, 125)
    // we want to get [0, 125:250, 0:125, 0:125]
    let ch = store.meta.chunks;
    const indices = get(chunkIndices).map((index, dim) => {
      if (ch[dim] > 1) {
        return slice(index * ch[dim], (index + 1) * ch[dim]);
      } else {
        return index * ch[dim];
      }
    });
    chunk = await store.get(indices);
  }

  chunkIndices.subscribe(function () {
    // whenever the chunk indices change, we load a new chunk...
    handleLoadChunks();
  });

  writeableChunkSlice.subscribe(function (e) {
    // whenever the slices change... this will update <ChunkViewer/>
    chunkSlice = get(writeableChunkSlice);
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

  {#if showChunks && showSliceControls}
    <div class="sliceControls">
      Slice chunk to 2D:
      {#each chunkSlice.slice(0, -2) as cc, dim}
          <input
            title={"Dimension:" + dim}
            type="range"
            min="0"
            max={chunkShape[dim] - 1}
            bind:value={$writeableChunkSlice[dim]}
          />
      {/each}
      <br />
      Slice: [{chunkSlice.slice(0, -2)},:,:]
    </div>
  {/if}
</div>

{#if showChunks}
  {#if chunk}
    <ChunkViewer {chunk} {chunkSlice} />
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
