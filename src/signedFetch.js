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
// Never prompts: the UI offers a "Use credentials" button (CredentialsDialog) instead.
export async function signedFetch(input, init) {
  const request = new Request(input, init);
  const res = await fetch(request.clone());
  if (!creds || (res.status !== 401 && res.status !== 403)) return res;
  if (new URL(request.url).origin !== creds.origin) return res;
  return creds.aws.fetch(request);
}

export function setCredentials(c, remember) {
  creds = { aws: new AwsClient(c), origin: c.origin };
  try {
    if (remember) sessionStorage.setItem(KEY, JSON.stringify(c));
    else sessionStorage.removeItem(KEY);
  } catch {}
}
