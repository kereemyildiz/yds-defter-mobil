// Merge rules for data coming from another device (a computer, the phone app or a backup).
// Pure: works on plain objects, so the extension (chrome.storage) and the phone app share it.
//   items (w: n: s: q: lx:)  the newer version wins (updatedAt / syncAt / lastAt / createdAt)
//   del:<key>               deletion time; wins over older edits
//   log                     union (by time + id)
//   gprog                   per question, the newest answer wins
//   qmeta                   shallow merge, local values win
//   gqa                     union per topic (by time)
export const ITEM = /^(?:[wnsq]|lx):/;
export const SHARED = new Set(['log', 'gprog', 'qmeta', 'gqa']);
export const stamp = (v) => Math.max(v?.updatedAt ?? 0, v?.syncAt ?? 0, v?.lastAt ?? 0, v?.createdAt ?? 0);
export const isSynced = (k) => ITEM.test(k) || k.startsWith('del:') || SHARED.has(k);

// Returns what to change in `cur` to take in `remote`: { patch, remove, changed }.
export function mergeInto(cur, remote) {
  const patch = {};
  const remove = [];
  let changed = 0;
  const tomb = (k) => Math.max(cur['del:' + k] ?? 0, remote['del:' + k] ?? 0);
  for (const [k, v] of Object.entries(remote ?? {})) {
    if (k.startsWith('del:')) {
      const key = k.slice(4);
      if (!cur[k] || v > cur[k]) patch[k] = v;
      if (cur[key] && stamp(cur[key]) <= v) { remove.push(key); changed++; }
    } else if (ITEM.test(k)) {
      if (tomb(k) >= stamp(v)) continue;
      if (!cur[k] || stamp(v) > stamp(cur[k])) { patch[k] = v; changed++; }
    } else if (k === 'log') {
      const seen = new Set((cur.log ?? []).map((e) => `${e.at}|${e.id}`));
      const extra = (v ?? []).filter((e) => !seen.has(`${e.at}|${e.id}`));
      if (extra.length) { patch.log = [...(cur.log ?? []), ...extra].sort((a, b) => a.at - b.at); changed++; }
    } else if (k === 'gprog') {
      const mine = { ...(cur.gprog ?? {}) };
      let n = 0;
      for (const [q, p] of Object.entries(v ?? {})) if (!mine[q] || (p.at ?? 0) > (mine[q].at ?? 0)) { mine[q] = p; n++; }
      if (n) { patch.gprog = mine; changed++; }
    } else if (k === 'qmeta') {
      const mine = { ...(cur.qmeta ?? {}) };
      let n = 0;
      for (const [q, m] of Object.entries(v ?? {})) {
        const merged = { ...m, ...mine[q] };
        if (JSON.stringify(merged) !== JSON.stringify(mine[q] ?? {})) { mine[q] = merged; n++; }
      }
      if (n) { patch.qmeta = mine; changed++; }
    } else if (k === 'gqa') {
      const mine = { ...(cur.gqa ?? {}) };
      let n = 0;
      for (const [t, list] of Object.entries(v ?? {})) {
        const seen = new Set((mine[t] ?? []).map((x) => x.at));
        const extra = (list ?? []).filter((x) => !seen.has(x.at));
        if (extra.length) { mine[t] = [...(mine[t] ?? []), ...extra].sort((a, b) => a.at - b.at); n++; }
      }
      if (n) { patch.gqa = mine; changed++; }
    }
  }
  return { patch, remove, changed };
}

// Same, applied to a plain object in place. Returns how many items changed.
export function mergeObject(cur, remote) {
  const { patch, remove, changed } = mergeInto(cur, remote);
  Object.assign(cur, patch);
  for (const k of remove) delete cur[k];
  return changed;
}
