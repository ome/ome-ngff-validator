<script>
  import { getJson } from "../utils";
  import { AnnDataSource } from "../vitessce-utils";

  import ObsmTable from "./ObsmTable.svelte";
  import ObsTable from "./ObsTable.svelte";
  import XTable from "./XTable.svelte";

  export let source;
  export let tableAttrs;

  const tablePromise = getJson(source + "obs/.zattrs");

  // we have separate tables for X and obs so that each
  // can scroll in x-dimension independently, BUT we want
  // to syncronise the scrolling in y -> need JS solution
  let table1;
  let table2;
  let table3;
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
  }
</script>

<article>
  <!-- code blocks for JSON for the table itself and the required 'obs' group -->
  <div>
    <details>
      <summary>table/.zattrs</summary>
      <pre><code>{JSON.stringify(tableAttrs, null, 2)}</code></pre>
    </details>

    {#await tablePromise}
      <p>checking for obs...</p>
    {:then obsAttrs}
      <details>
        <summary>table/obs/.zattrs</summary>
        <pre><code>{JSON.stringify(obsAttrs, null, 2)}</code></pre>
      </details>
    {:catch error}
      <p style="color: red">Failed to load /obs/.zattrs {error}</p>
    {/await}

    <!-- Don't show "Load obs" button for now - just load by default -->
    <!-- <button class="obs" on:click={toggleObsInfo}>Load obs</button> -->
  </div>

  <div class="tablesContainer">
    <!-- 3 tables side by side -->
    <!-- First: obsData. TODO: does it always exist? -->
    <div
      class="tableScroller sideTable"
      id="scroll3"
      on:scroll={handleScroll}
      bind:this={table3}
    >
      <ObsmTable {source} />
    </div>

    <div
      id="scroll1"
      class="tableScroller"
      on:scroll={handleScroll}
      bind:this={table1}
    >
      <XTable {source} />
    </div>

    <div
      class="tableScroller sideTable"
      id="scroll2"
      on:scroll={handleScroll}
      bind:this={table2}
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

</style>
