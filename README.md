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

## Private S3 stores

If loading fails (e.g. 401/403), click **Use credentials** and enter an S3 access key,
secret key and region. Requests to that origin are then retried with AWS SigV4 signing.
Keys stay in memory unless you tick "Remember for this tab" (sessionStorage).

The bucket must allow CORS for the `authorization`, `x-amz-date` and `x-amz-content-sha256`
headers. Browsers may cache fetched metadata, so sensitive stores should send `Cache-Control: no-store`.

Example: a private Hugging Face bucket via its S3-compatible endpoint, with shareable read-only keys:

```
source:     https://tiagolubiana.s3.hf.co/sample-private-ngff-dataset/6001240_labels.zarr
access key: HFAK1E60mmwcL84SKWRc68ny1mPcxe3
secret key: f9cd5509ce593388e31bd0d88442348cf41b2235ca24e9d4ce278c854e5497ba
region:     us-east-1
```
