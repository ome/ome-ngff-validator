
import { slice, openArray } from "https://cdn.skypack.dev/zarr";

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
  return document
    .createElement("div")
    .appendChild(document.createTextNode(html)).parentNode.innerHTML;
}

export function logJson(data, label) {
  let text = escapeHTML(JSON.stringify(data, null, 2));
  if (!label) {
    log(text);
    return;
  }
  // put the JSON in a <details> element
  const details = document.createElement("details");
  const summary = document.createElement("summary");
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

function hexToRgb(color) {
  return [0, 2, 4].map((i) => parseInt(color.slice(i, i + 2), 16));
}

async function loadRegion(path, region) {
  // E.g. region = [1,1,1,"0:100", "0:100"]
  region = region.map((dim) => {
    if (typeof dim === "string") {
      let startStop = dim.split(":").map((d) => parseInt(d));
      console.log("startStop", startStop, dim.split(":"));
      return startStop.length === 2 ? slice(...startStop) : startStop[0];
    }
    return dim;
  });
  console.log("region", region);
  const z = await openArray({ store: path });
  let zarray = await z.get(region);
  return zarray;
}

function getMinMax(zarray) {
  const shape = zarray.shape;
  const data = zarray.data;
  const height = shape[0];
  const width = shape[1];
  let minVal = Infinity;
  let maxVal = -Infinity;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let rawValue = data[y][x];
      if (rawValue < minVal) minVal = rawValue;
      if (rawValue > maxVal) maxVal = rawValue;
    }
  }
  return [minVal, maxVal];
}

function range(count) {
  return new Array(count).fill(0).map((a, i) => i);
}

function renderTo8bitArray(planes, channelColors, channelRanges) {
  const height = planes[0].shape[0];
  const width = planes[0].shape[1];
  const rgba = new Uint8ClampedArray(4 * height * width).fill(0);
  let offset = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      for (let p = 0; p < planes.length; p++) {
        let data = planes[p].data;
        let rgb = channelColors[p];
        let range = channelRanges[p];
        let rawValue = data[y][x];
        let fraction = (rawValue - range[0]) / (range[1] - range[0]);
        // for red, green, blue,
        for (let i = 0; i < 3; i++) {
          if (rgb[i] > 0) {
            // rgb[i] is 0-255...
            let v = (fraction * rgb[i]) << 0;
            // increase pixel intensity if value is higher
            rgba[offset + i] = Math.max(rgba[offset + i], v);
          }
        }
      }
      rgba[offset + 3] = 255; // alpha
      offset += 4;
    }
  }
  return rgba;
}

export async function renderRegion(path, axesNames, shape, omeroChannels) {
  const nDims = shape.length;
  const sizeX = shape[nDims - 1];
  const sizeY = shape[nDims - 2];
  if (sizeX > 512 || sizeY > 512) {
    // Don't try to load too much data
    return;
  }

  let channelDim = axesNames.indexOf("c");
  let sizeC = shape[channelDim] || 1;
  console.log("sizeC", sizeC);
  console.log("axesNames", axesNames);

  let dims = getDefaultSlice(axesNames, shape);
  console.log("channelDim", channelDim);
  console.log("dims", dims);

  let slices = range(sizeC).map((c) => {
    let sl = [...dims];
    sl[channelDim] = c;
    return sl;
  });
  console.log("slices", slices);

  let channelRanges = [];
  let channelColors = [];
  if (omeroChannels) {
    channelRanges = omeroChannels.map((channel) => {
      return [channel.window.start, channel.window.end];
    });
    channelColors = omeroChannels.map((channel) => {
      return hexToRgb(channel.color);
    });
  }

  // load all channels...
  const planes = await Promise.all(slices.map((s) => loadRegion(path, s)));
  console.log("planes", planes);
  const data = planes[0].data;
  const height = planes[0].shape[0];
  const width = planes[0].shape[1];

  console.log("data.length", data.length, data.length * 4);
  console.log("channelColors", channelColors);
  console.log("channelRanges", channelRanges);

  const rgba = renderTo8bitArray(planes, channelColors, channelRanges);
  console.log("rgba", rgba);
  logCanvas(rgba, width, height);
}

function logCanvas(rgba, width, height) {
  // Create image and draw to canvas
  const img = new ImageData(rgba, width, height);
  // add canvas...
  let canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  document.getElementById("app").appendChild(canvas);
  //   var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext("2d");
  ctx.putImageData(img, 0, 0);
}

function getDefaultSlice(axesNames, shape) {
  return axesNames.map((axis, index) => {
    if (axis === "z") {
      // Mid-point in Z-stack
      let sizeZ = shape[index];
      return parseInt(sizeZ / 2);
    }
    if (axis === "x" || axis === "y") {
      return null;
    }
    // t and c
    return 0;
  });
}
