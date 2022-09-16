// import { slice, openArray } from "https://cdn.skypack.dev/zarr";

import Ajv from "ajv";

export const CURRENT_VERSION = "0.4";

const ajv = new Ajv({ strict: false }); // options can be passed, e.g. {allErrors: true}

export function getSchemaUrl(schemaName, version) {
  return `https://raw.githubusercontent.com/ome/ngff/main/${version}/schemas/${schemaName}.schema`;
}

// fetch() doesn't error for 404 etc.
async function fetchHandleError(url) {
  return await fetch(url).then(function (response) {
    if (!response.ok) {
      console.log("Fetch error:", response);
      // make the promise be rejected if we didn't get a 2xx response
      throw new Error(`Error loading ${url}: ${response.statusText}`);
    } else {
      return response;
    }
  });
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

export async function getSchema(version, schemaName = "image") {
  let cacheKey = schemaName + version;
  if (!schemas[cacheKey]) {
    const schema_url = getSchemaUrl(schemaName, version);
    console.log("Loading schema... " + schema_url);
    const schema = await getJson(schema_url);
    // delete to avoid invalid: $schema: "https://json-schema.org/draft/2020-12/schema" not found
    delete schema["$schema"];
    schemas[cacheKey] = schema;
  }
  return schemas[cacheKey];
}

export function getVersion(jsonData) {
  let version = jsonData.multiscales
    ? jsonData.multiscales[0].version
    : jsonData.plate
    ? jsonData.plate.version
    : jsonData.well
    ? jsonData.well.version
    : undefined;
  return version;
}

export function toTitleCase(text) {
  return text[0].toUpperCase() + text.slice(1);
}

export function getDataType(jsonData) {
  // E.g. 'Image', 'Plate' or 'Well'
  let name = getSchemaName(jsonData);
  return toTitleCase(name);
}

export function getSchemaName(jsonData) {
  // get version, lookup schema, do validation...
  const schemaName = jsonData.multiscales
    ? "image"
    : jsonData.plate
    ? "plate"
    : jsonData.well
    ? "well"
    : undefined;
  return schemaName;
}

export function getSchemaUrlForJson(rootAttrs) {
  const msVersion = getVersion(rootAttrs);
  const version = msVersion || CURRENT_VERSION;
  const schemaName = getSchemaName(rootAttrs);
  return getSchemaUrl(schemaName, version);
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
  const schemaName = getSchemaName(jsonData);

  if (!schemaName) {
    return ["Unrecognised JSON data"];
  }

  let version = getVersion(jsonData);

  if (!version) {
    console.log("No version found, using: " + CURRENT_VERSION);
    version = CURRENT_VERSION;
  }

  let schema = await getSchema(version, schemaName);

  return validateData(schema, jsonData);
}

export function formatBytes(bytes) {
  var sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes == 0) return "0 Byte";
  var i = Math.floor(Math.log(bytes) / Math.log(1000));
  return (bytes / Math.pow(1000, i)).toFixed(2) + " " + sizes[i];
}
