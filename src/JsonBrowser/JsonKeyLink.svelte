<script>
  import Icon from "svelte-icons-pack/Icon.svelte";
  import BsInfoCircleFill from "svelte-icons-pack/bs/BsInfoCircleFill";
  import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	function toggle() {
		dispatch('toggle');
	}

  export let name;
  export let version;

  // mapping from Spec key-words -> #achors on ngff page
  const urls_01 = {
    "multiscales": "multiscale-md",
    "omero": "omero-md",
    "labels": "labels-md",
    "image-label": "label-md",
    "plate": "plate-md",
    "well": "well-md",
  }

  const all_urls = {
    "0.1": urls_01,
    "0.2": urls_01,
    "0.3": urls_01,
    "0.4": {
      "axes": "axes-md",
      "coordinateTransforms": "trafo-md",
      ...urls_01
    }
  }

  const version_urls = all_urls[version];

  let url;

  if (version_urls[name]) {
    url = `https://ngff.openmicroscopy.org/${version}/index.html#${version_urls[name]}`;
  }
</script>

<span on:click={toggle} class="key" href={url}>{name}{#if url}<a
  on:click|stopPropagation target="_blank" href={url} title="Open ngff spec for {name}.">
    <Icon className="info" src={BsInfoCircleFill} />
  </a>{/if}</span>

<style>
  a {
    color: white;
    position: absolute;
    padding: 2px;
    visibility: hidden;
  }

  .key:hover a {
    visibility: visible;
  }
  .key {
    position: relative;
    color: rgb(154, 217, 254);
    cursor: pointer;
  }
</style>
