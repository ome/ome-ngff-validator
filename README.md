# ome-ngff-validator
Web page for validating OME-NGFF files

Deployed at https://ome.github.io/ome-ngff-validator

See https://idr.github.io/ome-ngff-samples/ for samples to try.

## Custom schemas

To specify a location to load schemas from, use the `schemas` query parameter.
For example, this will load schemas from a specified branch of the ngff-spec repo:

```
&schemas=https://raw.githubusercontent.com/will-moore/ngff-spec/refs/heads/scene_coordinateTransformations_input_path_optional/schemas/
```

## FAQ

### CORS issues

Serving OME-Zarr images (or generally zarr stores) from a remote server requires the server to allow cross-origin reads with [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS).
For **public** stores, the response can allow the validator's origin (or `*`):

```xml
<CORSRule>
  <AllowedOrigin>*</AllowedOrigin>
  <AllowedMethod>GET</AllowedMethod>
</CORSRule>
```

### Private S3 stores

If the queried data is stored on a **private** S3 store, the validator cannot access it without credentials.
Loading it will fail with a 401 or 403 error (Permission denied).
If loading fails, you can add your credentials by clicking **Use credentials** and enter an S3 access key,
and a secret key. Some S3 stores also require specifying a region.
Requests to that origin are then retried with [presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html).
Unless you tick "Remember for this tab" (sessionStorage), you will need to re-enter your keys if the page is refreshed.

### Cache control
Browsers may cache fetched metadata, so that requesting data from the same store again may return stale results or yield returned metadata even if the store is private.
Therefore, sensitive stores should be configured to prevent browsers from caching responses by sending `Cache-Control: no-store`.

## Demo
Example: a private Hugging Face bucket via its S3-compatible endpoint, with shareable read-only keys:

```
source:     https://tiagolubiana.s3.hf.co/sample-private-ngff-dataset/6001240_labels.zarr
access key: HFAK1E60mmwcL84SKWRc68ny1mPcxe3
secret key: f9cd5509ce593388e31bd0d88442348cf41b2235ca24e9d4ce278c854e5497ba
region:     us-east-1
```
