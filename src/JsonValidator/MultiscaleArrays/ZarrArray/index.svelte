<script>
  import { getJson, formatBytes, getChunkAndShardShapes, getArrayDtype } from "../../../utils";
  import Cube3D from "./Cube3D.svelte";
  import ChunkLoader from "./ChunkLoader.svelte";
  import DetailsPrePanel from "../../../JsonBrowser/DetailsPrePanel.svelte";

  export let source;
  export let path;

  const promise = getJson(source + "/" + path);

  function totalChunkCount(zarray) {
    return chunkCounts(zarray).reduce((prev, curr) => prev * curr, 1);
  }

  function totalShardCount(zarray) {
    return shardCounts(zarray).reduce((prev, curr) => prev * curr, 1);
  }

  function chunkCounts(zarray) {
    const [ch, shards] = getChunkAndShardShapes(zarray);
    return zarray.shape.map((sh, index) => Math.ceil(sh / ch[index]));
  }

  function shardCounts(zarray) {
    const [ch, shards] = getChunkAndShardShapes(zarray);
    if (!shards) {
      return [];
    }
    return zarray.shape.map((sh, index) => Math.ceil(sh / shards[index]));
  }

  function getBytes(shape, zarray) {
    // handle v2 and v3 zarr
    let dtype = getArrayDtype(zarray);
    let bytesPerPixel;
    // e.g. v3: uint8, uint16, uint32, uint64, int8, int16, int32 (4), int64 (8), float32 (4), float64 (8)
    if (dtype.includes("int") || dtype.includes("float")) {
      // use regex to get numbers from dtype
      bytesPerPixel = parseInt(dtype.match(/\d+/)[0]) / 8;
    } else {
      // e.g. v2: >i1, >i2, >i4, >i8, >u1, >u2, >u4, >u8, >f4, >f8
      bytesPerPixel = [1, 2, 4, 8].find((n) => dtype.includes(n));
    }
    if (!bytesPerPixel) return "";
    let pixels = shape.reduce((i, p) => i * p, 1);
    return formatBytes(bytesPerPixel * pixels);
  }
</script>

<div class="array">
  <p>Path <a href="{source + "/" + path} ">{path}</a></p>

  {#await promise}
    <div>loading array data ...</div>
  {:then zarray}
    {@const shard = getChunkAndShardShapes(zarray)[1]}
    <table>
      <tr>
        <th />
        <th>Array</th>
        <th>Chunk</th>
        {#if shard}<th style:border-color="var(--omeLinkBlue)">Shard</th>{/if}
      </tr>
      <tr>
        <th>Bytes</th>
        <td>{getBytes(zarray.shape, zarray)}</td>
        <td>{getBytes(getChunkAndShardShapes(zarray)[0], zarray)}</td>
        {#if shard}<td>{getBytes(shard, zarray)}</td>{/if}
      </tr>
      <tr>
        <th>Shape</th>
        <td>{JSON.stringify(zarray.shape)}</td>
        <td>{JSON.stringify(getChunkAndShardShapes(zarray)[0])}</td>
        {#if shard}<td>{JSON.stringify(shard)}</td>{/if}
      </tr>
      <tr>
        <th>Counts</th>
        <td>{chunkCounts(zarray)}</td>
        <td>{totalChunkCount(zarray)} Chunks</td>
        {#if shard}<td>{totalShardCount(zarray)} Shards</td>{/if}
      </tr>
      <tr>
        <th>Type</th>
        <td>{getArrayDtype(zarray)}</td>
        <td>numpy.ndarray</td>
      </tr>
    </table>

    <ChunkLoader {zarray} {source} {path} />

    <Cube3D {zarray} />

    <DetailsPrePanel jsonData={zarray} summary={path} />
  {:catch error}
    <p style="color: red">{error.message}</p>
  {/await}
</div>

<style>
  .array {
    border-radius: 10px;
    padding: 15px 0;
    margin: 15px 0;
    box-shadow: 5px 5px 10px #c3c0c0;
    background: linear-gradient(to right, #ccc, #aaa);
    text-align: center;
  }

  table {
    background-color: white;
    font-size: 14px;
    border-radius: 10px;
    padding: 10px;
    margin: 15px auto;
    max-width: 100%;
  }
  td,
  th {
    padding: 5px;
    text-align: right;
  }

  td {
    word-break: break-word;
  }
  tr:first-child th {
    border-bottom: 1px solid #ccc;
  }

  a,
  a:visited {
    color: var(--omeLinkBlue);
  }
</style>
