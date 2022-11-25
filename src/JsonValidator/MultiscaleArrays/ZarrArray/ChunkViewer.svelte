<script>
  import { onMount, afterUpdate } from "svelte";

  export let chunk;
  // e.g. chunkSlice is [0,1,0,0]
  export let chunkSlice;

  let canvas;
  let ctx;

  let shape = chunk.shape;
  console.log("chunkViewer shape", chunk.shape);

  const width = shape[shape.length - 1];
  const height = shape[shape.length - 2];

  function getMinMaxValues(rawChunk) {
    // rawChunk.data is single array
    let maxV = 0;
    let minV = Infinity;
    let d = rawChunk.data;
    let size = d.length;
    console.log("d", d);
    for (let i = 0; i < size; i++) {
      let v = d[i];
      maxV = Math.max(maxV, v);
      minV = Math.min(minV, v);
    }
    return [minV, maxV];
  }

  export function renderTo8bitArray(rawChunks, chunkSlice) {
    // Render a raw chunk into a 2D 8-bit data for new ImageData(arr)
    // rawChunks is list of zarr arrays
    // chunkSlice (optional) e.g. if chunk.shape is (1,125,125,125)
    // we can use slice of [0,50,0,0] to view 50th z section

    let minMaxValues = rawChunks.map(getMinMaxValues);

    let sliceOffset = 0;
    // assume all chunks are same shape
    const shape = rawChunks[0].shape;
    const height = shape[0];
    const width = shape[1];

    if (chunkSlice) {
      // ignore last 2 dimensions, offset by a plane * index
      sliceOffset = chunkSlice
        .slice(0, -2)
        .reduce((prev, sliceIndex, dimIndex) => {
          // FIXME: this works for 3D, but won't work for 4D
          return prev + sliceIndex * width * height;
        }, 0);
    }

    let rgb = [255, 255, 255];

    const rgba = new Uint8ClampedArray(4 * height * width).fill(0);
    let offset = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        for (let p = 0; p < rawChunks.length; p++) {
          let data = rawChunks[p].data;
          let range = minMaxValues[p];
          let rawValue = data[sliceOffset + offset];
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

  onMount(() => {
    ctx = canvas.getContext("2d");

    let rgb = renderTo8bitArray([chunk], chunkSlice);
    console.log("rgb data", rgb);

    ctx.putImageData(new ImageData(rgb, width, height), 0, 0);
  });

  afterUpdate(() => {
    console.log("Updated....");
    let rgb = renderTo8bitArray([chunk], chunkSlice);
    console.log("rgb data....", rgb);

    ctx.putImageData(new ImageData(rgb, width, height), 0, 0);
  });
</script>

<canvas bind:this={canvas} {width} {height} />

<style>
  canvas {
    max-width: 100%;
    max-height: 100%;
    background-color: #666;
  }
</style>
