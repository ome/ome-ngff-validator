<script>
  import viewers_json from "../../../public/ngff_viewers.json";

  import vizarr_logo from "/vizarr_logo.png";

  import CopyButton from "./CopyButton.svelte";

  export let source;
  export let dtype;
  export let version;

  let viewers = viewers_json.viewers.map((viewer_data) => {
      let href = viewer_data.href;
      if (href) {
        if (href.includes("{URL}")) {
          href = href.replace("{URL}", source);
        } else {
          href += source;
        }
      }
      // use static import of vizarr_logo.png to get base URL for other logos
      const logo_path = vizarr_logo.replace("/vizarr_logo.png", viewer_data.logo);
      return {...viewer_data, href, logo_path}
    });

    if (version == "0.5") {
      // TODO: update when other viewers support zarr v3
      viewers = viewers.filter((viewer) => viewer.name != "itk-vtk-viewer");
    }

</script>

<div class="openwith">
  <span>Open with:</span>
  <ul>
      {#each viewers as viewer}
        <li>
          {#if viewer.href}
            <a
              title="View {dtype} in {viewer.name}"
              target="_blank"
              href={viewer.href}
            >
              <img
                class="viewer_icon"
                src={viewer.logo_path}
                alt={"Viewer logo"}
              />
            </a>
          {:else}
            <!-- E.g. napari, MoBIE - show a copy button on mouseover -->
            <CopyButton
              copy_text={source}
              title={"Copy URL"}
              button_logo={viewer.logo_path}
            />
          {/if}

          {#if viewer.html}<div class="viewer_html">
              {@html viewer.html.replace("{URL}", source)}
            </div>{/if}
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
    position: "relative";
  }

  li {
    display: inline-block;
  }

  a,
  a:visited {
    color: var(--omeLinkBlue);
  }

  .viewer_icon {
    max-height: 32px;
    max-width: 32px;
    margin: 2px;
    border-radius: 5px;
    vertical-align: middle;
  }
</style>
