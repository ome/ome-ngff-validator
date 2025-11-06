<script>
  import { image, json } from "d3";
  import { getJson } from "../../utils.js";

  import getTree from "./tree.js";

  export let omeAttrs;
  export let source;

  import { onMount } from "svelte";

  let el;

  function getImageNodes(omeAttrs, path, inputOnly = true) {
    console.log("getImageNodes", omeAttrs, path);
    let multiscales = omeAttrs.multiscales[0];
    // FIRST coordinateSystem is the parent - WARN if not!
    const nodes = [];
    const transforms = multiscales.coordinateTransformations || [];
    const systemNames = multiscales.coordinateSystems.map((cs) => cs.name);

    console.log("systemNames", systemNames, path);

    // The "authoritative" coordinate system is the FIRST one listed
    // so we start our traversal from there
    let previous = systemNames[0];
    while (previous) {
      let found = false;
      // IF the image is an input to parent-group, we want to look for transforms where,
      // the output is the parent
      for (let ct of transforms) {
        if (ct.output === previous) {
          nodes.push({
            name: `${path}/${ct.input}`,
            parent: `${path}/${ct.output}`,
          });
          previous = ct.input;
          found = true;
          break;
        }
      }
      if (!found) {
        previous = null;
      }
    }
    
    // Check for any transforms NOT included in the chain above
    if (nodes.length < transforms.length) {
      let nodeNames = nodes.map((n) => n.name.split("/").pop());
      let missing = transforms.filter((ct) => !nodeNames.includes(ct.output));
      if (inputOnly) {
        let missingNames = missing.map((m) => m.output).join(", ");
        alert(`Warning: Some coordinate systems are not connected for image ${path}: ${missingNames}`);
      } else {
        missing.forEach((ct) => {
          nodes.push({
            name: `${path}/${ct.input}`,
            parent: `${path}/${ct.output}`,
          });
        });
      }
    }
    console.log("getImageNodes", nodes);

    return nodes;
  }

  onMount(() => {
    // Here we dynamically import d3 to avoid loading it unless this component is used
    import("d3").then(async (d3) => {
      // const d3 = module;


      // const table = [
      //   { name: "Eve", parent: "" },
      //   { name: "Cain", parent: "Eve" },
      //   { name: "Seth", parent: "Eve" },
      //   { name: "Enos", parent: "Seth" },
      // ];

      let transforms = omeAttrs.coordinateTransformations;
      let systemNames = omeAttrs.coordinateSystems?.map((cs) => cs.name) || [];
      // Find any inputs/outputs that are not in coordinateSystems
      let outputs = transforms.map((d) => d.output).filter(name => !systemNames.includes(name));
      let inputs = transforms.map((d) => d.input).filter(name => !systemNames.includes(name));
      let imagesToLoad = Array.from(new Set(outputs.concat(inputs)));

      // LOAD all images that are inputs/outputs
      const promises = imagesToLoad.map((name) => {
        return getJson(`${source}/${name}/zarr.json`)
          .then((json) => [name, json])
          .catch((error) => [name, null]);
      });
      let results = await Promise.all(promises);
      const imagesByPath = {};
      results.forEach(([name, attrs]) => {
        if (attrs?.attributes?.ome) {
          imagesByPath[name] = attrs.attributes.ome;
        } else {
          console.warn(`Coordinate system image ${name} is missing 'ome' attributes.`);
        }
      });

      // BUILD TABLE of all edges
      let visited = new Set();
      const table = transforms.flatMap((ct) => {
        // If coordinateSystem is an Image with it's own transforms, parent is the top of that tree
        let nodesToAdd = [];
        let parentName = ct.output;
        let nodeName = ct.input;
        // If the input is an image...
        if (imagesByPath[ct.input]) {
          let imgNodes = getImageNodes(imagesByPath[ct.input], ct.input, true);
          if (imgNodes.length > 0) {
            nodeName = imgNodes[0].parent;
            nodesToAdd = nodesToAdd.concat(imgNodes);
          }
        }
        // If the output is an image...
        if (imagesByPath[ct.output]) {
          let imgNodes = getImageNodes(imagesByPath[ct.output], ct.output, false);
          if (imgNodes.length > 0) {
            parentName = imgNodes[0].name;
            // only add parent nodes ONCE
            if (!visited.has(parentName)) {
              nodesToAdd = nodesToAdd.concat(imgNodes);
              visited.add(parentName);
            }
          }
        }
        
        return [
          {
            name: nodeName,
            parent: parentName,
          }, ...nodesToAdd
        ];
      });
      // Find any "orphan" parents that are not nodes yet
      let parents = new Set(table.map((d) => d.parent));
      let children = new Set(table.map((d) => d.name));
      let orphans = Array.from(parents).filter((p) => !children.has(p));
      orphans.forEach((orphan) => {
        table.push({
          name: orphan,
          parent: "",
        });
      });
      // console.log("table", table);

      try {
        const tableRoot = d3
          .stratify()
          .id((d) => d.name)
          .parentId((d) => d.parent)(table);

        let Tree = getTree(d3);
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
