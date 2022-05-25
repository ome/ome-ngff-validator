export async function getJson(url) {
  return fetch(url).then((rsp) => rsp.json());
}

export function log(text) {
  const el = document.createElement("pre");
  el.innerHTML = text;
  document.getElementById("app").appendChild(el);
}

function escapeHTML(html) {
  // https://stackoverflow.com/questions/24816/escaping-html-strings-with-jquery/17546215#17546215
  return document.createElement('div').appendChild(document.createTextNode(html)).parentNode.innerHTML;
}

export function logJson(data, label) {
  let text = escapeHTML(JSON.stringify(data, null, 2));
  if (!label) {
    log(text);
    return;
  }
  // put the JSON in a <details> element
  const details = document.createElement("details")
  const summary = document.createElement("summary")
  summary.innerHTML = label;
  details.appendChild(summary);
  const pre = document.createElement("pre");
  pre.innerHTML = text;
  details.appendChild(pre);
  document.getElementById("app").appendChild(details);
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
