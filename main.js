import "./style.css";

import Ajv from "ajv";

import { getJson, logJson, log, getSchema, renderRegion } from "./utils";

const ajv = new Ajv({ strict: false }); // options can be passed, e.g. {allErrors: true}

const sample_images_url =
  "https://raw.githubusercontent.com/ome/blog/master/_data/zarr_data_2020-11-04.json";


(async function () {
  // Run this on page load...
  const searchParams = new URLSearchParams(window.location.search);
  let source = searchParams.get("source");
  if (!source) {
    alert(
      "Use e.g. ?source=https://uk1s3.embassy.ebi.ac.uk/idr/zarr/v0.3/9836842.zarr to load OME-NGFF"
    );
  }
  if (!source.endsWith("/")) {
    source = source + "/";
  }

  // load JSON to be validated...
  log("Loading JSON... " + source + ".zattrs");
  const rootAttrs = await getJson(source + ".zattrs");
  logJson(rootAttrs, ".zattrs JSON");
  if (!rootAttrs.multiscales) {
    log("No 'multiscales' found")
  }
  const version = rootAttrs.multiscales[0].version;
  if (!version) {
    log("No 'multiscales[0].version' found")
  }
  log("OME-NGFF multiscales version: " + version);

  // load Schema - correct version
  const schema = await getSchema(version);
  console.log(schema);
  const validate = ajv.compile(schema);

  // Validate...
  log("Validating " + source);
  const valid = validate(rootAttrs);
  if (valid) {
    log("Valid!")
  } else {
    log("NOT VALID!")
    validate.errors.forEach(error => logJson(error));
  }

  // Metadata: axes...
  let axesNames = ["t", "c", "z", "y", "x"];
  let axes = rootAttrs.multiscales[0].axes;
  if (axes) {
      axesNames = axes.map(axis => axis.name ? axis.name : axis);
  }
  log("Axes: " + JSON.stringify(axesNames));

  let paths = rootAttrs.multiscales[0].datasets.map(d => d.path);
  log("Paths: " + JSON.stringify(paths));

  // start with smallest resolution (last path...)
  for (let i=0; i<paths.length; i++) {
    let path = paths[i];
    let zAttrsUrl = source + path + "/.zarray";
    log("Loading..." + zAttrsUrl)
    let arrayAttrs = await getJson(zAttrsUrl);
    const shape = arrayAttrs.shape;
    log("Shape: " + JSON.stringify(shape));
    logJson(arrayAttrs, path + "/.zarray");
  
    await renderRegion(source + path, axesNames, shape, rootAttrs.omero?.channels);
};
})();
