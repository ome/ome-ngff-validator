<script>
  import { onMount } from "svelte";

  export let graphData;

  let el;
  let popoverEl;

  function coordinateTransformToHtml(transform) {
    let html = "";
    // Show known fields first in a consistent order, then show any additional fields
    for (const key of ["type", "name", "input", "output"]) {
      if (transform[key]) {
        html += `<div><strong>${key}:</strong> ${JSON.stringify(transform[key])}</div>`;
      }
    }
    for (const key of Object.keys(transform)) {
      if (!["type", "name", "input", "output", "transformations"].includes(key)) {
        html += `<div><strong>${key}:</strong> ${JSON.stringify(transform[key])}</div>`;
      }
    }
    if (transform.transformations) {
      html += `<div><strong>transformations:</strong></div>`;
      transform.transformations.forEach((t) => {
        html += `<div style="border: 1px solid #ccc; margin-top: 5px; padding: 5px;">
          <div><strong>type:</strong> ${t.type}</div>`;
        if (t.name) {
          html += `<div><strong>name:</strong> ${t.name}</div>`;
        }
        for (const key of Object.keys(t)) {
          if (!["type", "transformations", "name"].includes(key)) {
            html += `<div><strong>${key}:</strong> ${JSON.stringify(t[key])}</div>`;
          }
        }
        html += `</div>`;
      });
    }
    return html;
  }

  function getNodeLeft(nodeElement, bounds) {
    const rect = nodeElement.getBoundingClientRect();
    return {
      x: rect.left - bounds.left,
      y: rect.top - bounds.top + rect.height / 2,
    };
  }

  function getNodeRight(nodeElement, bounds) {
    const rect = nodeElement.getBoundingClientRect();
    return {
      x: rect.left - bounds.left + rect.width,
      y: rect.top - bounds.top + rect.height / 2,
    };
  }

  function pathForLink(sourcePt, targetPt, sameBox) {
    if (sameBox) {
      const dy = Math.abs(targetPt.y - sourcePt.y);
      const dx = 3 * dy;
      return `M ${sourcePt.x} ${sourcePt.y} C ${sourcePt.x + dx} ${sourcePt.y}, ${targetPt.x + dx} ${targetPt.y}, ${targetPt.x} ${targetPt.y}`;
    }

    const horizontal = Math.abs(targetPt.x - sourcePt.x);
    const span = Math.max(40, horizontal * 0.4);
    return `M ${sourcePt.x} ${sourcePt.y} C ${(sourcePt.x + targetPt.x) / 2} ${sourcePt.y}, ${(sourcePt.x + targetPt.x) / 2} ${targetPt.y}, ${targetPt.x} ${targetPt.y}`;
  }

  function makeBG(elem) {
        
    var svgns = "http://www.w3.org/2000/svg"
    var bounds = elem.getBBox()
    var bg = document.createElementNS(svgns, "rect")
    var style = getComputedStyle(elem)
    var padding_top = parseInt(style["padding-top"])
    var padding_left = parseInt(style["padding-left"])
    var padding_right = parseInt(style["padding-right"])
    var padding_bottom = parseInt(style["padding-bottom"])
    bg.setAttribute("x", parseInt(bounds.x) - padding_left)
    bg.setAttribute("y", bounds.y - padding_top)
    bg.setAttribute("width", bounds.width + padding_left + padding_right)
    bg.setAttribute("height", bounds.height + padding_top + padding_bottom)
    bg.setAttribute("fill", "white")
    bg.setAttribute("rx", "5")
    bg.setAttribute("stroke-width", "1")
    bg.setAttribute("stroke", "#bbd")
    if (elem.hasAttribute("transform")) {
      bg.setAttribute("transform", elem.getAttribute("transform"))
    }
    elem.parentNode.insertBefore(bg, elem);
  }

  onMount(() => {
    console.log("svg mounted");

    const diagram = document.getElementById("diagram");
    // const svgLinks = document.querySelector("svg");
    const bounds = diagram.getBoundingClientRect();
    console.log("bounds", bounds);
    el.setAttribute("width", String(bounds.width));
    el.setAttribute("height", String(bounds.height));
    el.setAttribute("viewBox", `0 0 ${bounds.width} ${bounds.height}`);

    for (const link of graphData.links) {
      const sourceEl = document.getElementById(link.source);
      const targetEl = document.getElementById(link.target);
      if (!sourceEl || !targetEl) {
        // TODO: show warning in the UI about missing elements for this link
        console.warn(
          `Could not find elements for link ${link.source} -> ${link.target}`,
        );
        continue;
      }

      const linkSceneToImage =
        link.source.includes("/") !== link.target.includes("/");
      console.log(
        `Link ${link.source} -> ${link.target} is ${
          linkSceneToImage
        }`,
      );
      let sourcePt = getNodeRight(sourceEl, bounds);
      let targetPt = getNodeRight(targetEl, bounds);
      if (linkSceneToImage) {
        sourcePt = link.source.includes("/")
          ? getNodeLeft(sourceEl, bounds)
          : getNodeRight(sourceEl, bounds);
        targetPt = link.target.includes("/")
          ? getNodeLeft(targetEl, bounds)
          : getNodeRight(targetEl, bounds);
      }
      const d = pathForLink(
        sourcePt,
        targetPt,
        !linkSceneToImage,
      );

      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      // path.setAttribute("id", link.id);
      path.setAttribute("class", "arrow-path");
      path.setAttribute("d", d);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", "blue");
      path.setAttribute("stroke-width", "1.8");
      path.setAttribute("marker-end", "url(#arrowhead)");
      el.appendChild(path);

      // link is coordinateTransformation 
      const text = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text",
      );
      text.setAttribute("class", "arrow-label");
      let label = link.transform.type;
      if (link.transform.type == "sequence") {
        label += ` (${link.transform.transformations.map(t => t.type).join(", ")})`;
      }
      text.textContent = label;
      const dy = Math.abs(targetPt.y - sourcePt.y);
      const dx = linkSceneToImage ? 0 : 2 * dy;
      text.setAttribute("x", ((sourcePt.x + targetPt.x) / 2) + dx);
      text.setAttribute("y", (sourcePt.y + targetPt.y) / 2);
      text.setAttribute("fill", "#666");
      el.appendChild(text);

      text.addEventListener("mouseover", () => {
        console.log("mouseover", link);
        // text.setAttribute("fill", "red");
        popoverEl.innerHTML = coordinateTransformToHtml(link.transform);
        popoverEl.showPopover();
        popoverEl.style.left = `${text.getBoundingClientRect().left - (popoverEl.offsetWidth / 2)}px`;
        let top = text.getBoundingClientRect().top - popoverEl.offsetHeight;
        if (top < 0) {
          top = text.getBoundingClientRect().bottom;
        }
        popoverEl.style.top = `${top}px`;
      });
      text.addEventListener("mouseout", () => {
        // text.setAttribute("text-", "#666");
        popoverEl.hidePopover();
      });

      makeBG(text);
    }
  });
</script>

<div class="popover" popover bind:this={popoverEl}>
  Coordinate Transform
</div>
<svg bind:this={el}>
  <!-- Arrowhead definition -->
  <defs
    ><marker
      id="arrowhead"
      markerWidth="8"
      markerHeight="8"
      refX="7"
      refY="4"
      orient="auto"
      markerUnits="strokeWidth"
      ><path d="M 0 0 L 8 4 L 0 8 z" fill="#2c5fd5"></path></marker
    ></defs
  >
</svg>

<style>
  svg {
    position: absolute;
    inset: 0;
    overflow: visible;
    z-index: 10;
    pointer-events: none;
  }
  :global(text) {
    font-size: 10px;
    color: black;
    background: white;
    border-radius: 5px;
    border: 1px solid rgb(204, 204, 247);
    padding: 7px;
    cursor: default;
    pointer-events: all;
  }
  .popover {
    border: solid 1px #ccc;
    padding: 10px;
    border-radius: 10px;
    box-shadow: 3px 3px 7px #c3c0c0;
    background: white;
    font-size: 14px;
    max-width: 300px;
    text-align: left;
  }
</style>
