// A tiny IndexedDB key-value store: the merged data (with note images) is too big for localStorage.
const open = () => new Promise((resolve, reject) => {
  const req = indexedDB.open('yds-defter', 1);
  req.onupgradeneeded = () => req.result.createObjectStore('kv');
  req.onsuccess = () => resolve(req.result);
  req.onerror = () => reject(req.error);
});
let dbp;
const db = () => (dbp ??= open());

function run(mode, fn) {
  return db().then((d) => new Promise((resolve, reject) => {
    const tx = d.transaction('kv', mode);
    const req = fn(tx.objectStore('kv'));
    tx.oncomplete = () => resolve(req?.result);
    tx.onerror = () => reject(tx.error);
  }));
}

export const get = (key) => run('readonly', (s) => s.get(key));
export const set = (key, value) => run('readwrite', (s) => s.put(value, key));
export const clear = () => run('readwrite', (s) => s.clear());
