// import { slice, openArray } from "https://cdn.skypack.dev/zarr";

import Ajv from "ajv";

export const CURRENT_VERSION = "0.5";
// versions to check for e.g. attributes['https://ngff.openmicroscopy.org/0.5']
// which start at version 0.5
export const NAMESPACED_VERSIONS = ["0.5"]
export const FILE_NOT_FOUND = "File not found";

const ajv = new Ajv({ strict: false }); // options can be passed, e.g. {allErrors: true}

export function getSchemaUrl(schemaName, version) {
  if (version == "0.5") {
    // TEMP: use open PR branch
    return `https://raw.githubusercontent.com/normanrz/ngff/spec-rfc2/latest/schemas/${schemaName}.schema`;
  } else if (version == "0.5-dev1") {
    https://raw.githubusercontent.com/d-v-b/ngff/multiple_zarr_versions/0.5-dev1/schemas/image.schema
    return `https://raw.githubusercontent.com/d-v-b/ngff/multiple_zarr_versions/0.5-dev1/schemas/${schemaName}.schema`;
  }
  return `https://raw.githubusercontent.com/ome/ngff/main/${version}/schemas/${schemaName}.schema`;
}

function getNamespacedKey(version) {
  if (!version) {
    version = CURRENT_VERSION;
  }
  return `https://ngff.openmicroscopy.org/${version}`;
}


// fetch() doesn't error for 404 etc.
async function fetchHandleError(url) {
  let msg = `Error Loading ${url}:`;
  let rsp;
  try {
    rsp = await fetch(url).then(function (response) {
      if (!response.ok) {
        // make the promise be rejected if we didn't get a 2xx response
        // NB. statusText could be "Not Found" or "File not found" depending on server
        // Standardise based on response.status
        if (response.status == 404) {
          msg += ` ${FILE_NOT_FOUND}`;
        } else {
          msg += ` ${response.statusText}`;
        }
      } else {
        return response;
      }
    });
  } catch (error) {
    console.log("check for CORS...");
    console.log(error);
    try {
      let corsRsp = await fetch(url, { mode: "no-cors" });
      console.log("corsRsp", corsRsp);
      // If the 'no-cors' mode allows this to return, then we
      // likely failed due to CORS in the original request
      msg += " Failed due to CORS issues.";
    } catch (anotherError) {
      console.log("Even `no-cors` request failed!", anotherError);
      // return the original error (same as anotherError?)
      msg += ` ${error}`;
    }
  }
  if (rsp) {
    return rsp;
  }
  throw Error(msg);
}

export function getZarrGroupAttrsFileName(ngffVersion) {
  if (["0.1", "0.2", "0.3", "0.4"].includes(ngffVersion)) {
    return ".zattrs";
  }
  return "zarr.json";
}

export function getZarrArrayAttrsFileName(ngffVersion) {
  if (["0.1", "0.2", "0.3", "0.4"].includes(ngffVersion)) {
    return ".zarray";
  }
  return "zarr.json";
}

export async function getZarrGroupAttrs(zarr_dir) {
  let rawJson = await getZarrJson(zarr_dir, ".zattrs");
  let groupAttrs = rawJson.attributes || rawJson;
  return groupAttrs;
}

export async function getZarrArrayJson(zarr_dir) {
  return getZarrJson(zarr_dir, ".zarray");
}

async function getZarrJson(zarr_dir, alternative=".zattrs") {
  let zarrJson;
  let msg;
  // try to load v2 /.zattrs or v3 /zarr.json
  try {
    zarrJson = await getJson(zarr_dir + "/zarr.json");
  } catch (error) {
    console.log("getZarrJson", error)
    if (!error.message.includes(FILE_NOT_FOUND)) {
      throw error;
    }
    // IF we got a 404 then try other URL
    try {
      zarrJson = await getJson(zarr_dir + `/${alternative}`);
    } catch (err2) {
      if (err2.message.includes(FILE_NOT_FOUND)) {
        throw Error(`No ${alternative} or zarr.json at ${zarr_dir}: ${FILE_NOT_FOUND}`);
      } else {
        // First error was 404 but this isn't...
        throw err2;
      }
    }

  }
  if (zarrJson) {
    return zarrJson;
  }
}

