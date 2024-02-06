// import { slice, openArray } from "https://cdn.skypack.dev/zarr";

import Ajv from "ajv";

export const CURRENT_VERSION = "0.4";
export const DEV_VERSION = "0.5-dev"

const ajv = new Ajv({ strict: false }); // options can be passed, e.g. {allErrors: true}

export function getSchemaUrl(schemaName, version) {
  if (version == DEV_VERSION) {
    return `https://raw.githubusercontent.com/bogovicj/ngff/coord-transforms/latest/schemas/${schemaName}.schema`;
  }
  return `https://raw.githubusercontent.com/ome/ngff/main/${version}/schemas/${schemaName}.schema`;
}

// fetch() doesn't error for 404 etc.
async function fetchHandleError(url) {
  let msg = `Error Loading ${url}:`;
  let rsp;
  try {
    rsp = await fetch(url).then(function (response) {
      if (!response.ok) {
        // make the promise be rejected if we didn't get a 2xx response
        msg += ` ${response.statusText}`;
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
    try {
      const schema = await getJson(schema_url);
      // delete to avoid invalid: $schema: "https://json-schema.org/draft/2020-12/schema" not found
      delete schema["$schema"];
      schemas[cacheKey] = schema;
    } catch (error) {
      throw new Error(`No schema at ${schema_url}. Version ${version} may be invalid.`);
    }
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

export function getSchemaNames(jsonData) {
  let names = [];
  if (jsonData.multiscales) {
    names.push("image");
  }
  if (jsonData.plate) {
    names.push("plate");
  }
  if (jsonData.well) {
    names.push("well");
  }
  if (jsonData["image-label"]) {
    names.push("label");
  }
  return names;
}

export function getSchemaUrlsForJson(rootAttrs) {
  const msVersion = getVersion(rootAttrs);
  const version = msVersion || CURRENT_VERSION;
  const schemaNames = getSchemaNames(rootAttrs);
  return schemaNames.map(name => getSchemaUrl(name, version));
}

export function validateData(schema, jsonData, extraSchemas) {
  // call ajv.addSchema(schema) for each schema
  let withSchema = extraSchemas.reduce((prev, curr) => prev.addSchema(curr), ajv);
  const validate = withSchema.compile(schema);
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
  const schemaNames = getSchemaNames(jsonData);

  if (schemaNames.length == 0) {
    return ["Unrecognised JSON data"];
  }

  let version = getVersion(jsonData);

  if (!version) {
    console.log("No version found, using: " + CURRENT_VERSION);
    version = CURRENT_VERSION;
  }

  let refSchemas = [];
  // TODO: need to know whether to load other schemas...
  // For now, we can use version check... 
  if (version === DEV_VERSION) {
    const ctSchema = await getSchema(version, "coordinate_transformation");
    const csSchema = await getSchema(version, "coordinate_systems");
    const axes = await getSchema(version, "axes");
    refSchemas = [ctSchema, csSchema, axes];
  }
  let errors = [];
  for (let s=0; s<schemaNames.length; s++) {
    let schema = await getSchema(version, schemaNames[s]);
    let errs = validateData(schema, jsonData, refSchemas);
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

export function getSearchParam(key) {
  const searchParams = new URLSearchParams(window.location.search);
  let value = searchParams.get(key);
  return value;
}

export function range(length) {
  return Array.from({ length }, (_, i) => i);
}
