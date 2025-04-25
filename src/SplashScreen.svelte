<article>
  <h1>OME-NGFF Validator</h1>
  <p>To validate an OME-NGFF file, use ?source=URL to open a sample. For example:</p>

  <ul>
    <li>
      A single image:
      <a
        href="{location}?source=https://uk1s3.embassy.ebi.ac.uk/idr/zarr/v0.4/idr0062A/6001240.zarr"
      >
        ?source=https://uk1s3.embassy.ebi.ac.uk/idr/zarr/v0.4/idr0062A/6001240.zarr
      </a>
    </li>

    <li>
      A bioformats2raw.layout collection:
      <a
        href="{location}?source=https://uk1s3.embassy.ebi.ac.uk/idr/zarr/v0.2/idr0070A/9838562.zarr"
      >
        ?source=https://uk1s3.embassy.ebi.ac.uk/idr/zarr/v0.2/idr0070A/9838562.zarr
      </a>
    </li>

    <li>
      A plate:
      <a
        href="{location}?source=https://uk1s3.embassy.ebi.ac.uk/idr/zarr/v0.4/idr0001A/2551.zarr"
      >
        ?source=https://uk1s3.embassy.ebi.ac.uk/idr/zarr/v0.4/idr0001A/2551.zarr
      </a>
    </li>
  </ul>

  <hr>

  <h1>Testing invalid OME-NGFF examples</h1>
  <p>
    These examples are intentionally invalid. They are used to test the
    validator's error handling.
  </p>
  <ul>
    <li>
      Invalid version:
      <a
        href="{location}?source=https://raw.githubusercontent.com/will-moore/ome-ngff-validator/refs/heads/test_samples/test_samples/invalid/invalid_version.zarr/"
      >
        invalid_version.zarr
      </a>
    </li>

    <li>
      Schema validation error:
      <a
        href="{location}?source=https://raw.githubusercontent.com/will-moore/ome-ngff-validator/refs/heads/test_samples/test_samples/invalid/missing_min.zarr/"
      >
        missing_min.zarr
      </a>
    </li>

    <li>
      Missing version (v0.5+):
      <a
        href="{location}?source=https://raw.githubusercontent.com/will-moore/ome-ngff-validator/refs/heads/test_samples/test_samples/invalid/no_version_v0.5.zarr/"
      >
        no_version_v0.5.zarr
      </a>
    </li>
  </ul>
</article>

<style>
  article {
    width: 90%;
    margin: auto;
  }

  li {
    list-style: none;
    margin: 15px;
  }

  hr {
    margin: 30px 0;
    background: #ddd;
    border: 0;
    height: 1px;
  }
</style>
