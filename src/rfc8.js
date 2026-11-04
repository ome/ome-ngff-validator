// Validation of the RFC-8 (v2 revision) "multiscale" node.
// ponytail: hand-written checks, no JSON schema published yet; swap for the schema when it lands.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PATH_FORMATS = ["relative", "absolute", "http"];
const isObj = (o) => o && typeof o === "object" && !Array.isArray(o);

export function isRfc8Multiscale(ome) {
  return ome?.type === "multiscale";
}

export function validateRfc8Multiscale(ome) {
  const errors = [];
  const err = (where, msg) => errors.push(`${where}: ${msg}`);
  const ids = new Map(); // id -> where declared

  function declare(obj, where, type) {
    if (obj.type !== type) err(where, `"type" MUST be "${type}"`);
    if (typeof obj.id !== "string" || !UUID.test(obj.id)) {
      err(where, `"id" is required and MUST be a UUID`);
    } else if (ids.has(obj.id)) {
      err(where, `"id" ${obj.id} already declared at ${ids.get(obj.id)}`);
    } else {
      ids.set(obj.id, where);
    }
    if ("name" in obj && typeof obj.name !== "string") err(where, `"name" MUST be a string`);
  }

  function checkPath(p, where) {
    if (!isObj(p)) return err(where, "MUST be a Path object");
    if (typeof p.type !== "string") err(where, `"type" is required`);
    if (!PATH_FORMATS.includes(p.format)) err(where, `"format" MUST be one of ${PATH_FORMATS.join(", ")}`);
    if (typeof p.href !== "string" || !p.href) err(where, `"href" is required`);
    if ("path" in p) err(where, `"path" was renamed to "href"`);
  }

  function checkRef(r, where, type) {
    if (!isObj(r)) return err(where, "MUST be a Reference object");
    if (r.type !== type) err(where, `"type" MUST be "${type}"`);
    if (typeof r.ref !== "string" || !UUID.test(r.ref)) err(where, `"ref" MUST be a UUID`);
    if ("id" in r) err(where, `references use "ref", not "id"`);
    for (const k of Object.keys(r)) {
      if (!["type", "ref", "path"].includes(k)) err(where, `unexpected key "${k}" in reference`);
    }
    if ("path" in r) checkPath(r.path, `${where}.path`);
  }

  if (!isObj(ome)) return ["ome: MUST be an object"];
  if (typeof ome.version !== "string") err("ome", `"version" is required on the root node`);
  declare(ome, "ome", "multiscale");
  if ("attributes" in ome) err("ome", `"attributes" was removed; use "traits"`);
  if ("nodes" in ome) err("ome", `multiscale uses "scales", not "nodes"`);
  if ("multiscales" in ome) err("ome", `"multiscales" array replaced by a single multiscale node`);

  // extension manifest
  const extIds = [];
  if ("extension_manifest" in ome) {
    if (!Array.isArray(ome.extension_manifest)) err("ome.extension_manifest", "MUST be an array");
    else ome.extension_manifest.forEach((e, i) => {
      const w = `ome.extension_manifest[${i}]`;
      if (!isObj(e)) return err(w, "MUST be an object");
      if (typeof e.id !== "string") err(w, `"id" (URI) is required`);
      else extIds.push(e.id);
      if (typeof e.version !== "string") err(w, `"version" is required`);
      if (!Array.isArray(e.schemas)) err(w, `"schemas" MUST be an array`);
      else e.schemas.forEach((s, j) => {
        if (!["json_schema", "linkml"].includes(s?.type)) err(`${w}.schemas[${j}]`, `"type" MUST be json_schema or linkml`);
        if (typeof s?.url !== "string") err(`${w}.schemas[${j}]`, `"url" is required`);
      });
    });
  }

  // traits
  if ("traits" in ome) {
    if (!Array.isArray(ome.traits)) err("ome.traits", "MUST be an array");
    else ome.traits.forEach((t, i) => {
      const w = `ome.traits[${i}]`;
      if (!isObj(t) || typeof t.type !== "string") return err(w, `MUST be an object with a string "type"`);
      if (t.type.includes("://") && !extIds.some((id) => t.type.startsWith(id))) {
        err(w, `extension type ${t.type} is not declared in extension_manifest`);
      }
    });
  }

  // coordinate systems
  const csAxes = new Map();
  if (!Array.isArray(ome.coordinate_systems) || ome.coordinate_systems.length === 0) {
    err("ome", `"coordinate_systems" MUST be a non-empty array`);
  } else ome.coordinate_systems.forEach((cs, i) => {
    const w = `ome.coordinate_systems[${i}]`;
    if (!isObj(cs)) return err(w, "MUST be an object");
    declare(cs, w, "coordinate_system");
    if (!Array.isArray(cs.axes) || cs.axes.length === 0) err(w, `"axes" MUST be a non-empty array`);
    else {
      cs.axes.forEach((a, j) => { if (typeof a?.name !== "string") err(`${w}.axes[${j}]`, `"name" is required`); });
      csAxes.set(cs.id, cs.axes.length);
    }
  });

  // scales
  const outputs = new Set();
  if (!Array.isArray(ome.scales) || ome.scales.length === 0) {
    err("ome", `"scales" MUST be a non-empty array`);
  } else ome.scales.forEach((s, i) => {
    const w = `ome.scales[${i}]`;
    if (!isObj(s)) return err(w, "MUST be an object");
    declare(s, w, "scale");
    checkPath(s.path, `${w}.path`);
    const cts = s.coordinate_transformations;
    if (!Array.isArray(cts) || cts.length === 0) return err(w, `"coordinate_transformations" MUST be a non-empty array`);
    const kinds = cts.map((t) => t?.type).join(",");
    if (kinds !== "scale" && kinds !== "scale,translation") {
      err(`${w}.coordinate_transformations`, `MUST be [scale] or [scale, translation], got [${kinds}]`);
    }
    cts.forEach((t, j) => {
      const tw = `${w}.coordinate_transformations[${j}]`;
      if (!isObj(t)) return err(tw, "MUST be an object");
      checkRef(t.input, `${tw}.input`, "scale");
      checkRef(t.output, `${tw}.output`, "coordinate_system");
      if (t.input?.ref && t.input.ref !== s.id) err(`${tw}.input`, `"ref" MUST be the id of this scale`);
      const out = t.output?.ref;
      if (out && !t.output.path) {
        outputs.add(out);
        if (!csAxes.has(out)) err(`${tw}.output`, `"ref" ${out} is not a coordinate system of this multiscale`);
      }
      const vec = t.type === "scale" ? t.scale : t.type === "translation" ? t.translation : null;
      if (t.type === "scale" || t.type === "translation") {
        if (!Array.isArray(vec) || !vec.every((n) => typeof n === "number")) err(tw, `"${t.type}" MUST be an array of numbers`);
        else if (csAxes.has(out) && vec.length !== csAxes.get(out)) {
          err(tw, `"${t.type}" has ${vec.length} values but coordinate system has ${csAxes.get(out)} axes`);
        }
      }
    });
  });
  if (outputs.size > 1) err("ome.scales", "all scales MUST output to the same coordinate system");

  return errors;
}

// Built-in trait keywords from the RFC-8 revision (§5); anything else should be a declared URI.
const KNOWN_TRAITS = ["plate", "well", "labels", "bioformats2raw", "scene"];

export function rfc8Warnings(ome) {
  return (Array.isArray(ome?.traits) ? ome.traits : [])
    .map((t, i) => [t?.type, i])
    .filter(([type]) => typeof type === "string" && !type.includes("://") && !KNOWN_TRAITS.includes(type))
    .map(([type, i]) => `ome.traits[${i}]: unknown built-in trait "${type}"; extension traits should use a URI type declared in extension_manifest`);
}
