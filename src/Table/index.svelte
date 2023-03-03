<script>

  import ObspTable from "./ObspTable.svelte";
  import ObsmTable from "./ObsmTable.svelte";
  import ObsTable from "./ObsTable.svelte";
  import XTable from "./XTable.svelte";
  import JsonPanel from "./JsonPanel.svelte";

  export let source;
  export let tableAttrs;

  const tables = ["obsp", "obsm", "var", "X", "obs"];

  // we have separate tables for X and obs so that each
  // can scroll in x-dimension independently, BUT we want
  // to syncronise the scrolling in y -> need JS solution
  let table1;
  let table2;
  let table3;
  let table4;
  function handleScroll(event) {
    if (event.target.id != "scroll1") {
      table1.scrollTop = event.target.scrollTop;
    }
    if (event.target.id != "scroll2") {
      table2.scrollTop = event.target.scrollTop;
    }
    if (event.target.id != "scroll3") {
      table3.scrollTop = event.target.scrollTop;
    }
    if (event.target.id != "scroll4") {
      table4.scrollTop = event.target.scrollTop;
    }
  }
</script>

<article>
  <!-- code blocks for JSON for the table itself and the required 'obs' group -->
  <div>
    <div class="zattrs grey">
      <details>
        <summary>.zattrs</summary>
        <pre><code>{JSON.stringify(tableAttrs, null, 2)}</code></pre>
      </details>
    </div>

    {#each tables as name}
      <div class="zattrs {name}">
        <JsonPanel title={name + "/.zattrs"} url={source + name + "/.zattrs"} />
      </div>
    {/each}
  </div>

  <div class="tablesContainer">
    <!-- several tables side by side -->
    <!-- TODO: only show table if we have data -->
    <div
      class="tableScroller sideTable"
      id="scroll1"
      on:scroll={handleScroll}
      bind:this={table1}
    >
      <ObspTable {source} />
    </div>

    <div
      class="tableScroller sideTable"
      id="scroll2"
      on:scroll={handleScroll}
      bind:this={table2}
    >
      <ObsmTable {source} />
    </div>

    <div
      id="scroll3"
      class="tableScroller"
      on:scroll={handleScroll}
      bind:this={table3}
    >
      <XTable {source} />
    </div>

    <div
      class="tableScroller sideTable"
      id="scroll4"
      on:scroll={handleScroll}
      bind:this={table4}
    >
      <ObsTable {source} />
    </div>
  </div>
</article>

<style>
  article {
    display: flex;
    flex-direction: column;
  }

  article > div {
    flex: 0;
  }

  .tablesContainer {
    flex: 1;
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: row;
    overflow-y: auto;
  }

  .tableScroller {
    overflow: auto;
    flex: 1;
  }
  .sideTable {
    flex: 0.5;
  }

  article {
    text-align: left;
  }

  @media (min-width: 0) {
    article {
      width: 100%;
      height: calc(100% - 100px);
    }
  }

  .zattrs {
    margin: 5px 10px 10px 0;
    width: max-content;
    padding: 10px;
    border-radius: 5px;
    float: left;
  }

  .grey {
    background-color: #ccc;
  }

  .obsp {
    background-color: rgb(224, 102, 96);
  }
  .obs {
    background-color: rgb(238, 195, 54);
  }
  .var {
    background-color: rgb(51, 151, 190);
  }

  .obsm {
    background-color: rgb(237, 144, 50);
  }

  .X {
    background-color: rgb(84, 185, 114);
  }

  pre {
    color: #faebd7;
    background-color: #2c3e50;
    padding: 10px;
    font-size: 14px;
  }
</style>
