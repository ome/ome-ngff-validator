import "./style.css";

import Ajv from "ajv";

import { getJson, logJson, log, getSchema, renderRegion } from "./utils";

const ajv = new Ajv({ strict: false }); // options can be passed, e.g. {allErrors: true}

const CURRENT_VERSION = "0.4";
const sample_images_url =
  "https://raw.githubusercontent.com/ome/blog/master/_data/zarr_data_2020-11-04.json";

function validateAndLog(schema, jsonData, logValid = true) {
  const validate = ajv.compile(schema);
  const valid = validate(jsonData);
  if (valid) {
    if (logValid) {
      log(
        "<div style='color: green; font-size:24px; border:solid green 1px; padding: 10px; border-radius: 5px; background: #eeffee'>VALID!</span>"
      );
    }
  } else {
    log(
      "<div style='color: red; font-size:24px; border:solid red 1px; padding: 10px; border-radius: 5px; background: #ffeeee'>NOT VALID!</span>"
    );
    validate.errors.forEach((error) => logJson(error));
  }
  return valid;
}

async function validatePlate(rootAttrs, source) {
  const version = rootAttrs.plate.version;
  if (!version) {
    log("No 'plate.version' found");
    return;
  }
  log("OME-NGFF plate version: " + version);

  // load Schema - correct version
  const schema = await getSchema(version, "plate");
  log("Validating " + source);

  // Validate...
  console.log(schema);
  validateAndLog(schema, rootAttrs);

  // Validate wells...
  await validateWells(rootAttrs.plate, source, version);
}

function logPlate(plateAttrs) {
  let keyHtml = `Key: Well: <span class='valid'>valid</span> / <span class='invalid'>invalid</span>. First Image: valid: ✓ / invalid: ⨯`;
  log(keyHtml);
  // add a table, where each Well is a <td id=path>
  let html = plateAttrs.rows
    .map((row) => {
      return `<tr>${plateAttrs.columns
        .map((col) => `<td id="${row.name}/${col.name}"></td>`)
        .join("")}</tr>`;
    })
    .join("");
  const table = document.createElement("table");
  table.innerHTML = html;
  document.getElementById("app").appendChild(table);
}

async function validateWells(plateAttrs, source, version) {
  // cache the schema, so it's not loaded lots of times async
  await getSchema(version, "well");
  await getSchema(version, "image");
  // build the plate html - Wells updated by code below
  logPlate(plateAttrs);
  // process all wells at the same time
  plateAttrs.wells.forEach(async function (well) {
    let wellPath = well.path;
    let wellUrl = source + wellPath + "/.zattrs";
    let wellAttrs = await getJson(wellUrl);
    console.log(wellAttrs);
    let wellVersion = wellAttrs.version || version;
    const schema = await getSchema(wellVersion, "well");
    const valid = validateAndLog(schema, wellAttrs, false);
    if (valid) {
      document.getElementById(wellPath).classList.add("valid");
    } else {
      document.getElementById(wellPath).classList.add("invalid");
    }

    // let's just validate the FIRST image for each Well!
    let imagePath = wellAttrs.well.images[0].path;
    let imageUrl = source + wellPath + "/" + imagePath + "/.zattrs";
    let imageAttrs = await getJson(imageUrl);
    let imgValid = await validateMultiscales(
      imageAttrs,
      null,
      wellVersion,
      false
    );
    if (imgValid) {
      document.getElementById(wellPath).innerHTML = "✓";
    } else {
      document.getElementById(wellPath).innerHTML = "⨯";
    }
  });
}

async function validateMultiscales(
  rootAttrs,
  source,
  defaultVersion,
  logValid = true
) {
  // source is optional - required for loading paths to arrays

  const version = rootAttrs.multiscales[0].version;
  if (!version) {
    log("No 'multiscales[0].version' found");
    version = defaultVersion || CURRENT_VERSION;
  }
  if (logValid) {
    log("OME-NGFF multiscales version: " + version);
  }

  // load Schema - correct version
  const schema = await getSchema(version);

  // Validate...
  console.log(schema);
  let imgValid = validateAndLog(schema, rootAttrs, logValid);

  if (!source) {
    // in case we're just validating local JSON?
    return imgValid;
  }

  // Metadata: axes...
  let axesNames = ["t", "c", "z", "y", "x"];
  let axes = rootAttrs.multiscales[0].axes;
  if (axes) {
    axesNames = axes.map((axis) => (axis.name ? axis.name : axis));
  }
  log("Axes: " + JSON.stringify(axesNames));

  let paths = rootAttrs.multiscales[0].datasets.map((d) => d.path);
  log("Paths: " + JSON.stringify(paths));

  // start with smallest resolution (last path...)
  for (let i = 0; i < paths.length; i++) {
    let path = paths[i];
    let zAttrsUrl = source + path + "/.zarray";
    log("Loading..." + zAttrsUrl);
    let arrayAttrs = await getJson(zAttrsUrl);
    const shape = arrayAttrs.shape;
    log("Shape: " + JSON.stringify(shape));
    logJson(arrayAttrs, path + "/.zarray");

    await renderRegion(
      source + path,
      axesNames,
      shape,
      rootAttrs.omero?.channels
    );
  }
}

async function validateLabels(source) {
  log("Checking for labels at " + source + "labels/.zattrs");
  let labelsAttrs;
  try {
    labelsAttrs = await getJson(source + "labels/.zattrs");
    console.log("labelsAttrs", labelsAttrs);
  } catch (e) {
    log("No labels found");
  }
  if (labelsAttrs) {
    logJson(labelsAttrs, "labels/.zattrs");
    if (labelsAttrs.labels) {
      log("Checking labels: " + JSON.stringify(labelsAttrs.labels));
      for (let l = 0; l < labelsAttrs.labels.length; l++) {
        let path = labelsAttrs.labels[l];
        let labelsPath = source + "labels/" + path + "/";
        log("Loading..." + labelsPath + ".zattrs");
        const labelRootAttrs = await getJson(labelsPath + ".zattrs");
        logJson(labelRootAttrs, "labels/" + path + "/.zattrs");
        await validateMultiscales(labelRootAttrs, labelsPath);
      }
    }
  }
}

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
  if (rootAttrs.multiscales) {
    // Multiscales validation...
    log("Validating " + source);
    await validateMultiscales(rootAttrs, source);
    await validateLabels(source);
  } else if (rootAttrs.plate) {
    // validate plate...
    await validatePlate(rootAttrs, source);
  } else {
    log("No multiscales or plate found");
  }
})();
