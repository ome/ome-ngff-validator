<script>
  import { image, json } from "d3";
  import { getJson } from "../../utils.js";

  import getTree from "./tree.js";

  export let omeAttrs;
  export let source;

  import { onMount } from "svelte";

  let el;

  function getImageNodes(omeAttrs, path) {
    console.log("getImageNodes", omeAttrs, path);
    let multiscales = omeAttrs.multiscales[0];
    // FIRST coordinateSystem is the parent - WARN if not!
    const nodes = [];
    const transforms = multiscales.coordinateTransformations || [];
    const systemNames = multiscales.coordinateSystems.map((cs) => cs.name);

    console.log("systemNames", systemNames, path);
    let parent = systemNames[0];
    while (parent) {
      // nodes.push({ name: parent, parent: "" });
      let found = false;
      for (let ct of transforms) {
        if (ct.output === parent) {
          nodes.push({
            name: `${path}/${ct.input}`,
            parent: `${path}/${ct.output}`,
          });
          parent = ct.input;
          found = true;
          break;
        }
      }
      if (!found) {
        parent = null;
      }
    }
    if (nodes.length < transforms.length) {
      alert("Warning: Some coordinate systems are not connected for image");
    }
    console.log("getImageNodes", nodes);

    return nodes;
  }

  onMount(() => {
    console.log("ON MOUNT CoordinateSystemsGraph", el);

    // Here we dynamically import d3 to avoid loading it unless this component is used
    import("d3").then(async (module) => {
      const d3 = module;

      let Tree = getTree(d3);

      // const table = [
      //   { name: "Eve", parent: "" },
      //   { name: "Cain", parent: "Eve" },
      //   { name: "Seth", parent: "Eve" },
      //   { name: "Enos", parent: "Seth" },
      // ];

      console.log("CoordinateSystemsGraph: omeAttrs", omeAttrs);
      let transforms = omeAttrs.coordinateTransformations;

      let systemNames = omeAttrs.coordinateSystems?.map((cs) => cs.name) || [];
      let outputs = transforms.map((d) => d.output);
      let inputs = transforms.map((d) => d.input);
      let allSystems = outputs.concat(inputs);
      console.log("allSystems", allSystems);
      // Find any names that are not in coordinateSystems
      let imagesToLoad = allSystems.filter(
        (name) => !systemNames.includes(name)
      );
      console.log("imagesToLoad", imagesToLoad);

      const promises = imagesToLoad.map((name) => {
        return getJson(`${source}/${name}/zarr.json`)
          .then((json) => [name, json])
          .catch((error) => [name, null]);
      });
      let results = await Promise.all(promises);

      const imagesByPath = {};

      console.log("loaded coordinate system image zarr.json results", results);
      results.forEach(([name, attrs]) => {
        if (attrs?.attributes?.ome) {
          imagesByPath[name] = getImageNodes(attrs.attributes.ome, name);
        } else {
          console.warn(
            `Coordinate system image ${name} is missing 'ome' attributes.`
          );
        }
      });

      // Go through parent transforms to build table (graph edges)
      const outputNames = new Set(outputs);
      const inputNames = new Set(inputs);
      inputNames.forEach((inputName) => {
        outputNames.delete(inputName);
      });
      // TODO: Handle multiple root coordinate systems better
      if (outputNames.size > 1) {
        alert(
          `Warning: Multiple root coordinate systems found: ${Array.from(
            outputNames
          ).join(", ")}`
        );
      }
      const table = transforms.flatMap((ct) => {
        // If coordinateSystem is an Image with it's own transforms, parent is the top of that tree
        if (imagesByPath[ct.input] && imagesByPath[ct.input].length > 0) {
          let imgNode = {
            parent: ct.output,
            name: imagesByPath[ct.input][0].parent,
          };
          return [imgNode, ...imagesByPath[ct.input]];
        }
        return [
          // This could be an image without transforms or a coordinate system
          {
            name: ct.input,
            parent: ct.output,
          },
        ];
      });
      // Find any coordinate systems that are not listed as input in any transformation
      outputNames.forEach((csName) => {
        table.push({
          name: csName,
          parent: "",
        });
      });
      console.log("table", table);

      try {
        const tableRoot = d3
          .stratify()
          .id((d) => d.name)
          .parentId((d) => d.parent)(table);
        console.log("tableRoot", tableRoot);

        const treeSvg = Tree(tableRoot, {
          label: (d) =>
            d.data.name.slice(
              Math.max(0, d.data.name.length - 15),
              d.data.name.length
            ),
          width: 500,
          height: 400,
          w: 120,
          h: 35,
          fill: "lightsteelblue",
          title: (d, n) => d.data.name,
          dyNode: 150, // height of node
          haloWidth: 0,
          dx: 45, // vertical spacing between nodes?!
          fontSize: 14,
        });

        console.log("treeSvg", treeSvg);
        el.appendChild(treeSvg);
      } catch (error) {
        console.error("Error creating tableRoot:", error);
        alert(error);
      }
    });
  });
</script>

<div bind:this={el} class="chart"></div>

<style>
</style>
