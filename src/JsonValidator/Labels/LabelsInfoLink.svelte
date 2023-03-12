<script>
    export let source;
    export let labelsAttrs;
    console.log("labelsAttrs:", labelsAttrs);
    const url = window.location.origin + window.location.pathname;
    let labelsPaths;
    if (labelsAttrs.labels) {
      labelsPaths = labelsAttrs.labels;
    }
  </script>
  
  <div class="labels">
    Labels:
  
    {#if labelsPaths}
      <ul>
      {#each labelsPaths as labelPath}
        <li><a title="Open Labels" href="{url}?source={source}/labels/{labelPath}/">labels/{labelPath}</a></li>
      {/each}
      </ul>
    {:else}
      <div style="color:red">labels/.zattrs has no 'labels' list</div>
    {/if}
  
    <details>
      <summary>labels/.zattrs</summary>
      <pre><code>{JSON.stringify(labelsAttrs, null, 2)}</code></pre>
    </details>
  </div>
  
  <style>
    div {
      margin-top: 10px 20px;
      text-align: left;
    }

    .labels {
        margin-top: 15px;
    }
    ul {
      /* list-style: disc; */
      padding: 15px 20px;
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