
<script>

  import {getDataType} from "./utils";

  export let zattrs;
  export let source;

  const dirs = source.split("/").filter(Boolean);
  let title = dirs[dirs.length - 1];
  let obj = getDataType(zattrs);

  if ("well" in zattrs) {
    title = dirs[dirs.length - 2] + "/" + dirs[dirs.length - 1];
  } else if (obj == "Table") {
    // table
    title = dirs[dirs.length - 2] + "/" + dirs[dirs.length - 1];
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
