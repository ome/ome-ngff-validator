<script>
  import { getJson, formatBytes } from "./utils";

  export let source;
  export let path;

  const promise = getJson(source + path + "/.zarray");

  function getBytes(shape, zattrs) {
    let bytesPerPixel = [2, 4, 8].find((n) => zattrs.dtype.includes(n));
    if (!bytesPerPixel) return "";
    let pixels = shape.reduce((i, p) => i * p, 1);
    return formatBytes(bytesPerPixel * pixels);
  }
  function sizeX(shape) {
    return shape[shape.length - 1];
  }
  function sizeY(shape) {
    return shape[shape.length - 2];
  }
  function sizeZ(shape) {
    if (shape.length < 3) return 1;
    return shape[shape.length - 3];
  }

  function scaleShape(shape) {
    const x = sizeX(shape);
    const y = sizeY(shape);
    const z = sizeZ(shape);
    const scale = 200 / Math.max(x, y, z);
    const minL = 40;
    return {
      x: Math.max(minL, x * scale),
      y: Math.max(minL, y * scale),
      z: Math.max(minL, z * scale),
    };
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

    <div
      class="container"
      style="--size-x: {scaleShape(zattrs.shape).x}px; --size-y: {scaleShape(
        zattrs.shape
      ).y}px; --size-z: {scaleShape(zattrs.shape).z}px"
    >
      <div class="cube">
        <div class="face front">
          <div class="sizeX">{sizeX(zattrs.shape)}</div>
          <div class="sizeY">{sizeY(zattrs.shape)}</div>
        </div>
        <div class="face back" />
        <div class="face right" />
        <div class="face left">
          <div class="sizeX">{sizeZ(zattrs.shape)}</div>
        </div>
        <div class="face top" />
        <div class="face bottom" />
      </div>
    </div>

    <details>
      <summary>{path}/.zarray</summary>
      <pre><code>{JSON.stringify(zattrs, null, 2)}</code></pre>
    </details>
  {:catch error}
    <p style="color: red">{error.message}</p>
  {/await}
</div>

<style>

  .container {
    --size-x: 300px;
    --size-y: 200px;
    --size-z: 100px;
    width: var(--size-x);
    height: var(--size-y);
    perspective: 1000px;
    margin: 20px auto 40px;
    transform: scale(0.75);
  }

  .cube {
    /* https://github.com/Ziratsu/Cube-3D */
    transform-style: preserve-3d;
    width: 100%;
    height: 100%;
    position: relative;
    animation: spin 5s infinite ease-in-out;
  }
  .face {
    position: absolute;
    width: 100%;
    height: 100%;
    background-image: repeating-linear-gradient(
        0deg,
        rgba(70, 70, 70, 0.2) 0px,
        rgba(70, 70, 70, 0.2) 1px,
        transparent 1px,
        transparent 21px
      ),
      repeating-linear-gradient(
        90deg,
        rgba(70, 70, 70, 0.2) 0px,
        rgba(70, 70, 70, 0.2) 1px,
        transparent 1px,
        transparent 21px
      ),
      linear-gradient(90deg, rgb(255, 255, 255), rgb(255, 255, 255));
  }

  .face div {
    font-size: 24px;
    width: 100%;
    position: absolute;
    text-align: center;
    background: transparent;
  }

  .sizeX {
    left: 0;
    top: 110%;
  }
  .sizeY {
    left: 0;
    top: 0;
    transform: rotate(-90deg);
    transform-origin: right top;
    padding-top: 10px;
  }

  .top {
    top: calc((var(--size-y) - var(--size-z)) / 2);
    height: var(--size-z);
    transform: rotateX(90deg) translateZ(calc(var(--size-y) / 2));
  }
  .bottom {
    top: calc((var(--size-y) - var(--size-z)) / 2);
    height: var(--size-z);
    transform: rotateX(-90deg) translateZ(calc(var(--size-y) / 2));
  }

  .right {
    width: var(--size-z);
    left: calc((var(--size-x) - var(--size-z)) / 2);
    transform: rotateY(90deg) translateZ(calc(var(--size-x) / 2));
  }
  .left {
    width: var(--size-z);
    left: calc((var(--size-x) - var(--size-z)) / 2);
    transform: rotateY(-90deg) translateZ(calc(var(--size-x) / 2));
  }

  .front {
    transform: rotateX(0deg) translateZ(calc(var(--size-z) / 2));
  }
  .back {
    transform: rotateX(-180deg) translateZ(calc(var(--size-z) / 2));
  }

  @keyframes spin {
    0% {
      transform: rotateX(-26deg) rotateY(50deg);
    }
    50% {
      transform: rotateX(-26deg) rotateY(20deg);
    }
    100% {
      transform: rotateX(-26deg) rotateY(50deg);
    }
  }

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
