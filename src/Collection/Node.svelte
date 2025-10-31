<script>
  import Icon from "svelte-icons-pack/Icon.svelte";
  import BsCaretRightFill from "svelte-icons-pack/bs/BsCaretRightFill";
  import { slide } from "svelte/transition";

  import Thumbnail from "../JsonValidator/Thumbnail/index.svelte";

  export let name;
  export let contents;
  export let source;
  export let expanded = false;

  const url = window.location.origin + window.location.pathname;

  // If the Object or list only has a single item, expand to show it
  if (contents && contents.path) {
    expanded = true;
  }

  function toggle() {
    expanded = !expanded;
  }

  function getAbsolutePath(path, s) {
    if (path.startsWith("http")) {
      return path;
    } else {
      let src = s.endsWith("/") ? s.slice(0, -1) : s;
      let pth = path.startsWith(".") ? path.slice(1) : path;
      pth = pth.startsWith("/") ? pth.slice(1) : path;
      return src + "/" + pth;
    }
  }
</script>

<div class="folder">
  <div class="{expanded ? 'expanded' : ''} caret" on:click={toggle}>
    <Icon className="caret-toggle" src={BsCaretRightFill} />
  </div>

  <div class="content">
    <!-- if NOT expanded, show ...] // n items -->
    {#if !expanded}
      <li>
        {#if contents.name}
          {contents.name}
        {:else}
          <span class="warning">Node is missing <code>name</code></span>
        {/if}
      </li>
    {/if}

    {#if expanded}
      <ul transition:slide={{ duration: 300 }}>
        <li>
          name:
          {#if contents.name}
            {contents.name}
          {:else}
            <span class="warning">Node is missing <code>name</code></span>
          {/if}
        </li>

        <!-- either "path" or "nodes" -->
        {#if contents.path}
          <li>
            path:
            <a
              title="Open {contents.type == 'multiscale'
                ? 'Image'
                : 'Collection'}"
              href="{url}?source={getAbsolutePath(contents.path, source)}"
            >
              {contents.path}
            </a>
            {#if contents.type == "multiscale"}
            <br />
              <Thumbnail
                source={`${contents.path}`}
                targetSize="100"
                maxCssSize="100"
              />
            {/if}
          </li>
        {:else if contents.nodes}
          <li>nodes:</li>
          <ul>
            {#each contents.nodes as node}
              <li>
                <svelte:self
                  name={node.name}
                  {source}
                  contents={node}
                  expanded={false}
                />
              </li>
            {/each}
          </ul>
        {/if}
      </ul>
    {/if}
  </div>
</div>

<style>
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
  .warning {
    color: red;
  }

  ul {
    padding: 0.2em 0 0 0;
    margin: 0;
    list-style: none;
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
