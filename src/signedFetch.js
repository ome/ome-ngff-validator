import { AwsClient } from "aws4fetch";

// Credentials survive refresh via sessionStorage (per-tab, cleared when the tab closes).
const KEY = "ngff-validator-s3-creds";
const saved = sessionStorage.getItem(KEY);
// Pending/settled credentials prompt, shared so parallel requests ask once.
// Resolves to an AwsClient, or null if the user cancelled.
let clientPromise = saved ? Promise.resolve(new AwsClient(JSON.parse(saved))) : undefined;
// Only sign requests to the origin that denied us; never leak the key id elsewhere.
/** @type {string | undefined} */
let deniedOrigin;

function promptForCredentials() {
  return new Promise((resolve) => {
    const dlg = document.createElement("dialog");
    dlg.innerHTML = `
      <form method="dialog">
        <p>Access denied. Enter S3 credentials to retry (kept for this browser tab only).</p>
        <p><label>Access key <input name="key" autocomplete="off" required></label></p>
        <p><label>Secret key <input name="secret" type="password" autocomplete="off" required></label></p>
        <p><label>Region <input name="region" value="us-east-1" required></label></p>
        <button value="ok">Sign requests</button>
        <button value="cancel" formnovalidate>Cancel</button>
      </form>`;
    dlg.addEventListener("close", () => {
      const f = dlg.querySelector("form").elements;
      if (dlg.returnValue === "ok") {
        const creds = {
          accessKeyId: f.key.value.trim(),
          secretAccessKey: f.secret.value.trim(),
          region: f.region.value.trim(),
          service: "s3",
        };
        sessionStorage.setItem(KEY, JSON.stringify(creds));
        resolve(new AwsClient(creds));
      } else {
        resolve(null);
      }
      dlg.remove();
    });
    document.body.appendChild(dlg);
    dlg.showModal();
  });
}

const baseFetch = window.fetch.bind(window);

// Replaces window.fetch: retries 401/403 responses with SigV4 signing.
window.fetch = async (input, init) => {
  const request = new Request(input, init);
  const res = await baseFetch(request.clone());
  const origin = new URL(request.url).origin;
  if ((res.status !== 401 && res.status !== 403) || (deniedOrigin && deniedOrigin !== origin)) {
    return res;
  }
  deniedOrigin = origin;
  clientPromise ??= promptForCredentials();
  const aws = await clientPromise;
  return aws ? aws.fetch(request) : res;
};
