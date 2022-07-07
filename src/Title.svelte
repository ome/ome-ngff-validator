
<script>

  export let zattrs;
  export let source;

  const dirs = source.split("/").filter(Boolean);
  let title = dirs[dirs.length - 1];
  let obj = "Image"

  if ("well" in zattrs) {
    obj = "Well"
    title = dirs[dirs.length - 2] + "/" + dirs[dirs.length - 1];
  } else if ("plate" in zattrs) {
    obj = "Plate"
  }
</script>

<h1>{obj}: {title}</h1>

<style>
  h1 {
    font-weight: 300;
    font-size: clamp(2rem, 6vw, 3.5rem);
    text-align: center;
    color: #343a40;
  }
</style>
