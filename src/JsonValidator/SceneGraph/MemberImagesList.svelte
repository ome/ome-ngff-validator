<script>
  import { getJson, getZarrGroupAttrs, validate } from "../../utils";
  import Icon from "svelte-icons-pack/Icon.svelte";
  import BsCheckCircleFill from "svelte-icons-pack/bs/BsCheckCircleFill";

  export let source;
  export let sceneAttrs;

  const url = window.location.origin + window.location.pathname;

  // Extract member images from scene coordinateTransformations
  function getMemberImages() {
    const members = new Map();
    
    for (const ct of sceneAttrs?.coordinateTransformations || []) {
      // Check input path (image reference)
      if (ct.input?.path) {
        const path = ct.input.path;
        if (!members.has(path)) {
          members.set(path, {
            path,
            name: ct.input.name || path,
            coordinateSystem: ct.input.name || "—",
            targetSystem: ct.output?.name || ct.output || "—"
          });
        }
      }
      
      // Check output path (image reference)
      if (ct.output?.path) {
        const path = ct.output.path;
        if (!members.has(path)) {
          members.set(path, {
            path,
            name: ct.output.name || path,
            coordinateSystem: ct.output.name || "—",
            targetSystem: ct.input?.name || ct.input || "—"
          });
        }
      }
    }
    
    return Array.from(members.values());
  }

  const memberImages = getMemberImages();

  // Build URL for validating a member image
  function getValidatorUrl(imagePath) {
    return `${url}?source=${encodeURIComponent(source + "/" + imagePath)}`;
  }

  // Check validation status for a member image
  async function checkValidation(imagePath) {
    try {
      const attrs = await getZarrGroupAttrs(`${source}/${imagePath}`);
      const errors = await validate(attrs);
      return errors.length === 0;
    } catch (e) {
      return false;
    }
  }
</script>

<div class="member-list">
  <h4>Member Images</h4>
  
  {#if memberImages.length === 0}
    <p class="no-images">No member images found in scene metadata.</p>
  {:else}
    <table>
      <thead>
        <tr>
          <th>Path</th>
          <th>Coordinate System</th>
          <th>Target</th>
          <th>Validate</th>
        </tr>
      </thead>
      <tbody>
        {#each memberImages as image}
          {@const validationPromise = checkValidation(image.path)}
          <tr>
            <td class="path-cell">
              <code>{image.path}</code>
            </td>
            <td class="cs-cell">
              {image.coordinateSystem}
            </td>
            <td class="target-cell">
              {image.targetSystem}
            </td>
            <td class="action-cell">
              {#await validationPromise}
                <span class="validate-icon checking">
                  <Icon src={BsCheckCircleFill} />
                </span>
              {:then isValid}
                <a 
                  href={getValidatorUrl(image.path)} 
                  class="validate-icon"
                  class:valid={isValid}
                  class:invalid={!isValid}
                  title="Validate {image.path}"
                >
                  <Icon src={BsCheckCircleFill} />
                </a>
              {:catch}
                <a 
                  href={getValidatorUrl(image.path)} 
                  class="validate-icon invalid"
                  title="Validate {image.path}"
                >
                  <Icon src={BsCheckCircleFill} />
                </a>
              {/await}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>

<style>
  .member-list {
    background: white;
    border: 1px solid #ddd;
    border-radius: 12px;
    padding: 15px;
    margin-top: 20px;
  }

  h4 {
    margin: 0 0 12px 0;
    color: #334155;
    font-weight: 600;
    font-size: 1rem;
  }

  .no-images {
    color: #666;
    font-style: italic;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }

  thead {
    background-color: #f1f5f9;
  }

  th {
    text-align: left;
    padding: 10px 12px;
    font-weight: 600;
    color: #334155;
    border-bottom: 2px solid #e2e8f0;
  }

  td {
    padding: 10px 12px;
    border-bottom: 1px solid #e2e8f0;
    vertical-align: middle;
  }

  tr:hover {
    background-color: #f8fafc;
  }

  .path-cell code {
    background: #e2e8f0;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 13px;
    color: #334155;
  }

  .cs-cell, .target-cell {
    color: #64748b;
  }

  .action-cell {
    text-align: center;
    width: 60px;
  }

  .validate-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border-radius: 50%;
    transition: transform 0.15s, background-color 0.15s, color 0.15s;
    color: #94a3b8;
  }

  .validate-icon.checking {
    color: #94a3b8;
    animation: pulse 1s infinite;
  }

  .validate-icon.valid {
    color: #22c55e;
  }

  .validate-icon.invalid {
    color: #ef4444;
  }

  .validate-icon :global(svg) {
    width: 20px;
    height: 20px;
  }

  .validate-icon:hover {
    transform: scale(1.15);
    background-color: #f1f5f9;
  }

  .validate-icon.valid:hover {
    background-color: #dcfce7;
  }

  .validate-icon.invalid:hover {
    background-color: #fee2e2;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
</style>
