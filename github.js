// GitHub access for the phone app. The data lives in the private repo OWNER/REPO, one file per device
// (cihazlar/<device>.json); the phone reads all of them and writes only cihazlar/telefon.json.
// Access is a fine-grained token limited to that repo; the app also refuses tokens of any other account.
export const OWNER = 'kereemyildiz';
export const REPO = 'yds-defter-veri';
export const DEVICE = 'telefon';
const API = 'https://api.github.com';
const FILE = `cihazlar/${DEVICE}.json`;

export class AuthError extends Error {}

async function call(token, path, { method = 'GET', body, raw = false } = {}) {
  let res;
  try {
    res = await fetch(API + path, {
      method,
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: raw ? 'application/vnd.github.raw+json' : 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('İnternet bağlantısı yok.');
  }
  if (res.status === 401) throw new AuthError('Anahtar geçersiz ya da süresi dolmuş.');
  if (!res.ok) {
    const err = new Error(`GitHub yanıtı ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return raw ? res.text() : res.json();
}

// Checks that the token belongs to OWNER and can read the data repo.
export async function verify(token) {
  const user = await call(token, '/user');
  if (user.login?.toLowerCase() !== OWNER) throw new AuthError(`Bu uygulama yalnızca ${OWNER} hesabıyla kullanılabilir.`);
  try {
    await call(token, `/repos/${OWNER}/${REPO}`);
  } catch (err) {
    if (err instanceof AuthError) throw err;
    throw new AuthError(`Anahtar ${REPO} deposuna erişemiyor. Oluştururken bu depoyu seçtiğinden emin ol.`);
  }
  return user.login;
}

// Lists device files: [{ name, device, sha }].
export async function listDevices(token) {
  const items = await call(token, `/repos/${OWNER}/${REPO}/contents/cihazlar`);
  return items.filter((x) => x.type === 'file' && x.name.endsWith('.json'))
    .map((x) => ({ name: x.name, device: x.name.slice(0, -5), sha: x.sha }));
}

// A file by its blob sha (immutable, so unchanged files are never downloaded twice).
export async function readBlob(token, sha) {
  return JSON.parse(await call(token, `/repos/${OWNER}/${REPO}/git/blobs/${sha}`, { raw: true }));
}

function toBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

// Same layout as the computers' files: one item per line keeps diffs small.
export function deviceJson(data) {
  const lines = Object.keys(data).sort().map((k) => `  ${JSON.stringify(k)}: ${JSON.stringify(data[k])}`);
  return `{"device": ${JSON.stringify(DEVICE)}, "data": {\n${lines.join(',\n')}\n}}\n`;
}

// Writes the phone's file; `sha` is the current one (null for the first write). Returns the new sha.
export async function writePhone(token, data, sha) {
  const put = (s) => call(token, `/repos/${OWNER}/${REPO}/contents/${FILE}`, {
    method: 'PUT',
    body: { message: `${DEVICE}: veri güncellemesi`, content: toBase64(deviceJson(data)), ...(s ? { sha: s } : {}) },
  });
  try {
    return (await put(sha)).content.sha;
  } catch (err) {
    if (err.status !== 409 && err.status !== 422) throw err;
    // our idea of the file's sha is stale: look it up and try once more
    let current = null;
    try {
      current = (await call(token, `/repos/${OWNER}/${REPO}/contents/${FILE}`)).sha;
    } catch (e) {
      if (e.status !== 404) throw e;
    }
    return (await put(current)).content.sha;
  }
}
