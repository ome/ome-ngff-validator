<script>
  export let source;
  export let obsAttrs;

  console.log("TABLE", obsAttrs)

  const url = window.location.origin + window.location.pathname;
</script>


<p>

  Table:

  <a title="Open Table" href="{url}?source={source}table/">
    Open Table...
  </a>

  <details>
    <summary>table/.zattrs</summary>
  
    <pre><code>{JSON.stringify(obsAttrs, null, 2)}</code></pre>
  </details>

</p>

<style>

  p {
    margin-top: 20px;
    text-align: left;
  }

  pre {
    color: #faebd7;
    background-color: #2c3e50;
    padding: 10px;
    font-size: 14px;
  }

  a,
  a:visited {
    color: #ff512f;
  }

</style>
