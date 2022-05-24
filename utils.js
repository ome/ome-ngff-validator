export async function getJson(url) {
  return fetch(url).then((rsp) => rsp.json());
}

export function log(text) {
  const el = document.createElement("pre");
  el.innerHTML = text;
  document.getElementById("app").appendChild(el);
}

export function logJson(data) {
  log(JSON.stringify(data, null, 2));
}

let schemas = {};

export async function getSchema(version) {
  if (!schemas[version]) {
    const schema_url = `https://raw.githubusercontent.com/ome/ngff/main/${version}/schemas/image.schema`;
    log("Loading schema... " + schema_url);
    const schema = await getJson(schema_url);
    // delete to avoid invalid: $schema: "https://json-schema.org/draft/2020-12/schema" not found
    delete schema["$schema"];
    schemas[version] = schema;
  }
  return schemas[version];
}
