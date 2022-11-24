<script>
    import { range } from "../../../utils";
    import { get, writable } from 'svelte/store';

    export let source;
    export let path;
    export let zarray;
  

    const ch = zarray.chunks;
    const chunkCounts = zarray.shape.map((sh, index) => Math.ceil(sh / ch[index]));

    console.log('chunkCounts', chunkCounts);

    // let chunkIndices = chunkCounts.map(c => 0);

    const chunkStore = writable(chunkCounts.map(c => 0));
  
    function handleLoadChunks() {
      console.log("handle chunks", get(chunkStore));
    }

    chunkStore.subscribe(function(chunkIndices){
      console.log("subscribe chunkIndices", chunkIndices)
    })
  </script>
  
      <div class="chunkLoader">
        Load chunk:
        <input type="checkbox" on:change={handleLoadChunks}/>
        {#each chunkCounts as cc, dim}
          <select name="dim_{dim}" bind:value={$chunkStore[dim]}>
            {#each range(cc) as opt}
              <option value={opt}>{opt}</option>
            {/each}
          </select>
        {/each}
      </div>
  
  <style>
  
    .chunkLoader {
      width: max-content;
      margin: 10px auto;
      background: white;
      border-radius: 10px;
      padding: 10px;
    }

  </style>
  