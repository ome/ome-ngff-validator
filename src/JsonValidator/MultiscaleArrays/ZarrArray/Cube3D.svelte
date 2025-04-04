<script>
  import { getChunkAndShardShapes } from "../../../utils";
  export let zarray;

  let scrollX = 50;
  function handleMousemove(event) {
    // scrollX goes from 20 -> 50. parent is 200px wide
    scrollX = (event.offsetX / 6) + 20;
  }

  const shape = zarray.shape;
  const sizeX = shape[shape.length - 1];
  const sizeY = shape[shape.length - 2];
  const sizeZ = shape.length < 3 ? 1 : shape[shape.length - 3];

  // Scale 3D so the longest dimension is 300px...
  const scale = 300 / Math.max(sizeX, sizeY, sizeZ);
  const scaledX = sizeX * scale;
  const scaledY = sizeY * scale;
  const scaledZ = sizeZ * scale;

  const [chunks, shards] = getChunkAndShardShapes(zarray);
  let chunkX = chunks[chunks.length - 1] * scale;
  let chunkY = chunks[chunks.length - 2] * scale;
  let chunkZ = chunks[chunks.length - 3] * scale;

  let shardX = 100;
  let shardY = 100;
  let shardZ = 100;
  let shardColor = "transparent";
  
  if (shards) {
    shardX = shards[shards.length - 1] * scale;
    shardY = shards[shards.length - 2] * scale;
    shardZ = shards[shards.length - 3] * scale;
    shardColor = "var(--omeLinkBlue)"
  }
</script>

<div class="parent" on:mousemove={handleMousemove}>
  <div
    class="container"
    style="
    --size-x: {scaledX}px;
    --size-y: {scaledY}px;
    --size-z: {scaledZ}px;
    --chunkX: {chunkX}px;
    --chunkY: {chunkY}px;
    --chunkZ: {chunkZ}px;
    --shardX: {shardX}px;
    --shardY: {shardY}px;
    --shardZ: {shardZ}px;
    --shardColor: {shardColor};
    --scrollX: {scrollX}deg"
  >
    <div class="cube">
      <div class="face front">
        <div class="sizeX">{sizeX}</div>
        <div class="sizeY">{sizeY}</div>
      </div>
      <div class="face back" />
      <div class="face right" />
      <div class="face left">
        <div class="sizeX">{sizeZ}</div>
      </div>
      <div class="face top" />
      <div class="face bottom" />
    </div>
  </div>
</div>

<style>
  .parent {
    width: 400px;
    margin: auto;
  }
  .container {
    width: var(--size-x);
    height: var(--size-y);
    perspective: 1000px;
    margin: 25px auto 20px;
    transform: scale(0.75);
    /* ignore mouse-move events */
    pointer-events: none;
  }

  .cube {
    /* https://github.com/Ziratsu/Cube-3D */
    transform-style: preserve-3d;
    width: 100%;
    height: 100%;
    position: relative;
    transform: rotateX(-26deg) rotateY(var(--scrollX));
    animation: spin 3s 1 ease-in-out;
  }
  .face {
    position: absolute;
    width: 100%;
    height: 100%;
    background-image: repeating-linear-gradient(
        0deg,
        var(--shardColor) 0px,
        var(--shardColor) 2px,
        transparent 2px,
        transparent calc(var(--shardY))
      ),
      repeating-linear-gradient(
        90deg,
        var(--shardColor) 0px,
        var(--shardColor) 2px,
        transparent 2px,
        transparent calc(var(--shardX))
      ),
      repeating-linear-gradient(
        0deg,
        rgba(70, 70, 70, 0.7) 0px,
        rgba(70, 70, 70, 0.7) 1px,
        transparent 1px,
        transparent var(--chunkY)
      ),
      repeating-linear-gradient(
        90deg,
        rgba(70, 70, 70, 0.7) 0px,
        rgba(70, 70, 70, 0.7) 1px,
        transparent 1px,
        transparent var(--chunkX)
      ),
      linear-gradient(90deg, rgb(255, 255, 255), rgb(255, 255, 255));
  }

  .face div {
    font-size: 24px;
    position: absolute;
    text-align: center;
    background: transparent;
  }

  .sizeX {
    left: 0;
    top: 110%;
    width: 100%;
  }
  .sizeY {
    left: 100%;
    top: 0;
    transform: rotate(-90deg);
    transform-origin: center;
    padding-top: 10px;
    width: var(--size-y);
    height: var(--size-y);
  }

  .top {
    top: calc((var(--size-y) - var(--size-z)) / 2);
    height: var(--size-z);
    transform: rotateX(270deg) translateZ(calc(var(--size-y)* -1 / 2));
    background-image: repeating-linear-gradient(
        0deg,
        var(--shardColor) 0px,
        var(--shardColor) 2px,
        transparent 2px,
        transparent calc(var(--shardZ))
      ),
      repeating-linear-gradient(
        90deg,
        var(--shardColor) 0px,
        var(--shardColor) 2px,
        transparent 2px,
        transparent calc(var(--shardX))
      ),
      repeating-linear-gradient(
        0deg,
        rgba(70, 70, 70, 0.7) 0px,
        rgba(70, 70, 70, 0.7) 1px,
        transparent 1px,
        transparent var(--chunkZ)
      ),
      repeating-linear-gradient(
        90deg,
        rgba(70, 70, 70, 0.7) 0px,
        rgba(70, 70, 70, 0.7) 1px,
        transparent 1px,
        transparent var(--chunkX)
      ),
      linear-gradient(90deg, rgb(255, 255, 255), rgb(255, 255, 255));
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
    background-image: repeating-linear-gradient(
        0deg,
        var(--shardColor) 0px,
        var(--shardColor) 2px,
        transparent 2px,
        transparent calc(var(--shardY))
      ),
      repeating-linear-gradient(
        90deg,
        var(--shardColor) 0px,
        var(--shardColor) 2px,
        transparent 2px,
        transparent calc(var(--shardZ))
      ),
      repeating-linear-gradient(
        0deg,
        rgba(70, 70, 70, 0.7) 0px,
        rgba(70, 70, 70, 0.7) 1px,
        transparent 1px,
        transparent var(--chunkY)
      ),
      repeating-linear-gradient(
        90deg,
        rgba(70, 70, 70, 0.7) 0px,
        rgba(70, 70, 70, 0.7) 1px,
        transparent 1px,
        transparent var(--chunkZ)
      ),
      linear-gradient(90deg, rgb(255, 255, 255), rgb(255, 255, 255));
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
</style>
