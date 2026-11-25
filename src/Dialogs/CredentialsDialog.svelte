<script>
  import { getContext } from "svelte";
  import { setCredentials } from "../signedFetch.js";

  export let origin;
  export let onSigned = () => {};

  const { close } = getContext("simple-modal");

  let accessKeyId = "";
  let secretAccessKey = "";
  let region = "us-east-1";
  let remember = false;

  function submit() {
    setCredentials(
      {
        accessKeyId: accessKeyId.trim(),
        secretAccessKey: secretAccessKey.trim(),
        region: region.trim() || "us-east-1",
        service: "s3",
        origin,
      },
      remember
    );
    close();
    onSigned();
  }
</script>

<h1>S3 credentials</h1>
<p class="origin">Requests to <code>{origin}</code> will be signed.</p>

<form on:submit|preventDefault={submit}>
  <label>Access key <input bind:value={accessKeyId} autocomplete="off" required /></label>
  <label>Secret key <input bind:value={secretAccessKey} type="password" autocomplete="off" required /></label>
  <label>Region <input bind:value={region} /></label>
  <label class="check"><input type="checkbox" bind:checked={remember} /> Remember for this tab</label>
  <div class="actions">
    <button type="button" on:click={close}>Cancel</button>
    <button type="submit" class="primary">Sign requests</button>
  </div>
</form>

<style>
  h1 {
    font-weight: 300;
  }
  .origin {
    color: #8a8a8a;
    margin: 10px 0 20px;
  }
  form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  label {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 14px;
  }
  label.check {
    flex-direction: row;
    align-items: center;
    gap: 6px;
  }
  input:not([type="checkbox"]) {
    padding: 6px 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
  }
  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 8px;
  }
  button {
    padding: 6px 14px;
    border: 1px solid #343a40;
    border-radius: 4px;
    background: white;
    cursor: pointer;
  }
  .primary {
    background: #343a40;
    color: white;
  }
</style>
