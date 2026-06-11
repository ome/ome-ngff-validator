<script>
  import { getZarrGroupAttrs, validate } from "../../utils";
  import Icon from "svelte-icons-pack/Icon.svelte";
  import BsCheckCircleFill from "svelte-icons-pack/bs/BsCheckCircleFill";

  export let source;
  export let sceneAttrs;

  const url = window.location.origin + window.location.pathname;

  // Extract member image paths from scene coordinateTransformations
  function getMemberImages() {
    const paths = new Set();
    
    for (const ct of sceneAttrs?.coordinateTransformations || []) {
      if (ct.input?.path) {
        paths.add(ct.input.path);
      }
      if (ct.output?.path) {
        paths.add(ct.output.path);
      }
    }
    
    return Array.from(paths).sort();
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
  <div class="list-container">
    <div class="list-header">
      <div class="list-col col-path">Path</div>
      <div class="list-col col-validate">Valid</div>
    </div>
    {#each memberImages as path}
      {@const validationPromise = checkValidation(path)}
      <a href={getValidatorUrl(path)} class="member-row">
        <div class="list-col col-path">
          <code>{path}</code>
        </div>
        <div class="list-col col-validate">
          {#await validationPromise}
            <span class="validate-icon checking">
              <Icon src={BsCheckCircleFill} />
            </span>
          {:then isValid}
            <span 
              class="validate-icon"
              class:valid={isValid}
              class:invalid={!isValid}
              title="Validate {path}"
            >
              <Icon src={BsCheckCircleFill} />
            </span>
          {:catch}
            <span 
              class="validate-icon invalid"
              title="Validate {path}"
            >
              <Icon src={BsCheckCircleFill} />
            </span>
          {/await}
        </div>
      </a>
    {/each}
  </div>
  {/if}
</div>

<style>
  .member-list {
    background: white;
    border: 1px solid #ddd;
    border-radius: 12px;
    padding: 15px;
    margin-bottom: 20px;
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

  .list-container {
    display: flex;
    flex-direction: column;
    font-size: 14px;
  }

  .list-header {
    display: grid;
    grid-template-columns: 1fr 80px;
    gap: 12px;
    background-color: #f1f5f9;
    padding: 10px 12px;
    border-radius: 6px 6px 0 0;
    font-weight: 600;
    color: #334155;
    border-bottom: 2px solid #e2e8f0;
  }

  .member-row {
    display: grid;
    grid-template-columns: 1fr 80px;
    gap: 12px;
    padding: 10px 12px;
    border-bottom: 1px solid #e2e8f0;
    align-items: center;
    text-decoration: none;
    color: inherit;
    transition: background-color 0.15s;
  }

  .member-row:hover {
    background-color: #f8fafc;
  }

  .list-col {
    display: flex;
    align-items: center;
  }

  .col-path code {
    background: #e2e8f0;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 13px;
    color: #334155;
  }

  .col-validate {
    justify-content: center;
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
    color: rgb(0, 128, 0);
  }

  .validate-icon.invalid {
    color: rgb(255, 0, 0);
  }

  .validate-icon :global(svg) {
    width: 20px;
    height: 20px;
    fill: currentColor;
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
