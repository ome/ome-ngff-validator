<script>
  export let openCredentials = () => {};
  export let onValidate = () => {};

  let sourceInput;

  function credentials() {
    if (sourceInput.value && !sourceInput.reportValidity()) return;
    openCredentials(sourceInput.value ? new URL(sourceInput.value).origin : null);
  }
</script>

<article>
  <h1>OME-NGFF Validator</h1>

  <h3>Validate your data</h3>
  <p>Paste the URL of an OME-Zarr file to validate it:</p>
  <form method="get" on:submit|preventDefault={() => onValidate(sourceInput.value)}>
    <input
      bind:this={sourceInput}
      type="url"
      name="source"
      placeholder="https://example.com/path/to/image.zarr"
      required
    />
    <button type="submit">Validate</button>
  </form>
  <p class="creds">Private store? <button type="button" on:click={credentials}>Use credentials</button></p>

  <hr>

  <h3>Examples</h3>
  <p>
    Or try one of these samples. You can also link directly to any file with
    <code>?source=URL</code>.
  </p>

  <ul>
    <li>
      A single image, OME-NGFF v0.5:
      <a
        href="{location}?source=https://livingobjects.ebi.ac.uk/idr/zarr/v0.5/idr0062A/6001240_labels.zarr"
      >
        ?source=https://livingobjects.ebi.ac.uk/idr/zarr/v0.5/idr0062A/6001240_labels.zarr
      </a>
    </li>

    <li>
      The same image, OME-NGFF v0.4:
      <a
        href="{location}?source=https://livingobjects.ebi.ac.uk/idr/zarr/v0.4/idr0062A/6001240.zarr"
      >
        ?source=https://livingobjects.ebi.ac.uk/idr/zarr/v0.4/idr0062A/6001240.zarr
      </a>
    </li>

    <li>
      A bioformats2raw.layout collection:
      <a
        href="{location}?source=https://livingobjects.ebi.ac.uk/idr/zarr/v0.2/idr0070A/9838562.zarr"
      >
        ?source=https://livingobjects.ebi.ac.uk/idr/zarr/v0.2/idr0070A/9838562.zarr
      </a>
    </li>

    <li>
      A plate:
      <a
        href="{location}?source=https://livingobjects.ebi.ac.uk/idr/zarr/v0.4/idr0001A/2551.zarr"
      >
        ?source=https://livingobjects.ebi.ac.uk/idr/zarr/v0.4/idr0001A/2551.zarr
      </a>
    </li>
    <li>
      A v0.6 scene:
      <a
        href="{location}?source=https://livingobjects.ebi.ac.uk/idr/mobie/clem-scene.ome.zarr"
      >
        ?source=https://livingobjects.ebi.ac.uk/idr/mobie/clem-scene.ome.zarr
      </a>
    </li>
  </ul>

  <hr>

  <h3>Testing invalid OME-NGFF examples</h3>
  <p>
    These examples are intentionally invalid. They are used to test the
    validator's error handling.
  </p>
  <ul>
    <li>
      Invalid version:
      <a
        href="{location}?source=https://raw.githubusercontent.com/ome/ome-ngff-validator/refs/heads/main/test_samples/invalid/invalid_version.zarr/"
      >
        invalid_version.zarr
      </a>
    </li>

    <li>
      Schema validation error:
      <a
        href="{location}?source=https://raw.githubusercontent.com/ome/ome-ngff-validator/refs/heads/main/test_samples/invalid/missing_min.zarr/"
      >
        missing_min.zarr
      </a>
    </li>

    <li>
      Missing version (v0.5+):
      <a
        href="{location}?source=https://raw.githubusercontent.com/ome/ome-ngff-validator/refs/heads/main/test_samples/invalid/no_version_v0.5.zarr/"
      >
        no_version_v0.5.zarr
      </a>
    </li>

    <li>
      Invalid unit:
      <a
        href="{location}?source=https://raw.githubusercontent.com/lubianat/ome-ngff-validator/refs/heads/main/test_samples/invalid/invalid_unit.zarr/"
      >
        invalid_unit.zarr
      </a>
    </li>

    <li>
      Invalid axes length:
      <a
        href="{location}?source=https://raw.githubusercontent.com/lubianat/ome-ngff-validator/refs/heads/main/test_samples/invalid/invalid_axes_length.zarr/"
      >
        invalid_axes_length.zarr
      </a>
    </li>

    <li>
      Misleading "units" name:
      <a
        href="{location}?source=https://raw.githubusercontent.com/lubianat/ome-ngff-validator/refs/heads/main/test_samples/invalid/invalid_units_name.zarr/"
      >
        invalid_units_name.zarr
      </a>
    </li>


  </ul>
</article>

<style>
  article {
    position: relative;
    width: 90%;
    margin: auto;
  }

  h1 {
      font-size: 2.0em;
      margin-bottom: 15px;
  }

  h3 {
    margin-bottom: 10px
  }

  li {
    list-style: none;
    margin: 15px;
  }

  form {
    display: flex;
    gap: 10px;
    max-width: 700px;
    margin: 15px auto;
  }

  input {
    flex: 1;
    min-width: 0;
    font-size: 1.2em;
    padding: 12px 15px;
    border: solid #ddd 1px;
    border-radius: 10px;
    color: #343a40;
  }

  input:focus {
    outline: 2px solid var(--omeLinkBlue);
    border-color: var(--omeLinkBlue);
  }

  button {
    font-size: 1.2em;
    padding: 12px 25px;
    border: 0;
    border-radius: 10px;
    background-color: var(--omeLinkBlue);
    color: white;
    cursor: pointer;
  }

  button:hover {
    filter: brightness(0.9);
  }

  /* ponytail: mirrors .creds in App.svelte (error page) */
  .creds {
    text-align: center;
    color: #8a8a8a;
  }

  .creds button {
    padding: 0;
    background: none;
    font-size: 1em;
    color: var(--omeLinkBlue);
  }

  .creds button:hover {
    filter: none;
    text-decoration: underline;
  }

  hr {
    margin: 30px 0;
    background: #ddd;
    border: 0;
    height: 1px;
  }
</style>
