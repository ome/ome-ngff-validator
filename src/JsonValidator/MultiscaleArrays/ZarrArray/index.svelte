<script>
  import { getJson, formatBytes, getChunkShape, getArrayDtype } from "../../../utils";
  import Cube3D from "./Cube3D.svelte";
  import ChunkLoader from "./ChunkLoader.svelte";

  export let source;
  export let path;

  const promise = getJson(source + "/" + path);

  function totalChunkCount(zarray) {
    return chunkCounts(zarray).reduce((prev, curr) => prev * curr, 1);
  }

  function chunkCounts(zarray) {
    const ch = getChunkShape(zarray);
    return zarray.shape.map((sh, index) => Math.ceil(sh / ch[index]));
  }

  function getBytes(shape, zarray) {
    // handle v2 and v3 zarr
    let dtype = getArrayDtype(zarray)
    let bytesPerPixel = [1, 2, 4, 8].find((n) => dtype.includes(n));
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
    <table>
      <tr>
        <th /><th>Array</th><th>Chunk</th>
      </tr>
      <tr>
        <th>Bytes</th>
        <td>{getBytes(zarray.shape, zarray)}</td>
        <td>{getBytes(getChunkShape(zarray), zarray)}</td>
      </tr>
      <tr>
        <th>Shape</th>
        <td>{JSON.stringify(zarray.shape)}</td>
        <td>{JSON.stringify(getChunkShape(zarray))}</td>
      </tr>
      <tr>
        <th>Counts</th>
        <td>{chunkCounts(zarray)}</td>
        <td>{totalChunkCount(zarray)} Chunks</td>
      </tr>
      <tr>
        <th>Type</th>
        <td>{getArrayDtype(zarray)}</td>
        <td>numpy.ndarray</td>
      </tr>
    </table>

    <ChunkLoader {zarray} {source} {path} />

    <Cube3D {zarray} />

    <details>
      <summary>{path}</summary>
      <pre><code>{JSON.stringify(zarray, null, 2)}</code></pre>
    </details>
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

  pre {
    color: #faebd7;
    background-color: #2c3e50;
    padding: 10px;
    font-size: 14px;
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
    color: #ff512f;
  }

  details {
    font-size: 1.1em;
    margin: 0 15px;
    text-align: left;
  }
  pre {
    margin-top: 10px;
    color: #faebd7;
    background-color: #2c3e50;
    padding: 10px;
    font-size: 14px;
    border-radius: 10px;
  }
</style>
