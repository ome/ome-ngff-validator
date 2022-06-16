<script>
  export let zarray;

  const shape = zarray.shape;
  const sizeX = shape[shape.length - 1];
  const sizeY = shape[shape.length - 2];
  const sizeZ = shape.length < 3 ? 1 : shape[shape.length - 3];

  const scale = 200 / Math.max(sizeX, sizeY, sizeZ);
  const minL = 40;
  const scaledX = Math.max(minL, sizeX * scale);
  const scaledY = Math.max(minL, sizeY * scale);
  const scaledZ = Math.max(minL, sizeZ * scale);

  const chunks = zarray.chunks;
  const minCh = 10;
  const chunkX = Math.max(minCh, chunks[chunks.length - 1] * scale);
  const chunkY = Math.max(minCh, chunks[chunks.length - 2] * scale);
  const chunkZ = Math.max(minCh, chunks.length < 3 ? 1 : chunks[chunks.length - 3] * scale);
</script>

<div
  class="container"
  style="
    --size-x: {scaledX}px;
    --size-y: {scaledY}px;
    --size-z: {scaledZ}px;
    --chunkX: {chunkX}px;
    --chunkY: {chunkY}px;
    --chunkZ: {chunkZ}px"
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

<style>
  .container {
    width: var(--size-x);
    height: var(--size-y);
    perspective: 1000px;
    margin: 25px auto 20px;
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
        rgba(70, 70, 70, 0.7) 0px,
        rgba(70, 70, 70, 0.7) 1px,
        transparent 1px,
        transparent var(--chunkX)
      ),
      repeating-linear-gradient(
        90deg,
        rgba(70, 70, 70, 0.7) 0px,
        rgba(70, 70, 70, 0.7) 1px,
        transparent 1px,
        transparent var(--chunkY)
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
</style>
