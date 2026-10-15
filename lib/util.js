// Shared helpers used by the background worker, popup and dashboard.

export const DAY = 24 * 60 * 60 * 1000;

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// "  Resilient!! " -> "resilient"; keeps inner apostrophes/hyphens ("well-being", "don't").
export function normalizeTerm(text) {
  return String(text ?? '')
    .replace(/[’`]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^[^\p{L}]+|[^\p{L}]+$/gu, '')
    .toLowerCase();
}

// Words or short phrases (max 5 words) written with Latin letters only.
export function isCapturable(text) {
  const t = normalizeTerm(text);
  if (t.length < 2 || t.length > 60) return false;
  if (t.split(' ').length > 5) return false;
  return /^[a-zçğıöşü][a-zçğıöşü' -]*$/.test(t);
}

// Splits a multi-line Translate input ("word1\nword2") into capturable terms.
export function splitCapture(text) {
  const out = [];
  for (const line of String(text ?? '').split(/\n+/)) {
    if (isCapturable(line)) {
      const t = normalizeTerm(line);
      if (!out.includes(t)) out.push(t);
    }
  }
  return out;
}

export function startOfDay(ts = Date.now()) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function dayKey(ts = Date.now()) {
  const d = new Date(ts);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[c]);
}

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function timeAgo(ts, now = Date.now()) {
  const s = Math.round((now - ts) / 1000);
  if (s < 60) return 'az önce';
  const m = Math.round(s / 60);
  if (m < 60) return `${m} dk önce`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} sa önce`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d} gün önce`;
  return new Date(ts).toLocaleDateString('tr-TR');
}

// Turns pasted notes ("precaution - önlem", "1. mitigate: hafifletmek", "scarce, abundant") into
// [{ term, note }]. Lines that aren't a word/short phrase are skipped.
export function parseWordList(text) {
  const out = [];
  const seen = new Set();
  const push = (raw, note = '') => {
    if (!isCapturable(raw)) return;
    const term = normalizeTerm(raw);
    if (seen.has(term)) return;
    seen.add(term);
    out.push({ term, note: note.trim() });
  };
  for (let line of String(text ?? '').split(/\r?\n/)) {
    line = line.replace(/^\s*(?:[-*•●▪◦►]|\d+[.)-])\s*/, '').trim();
    if (!line) continue;
    const paren = line.match(/^([^()]+?)\s*\((.+)\)\s*$/);
    if (paren && isCapturable(paren[1])) { push(paren[1], paren[2]); continue; }
    const sep = line.match(/\s+[-–—]\s+|\s*[:=→–—]\s*|\t+/);
    if (sep) { push(line.slice(0, sep.index), line.slice(sep.index + sep[0].length)); continue; }
    if (line.includes(',') && line.split(',').every((p) => isCapturable(p))) {
      for (const part of line.split(',')) push(part);
      continue;
    }
    push(line);
  }
  return out;
}

// A note's display title: its title, else the first line of its text.
export function noteTitle(n) {
  if (n?.title?.trim()) return n.title.trim();
  const first = String(n?.body ?? '').trim().split('\n')[0];
  if (first) return first.length > 90 ? `${first.slice(0, 87)}…` : first;
  return n?.images?.length ? 'Görsel not' : 'Başlıksız not';
}
