

<script>
    export let jsonData;
    export let summary;
</script>

<details>
    <summary>{summary}</summary>
    <pre><code>{JSON.stringify(jsonData, null, 2)}</code></pre>
  </details>


<style>

details {
    font-size: 1.1em;
    text-align: left;
    margin: 0 15px;
  }
  pre {
    margin-top: 10px;
    color: #faebd7;
    background-color: #2c3e50;
    padding: 10px;
    font-size: 14px;
    border-radius: 10px;
    overflow: auto;
  }

</style>