// import { slice, openArray } from "https://cdn.skypack.dev/zarr";

import Ajv from "ajv";

export const CURRENT_VERSION = "0.5";
export const FILE_NOT_FOUND = "File not found";


export function getSchemaUrl(schemaName, version) {
  return `https://raw.githubusercontent.com/ome/ngff/v${version}/schemas/${schemaName}.schema`;
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
  let groupAttrs = await getZarrJson(zarr_dir, ".zattrs");
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
  // if we have attributes.ome then this is version 0.5+
  if (ngffData.attributes?.ome) {
    if (ngffData.attributes.ome.version) {
      return ngffData.attributes.ome.version;
    } else {
      throw Error("No version found in attributes.ome");
    }
  }

  // Used if we have our 'attributes' at the root
  if (ngffData.ome?.version) {
    return ngffData.ome.version;
  }
  if (ngffData.version) {
    return ngffData.version;
  }
  // Handle version 0.4 and earlier
  let version = ngffData.multiscales
    ? ngffData.multiscales[0].version
    : ngffData.plate
    ? ngffData.plate.version
    : ngffData.well
    ? ngffData.well.version
    : undefined;
  console.log("version", version);
  // for 0.4 and earlier, version wasn't MUST and we defaulted
  // to using v0.4 for validation. To preserve that behaviour
  // return "0.4" if no version found.
  return version || "0.4";
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
  // v0.5+ unwrap the attrs under "attributes.ome"
  let omeAttrs = rootAttrs?.attributes?.ome || rootAttrs;

  const msVersion = getVersion(omeAttrs);
  const version = msVersion || CURRENT_VERSION;
  const schemaNames = getSchemaNames(omeAttrs);
  return schemaNames.map(name => getSchemaUrl(name, version));
}

export function validateData(schema, jsonData, extraSchemas) {
  // call ajv.addSchema(schema) for each schema
  const ajv = new Ajv({ strict: false }); // options can be passed, e.g. {allErrors: true}
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
  // v0.5+ unwrap the attrs under "attributes.ome"
  let omeAttrs = jsonData?.attributes?.ome || jsonData;

  let version = getVersion(omeAttrs);
  // v0.5+ (with attributes.ome) MUST have top-level version
  if (jsonData?.attributes?.ome) {
    if (!jsonData.attributes.ome.version) {
      return ["No version found under attributes.ome"];
    }
  } else if (!version) {
    // default to last version pre 0.5 rules.
    version = "0.4";
  }
  
  console.log("validate VERSION", version, jsonData);

  const schemaUrls = getSchemaUrlsForJson(jsonData);

  if (schemaUrls.length == 0) {
    return ["No schemas found. Unrecognised JSON data"];
  }

  if (!version) {
    console.log("No version found, using: " + CURRENT_VERSION);
    version = CURRENT_VERSION;
  }

  let refSchemas = [];
  // TODO: need to know whether to load other schemas...
  // For now, we can use version check... 
  if (version === "0.5") {
    const versionSchema = await getSchema(getSchemaUrl("_version", version));
    // const schemaSchema = await getSchema(getSchemaUrl("_schema_url", version));
    refSchemas = [versionSchema];
    // For version 0.5+, we validate the "attributes" content.
    // If no "attributes" exist, then it will be assumed this is v0.4 data (see above)
    jsonData = jsonData.attributes;
  }
  let errors = [];
  for (let s=0; s<schemaUrls.length; s++) {
    let schema = await getSchema(schemaUrls[s]);
    let errs = validateData(schema, jsonData, refSchemas);
    errors = errors.concat(errs);
  }

  if (errors.length > 0) {
    console.log("Validation errors", errors, jsonData);
  }
  return errors;
}

export function formatBytes(bytes) {
  var sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes == 0) return "0 Byte";
  var i = Math.floor(Math.log(bytes) / Math.log(1000));
  return (bytes / Math.pow(1000, i)).toFixed(2) + " " + sizes[i];
}

export function getChunkAndShardShapes(zarray) {
  // Returns [chunkShape, shardShape]. shardShape may be undefined
  // For zarr v2 we just have chunks:
  if (zarray.chunks) {
    return [zarray.chunks, undefined]
  }
  // For zarr v3 we check for sharding
  // Based on https://github.com/zarr-developers/zarr-specs/blob/main/docs/v3/codecs/sharding-indexed/v1.0.rst#configuration-parameters
  const chunk_shape = zarray.chunk_grid?.configuration?.chunk_shape;
  let sharding_codecs = zarray.codecs?.filter(codec => codec.name == "sharding_indexed");
  const sub_chunks = sharding_codecs?.[0]?.configuration?.chunk_shape;
  // if we have sharding, a 'chunk' is the sub-chunk of a shard
  if (sub_chunks) {
    return [sub_chunks, chunk_shape]
  } else {
    return [chunk_shape, undefined];
  }
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
