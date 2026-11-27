<script>
  import Nav from "./Nav.svelte";
  import Bioformats2rawLayout from "./Bioformats2rawLayout/index.svelte";
  import JsonValidator from "./JsonValidator/index.svelte";
  import Title from "./Title.svelte"
  import SplashScreen from "./SplashScreen.svelte";

  import { getZarrGroupAttrs } from "./utils";
  import { setCredentialOrigin, credStatus, forgetCredentials } from "./signedFetch.js";
  import Modal, { bind } from "svelte-simple-modal";
  import { writable } from "svelte/store";
  import CredentialsDialog from "./Dialogs/CredentialsDialog.svelte";
  import KeysDialog from "./Dialogs/KeysDialog.svelte";
  import CheckMark from "./CheckMark.svelte";

  const searchParams = new URLSearchParams(window.location.search);
  let source;
  let redirected = false;
  let promise;

  function validate(nextSource) {
    source = nextSource;
    redirected = false;
    if (source.endsWith("/")) {
      source = source.slice(0, -1);
    }
    if (source.endsWith("/.zattrs") || source.endsWith("/zarr.json")) {
      source = source.replace(/\/(\.zattrs|zarr\.json)$/, "");
      redirected = true;
    }
    setCredentialOrigin(new URL(source).origin);
    window.history.replaceState(null, "", `?source=${encodeURIComponent(source)}`);
    promise = getZarrGroupAttrs(source);
  }

  if (searchParams.has("source")) validate(searchParams.get("source"));

  function isBioFormats2Raw(data) {
    let omeAttrs = data?.attributes?.ome || data;
    return omeAttrs["bioformats2raw.layout"] === 3 && !omeAttrs.plate;
  }

  const modal = writable(null);
  const openCredentials = (origin) =>
    modal.set(bind(CredentialsDialog, {
      origin,
      onSigned: () => {
        if (source) promise = getZarrGroupAttrs(source);
      },
    }));
  const useCredentials = () => openCredentials(new URL(source).origin);
</script>

<Modal show={$modal}>
  <main>
    <nav>
      <Nav />
    </nav>
    <section>
      {#if $credStatus}
        <div class="private">
          <span class="chip">
            <button on:click={() => modal.set(bind(KeysDialog))}>
              🔑 Keys saved ({$credStatus.remembered ? "this tab" : "until refresh"}) ⓘ
            </button>
            <button
              class="x"
              title="Forget keys"
              aria-label="Forget keys"
              on:click={() => { forgetCredentials(); location.reload(); }}
            >✕</button>
          </span>
        </div>
      {/if}
      {#if source}
        {#await promise}
          <div>loading...</div>
        {:then data}
          <Title {source} zattrs={data} />

          {#if redirected}
            <p class="note">Redirected to base path from appended .zattrs or zarr.json</p>
          {/if}

          <div>
            {#if isBioFormats2Raw(data)}
              <Bioformats2rawLayout rootAttrs={data} {source} />
            {:else}
              <JsonValidator rootAttrs={data} {source} />
            {/if}
          </div>
        {:catch error}
          <CheckMark valid={false}/>
          <p class="error">{error.message}</p>
          <p class="creds">Private store? <button on:click={useCredentials}>Use credentials</button></p>
        {/await}
      {:else}
        <SplashScreen {openCredentials} onValidate={validate} />
      {/if}
    </section>
  </main>
</Modal>

<style>
  main {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  nav {
    display: block;
    margin: 0;
    padding: 0;
    flex: 0 0 48px;
    background-color: #343a40;
  }

  section {
    overflow: auto;
    width: 100%;
    flex: 1;
    padding: 15px 0;
    background: white;
  }

  section > div {
    margin: auto;
    width: clamp(300px, 95%, 1200px);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 20px;
  }

  @media (min-width: 1000px) {
    section > div {
      flex-direction: row;
    }
  }

  .error {
    color: red;
    margin: 20px 0;
    text-align: center;
    background: white;
    padding: 10px;
  }

  .creds {
    text-align: center;
    color: #8a8a8a;
  }

  .creds button {
    padding: 0;
    border: none;
    background: none;
    font: inherit;
    color: var(--omeLinkBlue);
    cursor: pointer;
  }

  .creds button:hover {
    text-decoration: underline;
  }

  .private {
    width: clamp(300px, 95%, 1200px);
    margin: 0 auto 10px;
    text-align: left;
  }

  .chip {
    display: inline-flex;
    border: 1px solid #f0c36d;
    border-radius: 3px;
    background: #fff8e1;
  }

  .chip:hover {
    border-color: #d9a23a;
  }

  .chip button {
    padding: 4px 10px;
    border: none;
    background: none;
    font-size: 14px;
    font-weight: 500;
    color: #7a5a00;
    cursor: pointer;
  }

  .chip button:hover {
    background: #ffefc2;
  }

  .chip .x {
    border-left: 1px solid #f0c36d;
  }

  .note {
    color: #8a8a8a;
    padding: 8px 12px;
    margin: 10px auto;
    text-align: center;
    max-width: 600px;
  }
</style>
