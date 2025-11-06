<script>
  import ChildMultiscales from "./ChildMultiscales.svelte";

  export let source;
  export let transformAttrs;

  const url = window.location.origin + window.location.pathname;
</script>

<div class="input_path">
  <table>
    <tr>
      <td><strong>type:</strong></td>
      <td>{transformAttrs.type}</td>
    </tr>
    {#if transformAttrs.name}
      <tr>
        <td><strong>name:</strong></td>
        <td>{transformAttrs.name}</td>
      </tr>
    {/if}

    {#each Object.keys(transformAttrs) as key}
      {#if !["type", "input", "output", "transformations", "name"].includes(key)}
        <tr>
          <td><strong>{key}:</strong></td>
          <td>{JSON.stringify(transformAttrs[key])}</td>
        </tr>
      {/if}
    {/each}

    {#if transformAttrs.transformations}
      <tr>
        <td><strong>transformations:</strong></td>
        <td>
          {#each transformAttrs.transformations as transform, index}
            <table style="border: 1px solid #ccc; margin-bottom: 10px;">
              <tr>
                <td><strong>type:</strong></td>
                <td>{transform.type}</td>
              </tr>
              {#if transform.name}
                <tr>
                  <td><strong>name:</strong></td>
                  <td>{transform.name}</td>
                </tr>
              {/if}
              {#each Object.keys(transform) as key}
                {#if !["type", "transformations", "name"].includes(key)}
                  <tr>
                    <td><strong>{key}:</strong></td>
                    <td>{JSON.stringify(transform[key])}</td>
                  </tr>
                {/if}
              {/each}
            </table>
          {/each}
        </td>
      </tr>
    {/if}
    <tr>
      <td><strong>output:</strong></td>
      <td>{transformAttrs.output}</td>
    </tr>
    <tr>
      <td><strong>input:</strong></td>
      <td>
        <a
          title="Open multiscales image"
          href="{url}?source={source}/{transformAttrs.input}/"
        >
          {transformAttrs.input}<br />
          <ChildMultiscales multiscalesUrl={`${source}/${transformAttrs.input}`} />
        </a>
      </td>
    </tr>
  </table>
</div>

<style>
  table {
    background-color: white;
    font-size: 14px;
    border-radius: 10px;
    max-width: 100%;
    text-align: left;
    vertical-align: top;
  }
  a {
    text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
  }
  td {
    padding: 3px 3px;
    vertical-align: top;
  }
  .warning {
    color: red;
  }
  .input_path {
    border-radius: 10px;
    border: solid 1px #ccc;
    padding: 10px;
    margin: 5px 0 15px 0;
    box-shadow: 5px 5px 10px #c3c0c0;
    /* background: linear-gradient(to right, #ccc, #aaa); */
    text-align: center;
    overflow: auto;
  }
</style>
