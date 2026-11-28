import { AwsClient } from "aws4fetch";
import { writable } from "svelte/store";

// Opt-in persistence: sessionStorage is per-tab, but readable by any script on the page.
const KEY = "ngff-validator-s3-creds";

/** @type {{ aws: AwsClient, origin: string } | null} */
let creds = null;
try {
  const saved = JSON.parse(sessionStorage.getItem(KEY));
// This avoids multiple retries, which caused 500 errors in the HF samples
// It may be too strict. 
  if (saved) creds = { aws: new AwsClient({ ...saved, retries: 0 }), origin: saved.origin };
} catch {}

export const hasCredentials = () => creds !== null;

/** What the UI shows: null, or { origin, remembered }. */
export const credStatus = writable(
  creds && { origin: creds.origin, remembered: true }
);

/** Saved keys were tried and still didn't open the URL. */
export class KeysError extends Error {}

// Plain fetch; a 401/403 from the origin the user entered keys for is retried with SigV4.
// Never prompts: the UI offers a "Use credentials" button (CredentialsDialog) instead.
export async function signedFetch(input, init) {
  const request = new Request(input, init);
  const res = await fetch(request.clone());
  if (!creds?.origin || (res.status !== 401 && res.status !== 403)) return res;
  if (new URL(request.url).origin !== creds.origin) return res;
  // Never cache signed responses: otherwise private content outlives the keys.
  let signed;
  try {
    signed = await creds.aws.fetch(request, { cache: "no-store" });
  } catch {
    throw new KeysError(
      `Your saved keys for ${creds.origin} were rejected, or the store doesn't allow signed requests (CORS).`
    );
  }
  // zarrita still needs plain 404s for missing chunks.
  signed.signedBy = creds.origin;
  return signed;
}

export function setCredentials(c, remember) {
  creds = { aws: new AwsClient({ ...c, retries: 0 }), origin: c.origin ?? null };
  try {
    if (remember) sessionStorage.setItem(KEY, JSON.stringify(c));
    else sessionStorage.removeItem(KEY);
  } catch {}
  credStatus.set({ origin: creds.origin, remembered: remember });
}

export function forgetCredentials() {
  creds = null;
  try {
    sessionStorage.removeItem(KEY);
  } catch {}
  credStatus.set(null);
}

export function setCredentialOrigin(origin) {
  // If credentials were passed before a URL was known,
  // set the origin now.
  if (!creds || creds.origin) return;
  creds.origin = origin;
  credStatus.update((s) => s && { ...s, origin });
  try {
    const saved = sessionStorage.getItem(KEY);
    if (saved) sessionStorage.setItem(KEY, JSON.stringify({ ...JSON.parse(saved), origin }));
  } catch {}
}
