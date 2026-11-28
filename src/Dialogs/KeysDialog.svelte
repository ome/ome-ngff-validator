<script>
  import { credStatus, forgetCredentials } from "../signedFetch.js";

  function forget() {
    forgetCredentials();
    location.reload();
  }
</script>

<h1>Saved keys</h1>
<p>
  Your S3 keys for <code>{$credStatus?.origin ?? "the next store you open"}</code>
  are kept in this tab {$credStatus?.remembered ? "for this tab's session" : "until refresh"}.
  They're only sent to that address. Private data is never cached by the browser.
</p>
<div class="actions">
  <button on:click={forget}>Forget my keys</button>
</div>

<style>
  h1 {
    font-weight: 300;
  }
  p {
    margin-top: 15px;
  }
  .actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }
  button {
    padding: 6px 14px;
    border: 1px solid #343a40;
    border-radius: 4px;
    background: white;
    cursor: pointer;
  }
</style>
