import { AwsClient } from "aws4fetch";

// Opt-in persistence: sessionStorage is per-tab, but readable by any script on the page.
const KEY = "ngff-validator-s3-creds";

/** @type {{ aws: AwsClient, origin: string } | null} */
let creds = null;
try {
  const saved = JSON.parse(sessionStorage.getItem(KEY));
  if (saved) creds = { aws: new AwsClient(saved), origin: saved.origin };
} catch {}

export const hasCredentials = () => creds !== null;

// Plain fetch; a 401/403 from the origin the user entered keys for is retried with SigV4.
// Never prompts: the UI offers a "Use credentials" button instead.
export async function signedFetch(input, init) {
  const request = new Request(input, init);
  const res = await fetch(request.clone());
  if (!creds || (res.status !== 401 && res.status !== 403)) return res;
  if (new URL(request.url).origin !== creds.origin) return res;
  return creds.aws.fetch(request);
}

/** Resolves true if credentials were entered for `origin`, false if cancelled. */
export function promptForCredentials(origin) {
  return new Promise((resolve) => {
    const dlg = document.createElement("dialog");
    dlg.innerHTML = `
      <form method="dialog">
        <p>S3 credentials for <code></code></p>
        <p><label>Access key <input name="key" autocomplete="off" required></label></p>
        <p><label>Secret key <input name="secret" type="password" autocomplete="off" required></label></p>
        <p><label>Region <input name="region" value="us-east-1"></label></p>
        <p><label><input name="remember" type="checkbox"> Remember for this tab</label></p>
        <button value="ok">Sign requests</button>
        <button value="cancel" formnovalidate>Cancel</button>
      </form>`;
    dlg.querySelector("code").textContent = origin;
    dlg.addEventListener("close", () => {
      const f = dlg.querySelector("form").elements;
      if (dlg.returnValue === "ok") {
        const c = {
          accessKeyId: f.key.value.trim(),
          secretAccessKey: f.secret.value.trim(),
          region: f.region.value.trim() || "us-east-1",
          service: "s3",
          origin,
        };
        creds = { aws: new AwsClient(c), origin };
        try {
          if (f.remember.checked) sessionStorage.setItem(KEY, JSON.stringify(c));
          else sessionStorage.removeItem(KEY);
        } catch {}
      }
      resolve(dlg.returnValue === "ok");
      dlg.remove();
    });
    document.body.appendChild(dlg);
    dlg.showModal();
  });
}
