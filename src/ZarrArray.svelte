<script>
  import { getJson, formatBytes } from "./utils";
  import Cube3D from "./Cube3D.svelte";

  export let source;
  export let path;

  const promise = getJson(source + path + "/.zarray");

  function chunkCount(zarray) {
    const ch = zarray.chunks;
    const counts = zarray.shape.map((sh, index) => Math.ceil(sh/ch[index]));
    return counts.reduce((prev, curr) => prev * curr, 1);
  }

  function getBytes(shape, zarray) {
    let bytesPerPixel = [1, 2, 4, 8].find((n) => zarray.dtype.includes(n));
    if (!bytesPerPixel) return "";
    let pixels = shape.reduce((i, p) => i * p, 1);
    return formatBytes(bytesPerPixel * pixels);
  }
</script>

<div class="array">
  <p>Path <a href="{source + path + '/.zarray'} ">{path + "/.zarray"}</a></p>

  {#await promise}
    <div>loading array .zarray ...</div>
  {:then zarray}
    <table>
      <tr>
        <th /><th>Array</th><th>Chunk</th>
      </tr>
      <tr>
        <th>Bytes</th>
        <td>{getBytes(zarray.shape, zarray)}</td>
        <td>{getBytes(zarray.chunks, zarray)}</td>
      </tr>
      <tr>
        <th>Shape</th>
        <td>{JSON.stringify(zarray.shape)}</td>
        <td>{JSON.stringify(zarray.chunks)}</td>
      </tr>
      <tr>
        <th>Count</th>
        <td>{chunkCount(zarray) + 1} Tasks</td>
        <td>{chunkCount(zarray)} Chunks</td>
      </tr>
      <tr>
        <th>Type</th>
        <td>{zarray.dtype}</td>
        <td>numpy.ndarray</td>
      </tr>
    </table>

    <Cube3D zarray={zarray} />

    <details>
      <summary>{path}/.zarray</summary>
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
  }

  p {
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
