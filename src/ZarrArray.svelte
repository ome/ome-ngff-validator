<script>
  import { getJson, formatBytes } from "./utils";
  import Cube3D from "./Cube3D.svelte";

  export let source;
  export let path;

  const promise = getJson(source + path + "/.zarray");

  function getBytes(shape, zattrs) {
    let bytesPerPixel = [1, 2, 4, 8].find((n) => zattrs.dtype.includes(n));
    if (!bytesPerPixel) return "";
    let pixels = shape.reduce((i, p) => i * p, 1);
    return formatBytes(bytesPerPixel * pixels);
  }
</script>

<div class="array">
  <p>Path <a href="{source + path + '/.zarray'} ">{path + "/.zarray"}</a></p>

  {#await promise}
    <div>loading array .zarray ...</div>
  {:then zattrs}
    <table>
      <tr>
        <th /><th>Array</th><th>Chunk</th>
      </tr>
      <tr>
        <th>Bytes</th>
        <td>{getBytes(zattrs.shape, zattrs)}</td>
        <td>{getBytes(zattrs.chunks, zattrs)}</td>
      </tr>
      <tr>
        <th>Shape</th>
        <td>{JSON.stringify(zattrs.shape)}</td>
        <td>{JSON.stringify(zattrs.chunks)}</td>
      </tr>
      <tr>
        <th>Type</th>
        <td>{zattrs.dtype}</td>
        <td>numpy.ndarray</td>
      </tr>
    </table>

    <Cube3D zattrs={zattrs} />

    <details>
      <summary>{path}/.zarray</summary>
      <pre><code>{JSON.stringify(zattrs, null, 2)}</code></pre>
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
