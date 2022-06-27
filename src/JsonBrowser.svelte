<script>
  import Icon from "svelte-icons-pack/Icon.svelte";
  import BsCaretRightFill from "svelte-icons-pack/bs/BsCaretRightFill";
  import { slide } from "svelte/transition";

  import JsonKeyLink from "./JsonKeyLink.svelte";

  export let name;
  export let contents;
  export let expanded = false;
  export let last = true;
  export let version;

  // If the Object or list only has a single item, expand to show it
  if (Object.keys(contents).length == 1) {
    expanded = true;
  }

  function toggle() {
    expanded = !expanded;
  }
</script>

<div class="folder">
  <div class="{expanded ? 'expanded' : ''} caret" on:click={toggle}>
    <Icon className="caret-toggle" src={BsCaretRightFill} />
  </div>

  <div class="content">
    {#if name}
      <JsonKeyLink on:toggle={toggle} name={name} version={version}></JsonKeyLink>:
    {/if}

    <!-- opening bracket for list or object -->
    {#if contents[0]}{"["}{:else}{"{"}{/if}

    <!-- if NOT expanded, show ...] // n items -->
    {#if !expanded}
      <span class="comment dots">...</span> {#if contents[0]}{"]"}{:else}{"}"}{/if}
      {#if (!last) }<span class="trailing-comma">,</span>{/if}
      <span class="comment">// {#if contents[0]}{contents.length}{:else}{Object.keys(contents).length}{/if} items</span>
    {/if}

    {#if expanded}
      <ul transition:slide={{ duration: 300 }}>
        <!-- If it's a list show each item or contents -->
        {#if contents[0]}
          {#each contents as item, count}
            <li>
              {#if typeof item === "object"}
                <!-- could be list or object, has no key -->
                <svelte:self
                  name={""}
                  version={version}
                  contents={item}
                  expanded={contents.length == 1}
                  last={contents.length === (count + 1)}
                />
              {:else}
                <!-- Value, string or number or null, boolean -->
                {#if typeof item === "string"}
                  <span class="string">"{item}"</span>
                {:else if typeof item === "number"}
                  <span class="number">{item}</span>
                {:else}
                  <span class="null">{item}</span>
                {/if}
                {#if contents.length != (count + 1)}
                  <span class="trailing-comma">,</span>
                {/if}
              {/if}
            </li>
          {/each}
        {:else}
          <!-- If it's an Object show each item by it's key -->
          {#each Object.entries(contents) as keyval, count}
            <li>
              {#if typeof keyval[1] === "object"}
                <!-- could be list or object -->
                <svelte:self
                  name={keyval[0]}
                  version={version}
                  contents={keyval[1]}
                  expanded={Object.values(contents).length == 1}
                  last={Object.keys(contents).length === (count + 1)}
                />
              {:else}
                <!-- Key; -->
                <span class="key indent">"{keyval[0]}"</span>:

                <!-- Value, string or number or null, boolean -->
                {#if typeof keyval[1] === "string"}
                  <span class="string">"{keyval[1]}"</span>
                {:else if typeof keyval[1] === "number"}
                  <span class="number">{keyval[1]}</span>
                {:else}
                  <span class="null">{keyval[1]}</span>
                {/if}
                {#if Object.keys(contents).length != (count + 1)}
                  <span class="trailing-comma">,</span>
                {/if}
              {/if}
            </li>
          {/each}
        {/if}
      </ul>
    {/if}

    {#if expanded}
      <!-- closing bracket for list or object -->
      {#if contents[0]}{"]"} {:else} {"}"} {/if}
      {#if !last}<span class="trailing-comma">,</span>{/if}
    {/if}
  </div>
</div>

<style>
  .comment {
    opacity: 0.4;
    color: #aaa;
  }
  .dots {
    margin-left: -7px;
    margin-right: -7px;
  }
  .trailing-comma {
    margin-left: -0.5em;
    opacity: 0.4;
  }
  .folder {
    display: flex;
    flex-direction: row;
  }
  .caret {
    flex: 0 20px;
    opacity: 0.5;
  }
  .content {
    flex: 1;
  }
  span {
    padding: 0;
    text-align: left;
  }
  .string {
    color: rgb(201, 175, 118);
  }
  .null {
    color: rgb(86, 186, 211);
  }
  .number {
    color: rgb(181, 206, 168);
  }
  .indent {
    margin-left: 20px;
  }

  ul {
    padding: 0.2em 0 0 0;
    margin: 0;
    list-style: none;
    border-left: 1px solid rgba(100, 100, 100, 0.4);
    text-align: left;
  }

  li {
    padding: 0.2em 0;
  }
  :global(.caret-toggle) {
    cursor: pointer;
  }
  
  :global(.expanded .caret-toggle) {
    transform: rotate(90deg);
  }
</style>
