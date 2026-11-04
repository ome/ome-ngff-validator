import { validateRfc8Multiscale as v } from "../../src/rfc8.js";
import assert from "node:assert";
const u = (n) => `0192f3a0-7c1e-7b00-9c22-0000000000${n}`;
const scale = (id, s) => ({ type: "scale", id: u(id), path: { type: "zarr", format: "relative", href: "./s" + id },
  coordinate_transformations: [{ type: "scale", scale: s, input: { type: "scale", ref: u(id) }, output: { type: "coordinate_system", ref: u(20) } }] });
const good = { version: "0.x", type: "multiscale", id: u("02"), name: "raw",
  coordinate_systems: [{ type: "coordinate_system", id: u(20), name: "physical", axes: ["c","z","y","x"].map(name => ({ name })) }],
  scales: [scale("0c", [1, .5, .1, .1]), scale("0d", [1, .5, .2, .2])] };
assert.deepStrictEqual(v(good), []);
const bad = structuredClone(good);
bad.scales[1].id = u("0c"); bad.scales[0].coordinate_transformations[0].scale = [1, 2];
bad.traits = [{ type: "https://napari.org/ngff/rendering" }];
const e = v(bad);
assert(e.some(x => x.includes("already declared")), e);
assert(e.some(x => x.includes("2 values")), e);
assert(e.some(x => x.includes("extension_manifest")), e);
console.log("ok");
import { readFileSync } from "node:fs";
const sample = JSON.parse(readFileSync(new URL("./valid_multiscale.zarr/zarr.json", import.meta.url)));
assert.deepStrictEqual(v(sample.attributes.ome), []);
console.log("sample ok");
import { rfc8Warnings } from "../../src/rfc8.js";
const w = rfc8Warnings(sample.attributes.ome);
assert(w.length === 1 && w[0].includes('"omero"'), w);
console.log("warnings ok");
import { toLegacyMultiscales } from "../../src/rfc8.js";
const ms = toLegacyMultiscales(sample.attributes.ome).multiscales[0];
assert(ms.datasets.length === 5 && ms.datasets[0].path === "0" && ms.axes.length === 4);
console.log("adapter ok");
