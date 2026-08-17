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
