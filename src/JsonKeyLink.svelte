<script>
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

{#if url}
  <a target="_blank" class="key" href={url} title="Open ngff spec for {name}.">
    {name}
  </a>
{:else}
  <span class="key" href={url}>{name}</span>
{/if}

<style>
  .key {
    color: rgb(154, 217, 254);
  }
  a {
    text-decoration-color: rgba(154, 217, 254, 0.5);
  }
  a:hover {
    text-decoration-color: rgb(154, 217, 254);
  }
</style>