export async function getJson(url) {
  return fetchHandleError(url).then((rsp) => rsp.json());
}

export async function getXmlDom(url) {
  let xmlString = await getText(url);
  console.log("xmlString", xmlString);
  var domParser = new DOMParser();
  let dom = domParser.parseFromString(xmlString, "text/xml");
  console.log("dom", dom);
  return dom;
}

export async function getText(url) {
  return fetchHandleError(url).then((rsp) => rsp.text());
}

let schemas = {};

export async function getSchema(schemaUrl) {
  if (!schemas[schemaUrl]) {
    console.log("Loading schema... " + schemaUrl);
    const schema = await getJson(schemaUrl);
    // delete to avoid invalid: $schema: "https://json-schema.org/draft/2020-12/schema" not found
    delete schema["$schema"];
    schemas[schemaUrl] = schema;
  }
  return schemas[schemaUrl];
}

export function getVersion(ngffData) {
  let version = ngffData.multiscales
    ? ngffData.multiscales[0].version
    : ngffData.plate
    ? ngffData.plate.version
    : ngffData.well
    ? ngffData.well.version
    : undefined;
  console.log("version", version);
  return version;
}

export function toTitleCase(text) {
  return text[0].toUpperCase() + text.slice(1);
}

export function getDataType(jsonData) {
  // E.g. 'Image', 'Plate' or 'Well'
  if (jsonData["bioformats2raw.layout"]){
    return "bioformats2raw.layout";
  }
  let name = getSchemaName(jsonData);
  return name ? toTitleCase(name) : "";
}

export function getSchemaName(jsonData) {
  const names = getSchemaNames(jsonData);
  return names[0];
}

export function getSchemaNames(ngffData) {
  let names = [];
  if (ngffData.multiscales) {
    names.push("image");
  }
  if (ngffData.plate) {
    names.push("plate");
  }
  if (ngffData.well) {
    names.push("well");
  }
  if (ngffData["image-label"]) {
    names.push("label");
  }
  return names;
}

export function getSchemaUrlsForJson(rootAttrs) {
  console.log('getSchemaUrlsForJson rootAttrs', rootAttrs)
  const msVersion = getVersion(rootAttrs);
  const version = msVersion || CURRENT_VERSION;
  // for v0.5 onwards, rootAttrs is nested under attributes.namespace...
  if (NAMESPACED_VERSIONS.includes(version)) {
    rootAttrs = rootAttrs.attributes[getNamespacedKey(version)];
  }
  const schemaNames = getSchemaNames(rootAttrs);
  return schemaNames.map(name => getSchemaUrl(name, version));
}

export function validateData(schema, jsonData) {
  const validate = ajv.compile(schema);
  const valid = validate(jsonData);
  let errors = [];
  if (!valid) {
    errors = validate.errors;
    console.log(errors);
  }
  return errors;
}

export async function validate(jsonData) {
  // get version, lookup schema, do validation...
  let version = getVersion(jsonData);
  console.log("VERSION", version);

  const schemaUrls = getSchemaUrlsForJson(jsonData);

  if (schemaUrls.length == 0) {
    return ["Unrecognised JSON data"];
  }

  if (!version) {
    console.log("No version found, using: " + CURRENT_VERSION);
    version = CURRENT_VERSION;
  }

  let errors = [];
  for (let s=0; s<schemaUrls.length; s++) {
    let schema = await getSchema(schemaUrls[s]);
    let errs = validateData(schema, jsonData);
    errors = errors.concat(errs);
  }
  return errors;
}

export function formatBytes(bytes) {
  var sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes == 0) return "0 Byte";
  var i = Math.floor(Math.log(bytes) / Math.log(1000));
  return (bytes / Math.pow(1000, i)).toFixed(2) + " " + sizes[i];
}

export function getChunkShape(zarray) {
  return zarray.chunks || zarray.chunk_grid?.configuration?.chunk_shape;
}

export function getArrayDtype(zarray) {
  return zarray.dtype || zarray.data_type;
}

export function getSearchParam(key) {
  const searchParams = new URLSearchParams(window.location.search);
  let value = searchParams.get(key);
  return value;
}

export function range(length) {
  return Array.from({ length }, (_, i) => i);
}
