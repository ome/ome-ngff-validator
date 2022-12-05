<script>
  import { onMount, afterUpdate } from "svelte";
  import { slice } from "zarr";

  export let chunk;
  // e.g. chunkSlice is [1,0,0]...
  export let chunkSlice;

  let errorMsg;
  let minMaxMsg;
  let canvas;
  let ctx;


  const width = chunk.shape[chunk.shape.length - 1];
  const height = chunk.shape[chunk.shape.length - 2];

  function getMinMaxValues(chunk2d) {
    const shape = chunk2d.shape;
    const height = shape[0];
    const width = shape[1];
    const data = chunk2d.data;
    let maxV = 0;
    let minV = Infinity;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let rawValue = data[y][x];
        maxV = Math.max(maxV, rawValue);
        minV = Math.min(minV, rawValue);
      }
    }
    return [minV, maxV];
  }

  function sliceArray(ndChunk, toSlice) {
    let slice2D = [...toSlice];
    // don't slice last 2 dims - so we get 2D array
    slice2D[slice2D.length - 1] = slice(null);
    slice2D[slice2D.length - 2] = slice(null);
    return ndChunk.get(slice2D);
  }

  export function renderTo8bitArray(ndChunks, minMaxValues) {
    // Render chunks (array) into 2D 8-bit data for new ImageData(arr)
    // ndChunks is list of zarr arrays

    // assume all chunks are same shape
    const shape = ndChunks[0].shape;
    const height = shape[0];
    const width = shape[1];

    if (!minMaxValues) {
      minMaxValues = ndChunks.map(getMinMaxValues);
    }

    let rgb = [255, 255, 255];

    const rgba = new Uint8ClampedArray(4 * height * width).fill(0);
    let offset = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        for (let p = 0; p < ndChunks.length; p++) {
          let data = ndChunks[p].data;
          let range = minMaxValues[p];
          let rawValue = data[y][x];
          let fraction = (rawValue - range[0]) / (range[1] - range[0]);
          // for red, green, blue,
          for (let i = 0; i < 3; i++) {
            // lut[i] is 0-255...
            let v = (fraction * rgb[i]) << 0;
            // increase pixel intensity if value is higher
            rgba[offset * 4 + i] = Math.max(rgba[offset * 4 + i], v);
          }
        }
        rgba[offset * 4 + 3] = 255; // alpha
        offset += 1;
      }
    }
    return rgba;
  }

  function renderImageToCanvas() {
    let chunk2d = chunk;
    if (chunkSlice) {
      try {
        chunk2d = sliceArray(chunk, chunkSlice);
        errorMsg = undefined;
      } catch (error) {
        errorMsg = `Slicing (${chunk.shape}) failed with slice (${chunkSlice})`;
      }
    }
    if (!errorMsg) {
      let minMax = getMinMaxValues(chunk2d);
      minMaxMsg = `Min: ${minMax[0]} Max: ${minMax[1]}`;
      let rgb = renderTo8bitArray([chunk2d], [minMax]);
      ctx.putImageData(new ImageData(rgb, width, height), 0, 0);
    }
  }

  onMount(() => {
    ctx = canvas.getContext("2d");
    renderImageToCanvas();
  });

  afterUpdate(renderImageToCanvas);
</script>

{#if errorMsg}
<p>{errorMsg}</p>
{:else}
<p>{minMaxMsg}</p>
<canvas bind:this={canvas} {width} {height} />
{/if}

<style>
  canvas {
    max-width: 100%;
    max-height: 100%;
    background-color: #666;
  }
</style>
