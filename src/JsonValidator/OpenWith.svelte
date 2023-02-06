<script>
    import viewers_json from "../../public/ngff_viewers.json"

    export let source;
    export let dtype;

    console.log({source});

    let viewers = viewers_json.viewers.map((viewer_data) => {
      let href = viewer_data.href;
      if (href) {
        if (href.includes("{URL}")) {
          href = href.replace("{URL}", source);
        } else {
          href += source;
        }
      }
      return {...viewer_data, href}
    });

  </script>

  <div class="openwith">

    <span>Open with:</span>
    <ul>
    {#each viewers as viewer}

      <li>
        {#if viewer.href}
        <a title="View {dtype} in {viewer.name}" target="_blank" href="{viewer.href}">
          <img class="viewer_icon" src={viewer.logo}/>
        </a>
        {:else}
          <img class="viewer_icon" src={viewer.logo}/>
        {/if}

        {#if viewer.html}<div class="viewer_html">{@html viewer.html.replace("{URL}", source)}</div>{/if}
      </li>

    {/each}
    </ul>

  </div>

  
  <style>
    :global(.openwith code) {
      background: lightgrey;
    }

    .viewer_html {
      position: absolute;
      background: white;
      padding: 10px;
      z-index: 100;
      left: 0;
      right: 0;
      visibility: hidden;
      overflow: scroll;
    }
    li:hover .viewer_html {
      visibility: visible;
    }
    .openwith {
      position: "relative"
    }

    li {
      display: inline-block
    }

    a,
    a:visited {
      color: #ff512f;
    }
    .json {
      text-align: left;
      margin-top: 10px;
      color: #faebd7;
      background-color: #263749;
      padding: 10px;
      font-size: 14px;
      border-radius: 10px;
      font-family: monospace;
    }
  
    .viewer_icon {
      max-height: 32px;
      max-width: 32px;
      margin: 2px;
      border-radius: 5px;
      vertical-align: middle;
    }
  </style>
  