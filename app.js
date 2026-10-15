// YDS Defter on the phone: words, review (know / don't know), notes and wrong answers.
// Reads every device's file from the private data repo, merges them with the extension's own rules
// (lib/merge.js) and writes what changes on the phone to cihazlar/telefon.json, which the computers
// pick up with their normal sync.
import { escapeHtml as e, timeAgo, dayKey, shuffle } from './lib/util.js';
import { review, isDue, status, STATUS_LABEL, ANSWERS, newSrs } from './lib/srs.js';
import { wordInfoHtml, speak, highlight } from './lib/card.js';
import { noteEntryHtml } from './lib/notebook.js';
import { TOPICS, topicById, staticQuestions } from './lib/grammar-data.js';
import { mergeObject } from './lib/merge.js';
import * as gh from './github.js';
import * as db from './db.js';

const TOKEN_KEY = 'yds-token';
const PREFS_KEY = 'yds-prefs';
const LETTERS = ['A', 'B', 'C', 'D', 'E'];
const STATIC = staticQuestions();
const $ = (s) => document.querySelector(s);

const state = {
  token: localStorage.getItem(TOKEN_KEY),
  data: {}, // merged data of all devices
  phone: {}, // what this phone changed (its file in the repo)
  shas: {}, // device file → blob sha already merged
  syncAt: 0,
  devices: [],
  sync: { busy: false, error: '' },
  route: [],
  review: null,
  miniQuiz: {},
  login: { busy: false, error: '' },
  prefs: (() => { try { return JSON.parse(localStorage.getItem(PREFS_KEY)) ?? {}; } catch { return {}; } })(),
};
const pref = (k, v) => {
  state.prefs[k] = v;
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(state.prefs)); } catch { /* private mode */ }
};

// ---------------- data ----------------

const all = (prefix) => Object.keys(state.data).filter((k) => k.startsWith(prefix)).map((k) => state.data[k]);
const words = () => all('w:').sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
const notes = () => all('n:').filter((n) => (n.title || n.body || n.images?.length)).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
const dueNotes = () => notes().filter((n) => n.review && isDue(n.srs));
const log = () => state.data.log ?? [];

let saveTimer;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => db.set('state', { data: state.data, phone: state.phone, shas: state.shas, syncAt: state.syncAt, dirty }).catch(() => {}), 400);
}

// Records a change made on the phone and sends it a few seconds later.
let pushTimer;
let dirty = false;
function changed(keys, entry) {
  for (const k of keys) state.phone[k] = state.data[k];
  if (entry) {
    state.data.log = [...log(), entry];
    state.phone.log = [...(state.phone.log ?? []), entry];
  }
  dirty = true;
  save();
  clearTimeout(pushTimer);
  pushTimer = setTimeout(push, 5000);
}

let pushing = null;
function push() {
  if (!dirty || !state.token) return Promise.resolve();
  pushing ??= (async () => {
    dirty = false;
    try {
      state.shas[`${gh.DEVICE}.json`] = await gh.writePhone(state.token, state.phone, state.shas[`${gh.DEVICE}.json`]);
      state.sync.error = '';
      save();
    } catch (err) {
      dirty = true;
      fail(err);
    }
  })().finally(() => { pushing = null; renderTop(); });
  return pushing;
}

let syncing = null;
function sync({ quiet = false } = {}) {
  if (!state.token) return Promise.resolve();
  syncing ??= (async () => {
    state.sync.busy = true;
    renderTop();
    try {
      await push();
      const files = await gh.listDevices(state.token);
      let n = 0;
      for (const f of files) {
        if (state.shas[f.name] === f.sha) continue;
        const json = await gh.readBlob(state.token, f.sha);
        n += mergeObject(state.data, json.data ?? {});
        state.shas[f.name] = f.sha;
      }
      state.devices = files.map((f) => f.device);
      state.syncAt = Date.now();
      state.sync.error = '';
      save();
      if (n && !quiet) toast(`${n} değişiklik geldi`);
      if (n) render();
    } catch (err) {
      fail(err);
    }
    state.sync.busy = false;
  })().finally(() => { syncing = null; renderTop(); });
  return syncing;
}

function fail(err) {
  if (err instanceof gh.AuthError) {
    logout(err.message);
    return;
  }
  state.sync.error = err.message;
}

async function logout(message = '') {
  clearTimeout(pushTimer);
  localStorage.removeItem(TOKEN_KEY);
  await db.clear().catch(() => {});
  Object.assign(state, { token: null, data: {}, phone: {}, shas: {}, syncAt: 0, review: null });
  state.login.error = message;
  location.hash = '';
  render();
}

// ---------------- views ----------------

const views = {};

function loginView() {
  const url = 'https://github.com/settings/personal-access-tokens/new?name=YDS+Defter+telefon&description=YDS+Defter+telefon+uygulamas%C4%B1&target_name=kereemyildiz&expires_in=366&contents=write';
  return `<div class="login">
    <div class="logo"><img src="icons/icon192.png" alt=""></div>
    <h1>YDS Defter</h1>
    <p class="muted">Verilerin GitHub'daki özel <b>${gh.REPO}</b> deposunda. Telefonun ona erişebilmesi için bir kez <b>erişim anahtarı</b> oluştur. Uygulama yalnızca <b>${gh.OWNER}</b> hesabının anahtarını kabul eder.</p>
    <ol class="steps">
      <li><a href="${url}" target="_blank" rel="noopener">GitHub'da anahtar oluşturma sayfasını aç</a> (${gh.OWNER} ile giriş yapmış ol).</li>
      <li><b>Repository access</b> → <b>Only select repositories</b> → <b>${gh.REPO}</b>.</li>
      <li><b>Permissions</b> → <b>Contents</b> → <b>Read and write</b> (başka izin verme).</li>
      <li><b>Generate token</b> → anahtarı kopyala, aşağı yapıştır.</li>
    </ol>
    <form data-form="login">
      <input id="token" type="password" placeholder="github_pat_…" autocomplete="off" autocapitalize="off" spellcheck="false" required>
      <button class="btn primary big" ${state.login.busy ? 'disabled' : ''}>${state.login.busy ? '<span class="spin"></span> Bağlanıyor…' : 'Bağlan'}</button>
    </form>
    ${state.login.error ? `<p class="err">${e(state.login.error)}</p>` : ''}
    <p class="muted small">Anahtar yalnızca bu telefonda saklanır ve yalnızca ${gh.REPO} deposunu okuyup yazabilir.</p>
  </div>`;
}

// ---- words ----

const FILTERS = [['all', 'Tümü'], ['new', 'Yeni'], ['learning', 'Öğreniliyor'], ['mastered', 'Öğrenildi'], ['starred', '⭐']];
const meaning = (w) => (w.info?.meanings ?? []).slice(0, 3).map((m) => m.tr).join(', ');

function wordListHtml() {
  const q = (state.prefs.q ?? '').trim().toLocaleLowerCase('tr');
  const f = state.prefs.filter ?? 'all';
  const list = words().filter((w) => (f === 'all' || (f === 'starred' ? w.starred : status(w.srs) === f))
    && (!q || w.term.toLocaleLowerCase('tr').includes(q) || meaning(w).toLocaleLowerCase('tr').includes(q) || (w.note ?? '').toLocaleLowerCase('tr').includes(q)));
  if (!list.length) return `<p class="empty">${q ? 'Eşleşen kelime yok.' : 'Bu listede kelime yok.'}</p>`;
  return `<p class="muted small count">${list.length} kelime</p><ul class="wlist">${list.map((w) => {
    const st = status(w.srs);
    return `<li><a href="#w/${w.id}"><div class="wl-main"><b>${e(w.term)}</b>${w.starred ? ' ⭐' : ''}
      <div class="muted wl-mean">${e(meaning(w) || w.note || '')}</div></div><span class="chip st-${st}">${STATUS_LABEL[st]}</span></a></li>`;
  }).join('')}</ul>`;
}

views.words = () => {
  const ws = words();
  const counts = { all: ws.length, starred: ws.filter((w) => w.starred).length };
  for (const w of ws) counts[status(w.srs)] = (counts[status(w.srs)] ?? 0) + 1;
  const f = state.prefs.filter ?? 'all';
  return `<div class="search"><input id="q" type="search" placeholder="Ara: kelime ya da anlam" value="${e(state.prefs.q ?? '')}"></div>
    <div class="chips-row">${FILTERS.map(([k, l]) => `<button class="pill ${f === k ? 'on' : ''}" data-act="filter" data-v="${k}">${l} <span>${counts[k] ?? 0}</span></button>`).join('')}</div>
    <div id="wlist">${wordListHtml()}</div>`;
};

views.w = (id) => {
  const w = state.data['w:' + id];
  if (!w) return '<p class="empty">Kelime bulunamadı. <a href="#words">Kelimeler</a></p>';
  const st = status(w.srs);
  return `<a class="back" href="#words">← Kelimeler</a>
    <div class="card">
      <div class="whead"><h1>${e(w.term)}</h1>
        <button class="icon" data-act="speak" data-text="${e(w.term)}" aria-label="Dinle">🔊</button>
        <span class="grow"></span>
        <button class="icon" data-act="star" data-id="${w.id}" aria-label="Yıldız">${w.starred ? '⭐' : '☆'}</button></div>
      <p class="muted small"><span class="chip st-${st}">${STATUS_LABEL[st]}</span> · ${timeAgo(w.createdAt)} eklendi${w.lookups > 1 ? ` · ${w.lookups} kez aradın` : ''}${w.srs?.reps ? ` · sonraki tekrar ${w.srs.due <= Date.now() ? 'şimdi' : new Date(w.srs.due).toLocaleDateString('tr-TR')}` : ''}</p>
      ${w.context ? `<div class="context">“${highlight(w.context, w.term)}”</div>` : ''}
      ${w.note ? `<div class="context">📝 ${e(w.note)}</div>` : ''}
      ${wordInfoHtml(w, { pool: words(), quizPick: state.miniQuiz[w.id] ?? null, footer: false })}
    </div>`;
};

// ---- review ----

function buildReview(scope) {
  if (scope === 'notes') return { scope, queue: dueNotes().sort((a, b) => (a.srs?.due ?? 0) - (b.srs?.due ?? 0)).map((n) => n.id), idx: 0, done: 0 };
  let ws;
  if (scope === 'extra') ws = shuffle(words().filter((w) => !isDue(w.srs))).slice(0, 20);
  else if (scope === 'starred') ws = words().filter((w) => w.starred);
  else ws = words().filter((w) => isDue(w.srs)).sort((a, b) => (a.srs.reps === 0) - (b.srs.reps === 0) || a.srs.due - b.srs.due);
  return { scope, queue: ws.map((w) => w.id), idx: 0, flipped: false, done: 0 };
}

function intervalLabel(srs, g) {
  if (g === 0) return '10 dk';
  const days = Math.round((review(srs, g).due - Date.now()) / 86400000);
  return days <= 1 ? 'yarın' : `${days} gün`;
}

const answerButtons = (srs, kind) => `<div class="answers">${ANSWERS.map((a) => `<button class="btn ans g${a.g}" data-act="grade" data-g="${a.g}"><b>${a[kind]}</b><small>${intervalLabel(srs, a.g)}</small></button>`).join('')}</div>`;

function blankOut(sentence, term) {
  const stem = term.split(' ')[0].slice(0, Math.max(4, term.length - 2));
  return e(sentence).replace(new RegExp(`\\b${stem.replace(/[-']/g, '\\$&')}\\p{L}*`, 'giu'), '<span class="blank">––––</span>');
}

views.review = (arg) => {
  const scope = arg ?? 'due';
  if (!state.review || state.review.scope !== scope) state.review = buildReview(scope);
  const r = state.review;
  const nWords = words().filter((w) => isDue(w.srs)).length;
  const today = log().filter((l) => dayKey(l.at) === dayKey()).length;
  const tabs = `<div class="seg"><a class="${scope !== 'notes' ? 'on' : ''}" href="#review">Kelimeler (${nWords})</a><a class="${scope === 'notes' ? 'on' : ''}" href="#review/notes">Notlar (${dueNotes().length})</a></div>`;
  const doneHtml = (what) => `<div class="empty"><div class="big">🎉</div><h2>${r.done ? `${r.done} ${what} tamam!` : `Şu an tekrar edilecek ${what} yok.`}</h2>
    ${scope === 'notes' ? '' : '<p><a class="btn" href="#review/extra">Rastgele 20 kelime</a> <a class="btn" href="#review/starred">Yıldızlılar</a></p>'}</div>`;
  if (scope === 'notes') {
    const n = state.data['n:' + r.queue[r.idx]];
    if (!n) return tabs + doneHtml('not');
    const t = n.topic ? topicById(n.topic) : null;
    return `${tabs}<p class="muted small">${r.idx + 1} / ${r.queue.length}${t ? ` · ${t.icon} ${e(t.title)}` : ''}</p>
      <div class="card">${noteEntryHtml(n, { editable: false })}<p class="muted small">Bunu hatırlıyor muydun?</p>${answerButtons(n.srs, 'note')}</div>`;
  }
  const w = state.data['w:' + r.queue[r.idx]];
  if (!w) return tabs + doneHtml('kart');
  const mode = state.prefs.mode ?? 'en-tr';
  const i = w.info ?? {};
  const ex = (i.examples ?? [])[0];
  const front = mode === 'tr-en'
    ? `<div class="term tr">${e((i.meanings ?? []).slice(0, 2).map((m) => m.tr).join(' · ') || '(anlam yok)')}</div>${ex ? `<div class="hint">${blankOut(ex.en, w.term)}</div>` : ''}`
    : `<div class="term">${e(w.term)} <button class="icon" data-act="speak" data-text="${e(w.term)}" aria-label="Dinle">🔊</button></div>${w.context ? `<div class="hint">“${highlight(w.context, w.term)}”</div>` : ''}`;
  const back = r.flipped
    ? `<div class="flip-back">${mode === 'tr-en' ? `<h2>${e(w.term)} <button class="icon" data-act="speak" data-text="${e(w.term)}">🔊</button></h2>` : ''}
        ${wordInfoHtml(w, { compact: true, footer: false })}${w.note ? `<div class="context">📝 ${e(w.note)}</div>` : ''}</div>${answerButtons(w.srs, 'word')}`
    : '<button class="btn primary big show" data-act="flip">Cevabı göster</button>';
  return `${tabs}<div class="row between"><span class="muted small">${r.idx + 1} / ${r.queue.length} · bugün ${today} tekrar</span>
      <span class="seg small"><a class="${mode === 'en-tr' ? 'on' : ''}" data-act="mode" data-v="en-tr">EN→TR</a><a class="${mode === 'tr-en' ? 'on' : ''}" data-act="mode" data-v="tr-en">TR→EN</a></span></div>
    <div class="card flash"><div class="front">${front}</div>${back}</div>`;
};

// ---- notes ----

views.notes = () => {
  const topic = state.prefs.ntopic ?? '';
  const ns = notes();
  const used = TOPICS.filter((t) => ns.some((n) => n.topic === t.id));
  const list = ns.filter((n) => !topic || (topic === '-' ? !n.topic : n.topic === topic));
  return `<div class="row"><select data-change="ntopic" class="grow"><option value="">Tüm notlar (${ns.length})</option>
      ${used.map((t) => `<option value="${t.id}" ${topic === t.id ? 'selected' : ''}>${t.icon} ${e(t.title)} (${ns.filter((n) => n.topic === t.id).length})</option>`).join('')}
      ${ns.some((n) => !n.topic) ? `<option value="-" ${topic === '-' ? 'selected' : ''}>🗒 Genel notlar</option>` : ''}</select></div>
    ${list.length ? `<div class="card notes">${list.map((n) => {
      const t = n.topic ? topicById(n.topic) : null;
      return `${!topic && t ? `<div class="ntopic">${t.icon} ${e(t.title)}</div>` : ''}${noteEntryHtml(n, { editable: false })}`;
    }).join('')}</div>` : '<p class="empty">Not yok.</p>'}`;
};

// ---- wrong answers ----

const meta = () => state.data.qmeta ?? {};
const bank = () => [...STATIC, ...all('q:')].map((q) => ({ ...q, topic: meta()[q.id]?.topic ?? q.topic }));
function wrongList(which, topic) {
  const P = state.data.gprog ?? {};
  return bank().filter((q) => {
    const p = P[q.id];
    return p && (which === 'now' ? p.c === false : p.n > p.ok) && (!topic || q.topic === topic);
  }).sort((a, b) => P[b.id].at - P[a.id].at);
}
const examTag = (q) => `${/YDS/.test(q.exam ?? '') ? 'ÖSYM ' : ''}${q.exam ?? 'Çıkmış'}${q.number ? ` · ${q.number}. soru` : ''}`;

function passageHtml(q) {
  const blank = q.stem.match(/^\((\d+)\)$/)?.[1];
  const p = e(q.passage).replace(/\((\d+)\)\s*-{3,}/g, (_, n) => (n === blank ? `<mark>(${n}) ––––</mark>` : `(${n}) ––––`));
  return `<div class="passage">${p.replace(/\n/g, '<br>')}</div>`;
}

function wrongCard(q) {
  const p = state.data.gprog[q.id];
  const t = topicById(q.topic);
  const lastWrong = p.c === false && p.p != null;
  const stem = /^\(\d+\)$/.test(q.stem) ? `<b>${q.stem}</b> numaralı boşluk` : e(q.stem).replace(/-{3,}/g, '<span class="blank">––––</span>').replace(/\n/g, '<br>');
  const opts = q.options.map((o, i) => {
    const cls = i === q.answer ? 'right' : lastWrong && i === p.p ? 'wrong' : 'dim';
    return `<div class="opt ${cls}"><b>${LETTERS[i]})</b> ${e(o)}${i === q.answer ? ' ✅' : lastWrong && i === p.p ? ' ❌' : ''}</div>`;
  }).join('');
  const ai = meta()[q.id]?.aiExplanation;
  return `<div class="card wcard">
    <div class="wmeta">${q.source === 'import' ? `<span class="chip st-mastered">📘 ${e(examTag(q))}</span>` : '<span class="chip">Örnek</span>'}
      ${t ? `<span class="chip">${t.icon} ${e(t.title)}</span>` : ''}</div>
    <div class="muted small">${p.c === false ? '<span class="err">❌ son cevabın yanlış</span>' : '✔ sonra doğru çözdün'} · ${p.n} denemede ${p.ok} doğru · ${timeAgo(p.at)}</div>
    ${q.passage ? (q.passage.length > 300 ? `<details><summary>Paragrafı göster</summary>${passageHtml(q)}</details>` : passageHtml(q)) : ''}
    <div class="stem">${stem}</div><div class="opts">${opts}</div>
    ${q.explanation ? `<div class="expl">${e(q.explanation)}</div>` : ''}${ai ? `<div class="expl">✨ ${e(ai)}</div>` : ''}</div>`;
}

views.wrong = () => {
  const which = state.prefs.wwhich ?? 'all';
  const topic = state.prefs.wtopic ?? '';
  const list = wrongList(which, topic);
  const topics = TOPICS.map((t) => [t, wrongList(which, t.id).length]).filter(([, n]) => n);
  if (!wrongList('all', '').length) return '<div class="empty"><div class="big">🎯</div><h2>Henüz yanlışın yok</h2><p>Bilgisayarda soru çözdükçe yanlışların burada birikir.</p></div>';
  return `<div class="seg"><a class="${which === 'all' ? 'on' : ''}" data-act="wwhich" data-v="all">Hepsi (${wrongList('all', topic).length})</a>
      <a class="${which === 'now' ? 'on' : ''}" data-act="wwhich" data-v="now">Hâlâ yanlış (${wrongList('now', topic).length})</a></div>
    <div class="row"><select data-change="wtopic" class="grow"><option value="">Tüm konular</option>
      ${topics.map(([t, n]) => `<option value="${t.id}" ${t.id === topic ? 'selected' : ''}>${e(t.title)} (${n})</option>`).join('')}</select></div>
    ${list.map(wrongCard).join('') || '<p class="empty">Bu filtrede soru yok.</p>'}`;
};

// ---- settings ----

views.settings = () => `<a class="back" href="#words">← Geri</a><div class="card">
    <h2>Hesap</h2><p>GitHub: <b>${gh.OWNER}</b> · veri deposu <b>${gh.REPO}</b></p>
    <h2>Eşitleme</h2>
    <p class="muted">${state.syncAt ? `Son eşitleme: ${timeAgo(state.syncAt)}` : 'Henüz eşitlenmedi'}${state.devices.length ? `<br>Cihazlar: ${state.devices.map(e).join(', ')}` : ''}</p>
    ${state.sync.error ? `<p class="err">⚠️ ${e(state.sync.error)}</p>` : ''}
    <p class="muted small">Telefonda yaptığın tekrarlar birkaç saniye içinde GitHub'a gider; bilgisayarlar en geç 5 dakika içinde alır. Uygulamayı açtığında bilgisayarlardaki değişiklikler gelir.</p>
    <button class="btn" data-act="sync" ${state.sync.busy ? 'disabled' : ''}>🔄 Şimdi eşitle</button>
    <h2>Ana ekrana ekle</h2>
    <p class="muted small">iPhone: Safari → Paylaş → <b>Ana Ekrana Ekle</b>. Android: Chrome → ⋮ → <b>Ana ekrana ekle</b> / <b>Uygulamayı yükle</b>.</p>
    <h2>Çıkış</h2>
    <p class="muted small">Anahtar ve bu telefondaki kopya silinir. GitHub'daki verilerin olduğu gibi kalır.</p>
    <button class="btn danger" data-act="logout">Çıkış yap</button></div>`;

// ---------------- render ----------------

function renderTop() {
  const el = $('#syncBtn');
  if (!el) return;
  el.innerHTML = state.sync.busy ? '<span class="spin"></span>' : state.sync.error ? '⚠️' : dirty ? '⏳' : '✓';
  el.title = state.sync.error || (state.syncAt ? `Son eşitleme: ${timeAgo(state.syncAt)}` : '');
}

function render() {
  document.body.classList.toggle('signed-out', !state.token);
  if (!state.token) {
    $('#main').innerHTML = loginView();
    return;
  }
  state.route = location.hash.slice(1).split('/').filter(Boolean);
  const [view = 'words', arg] = state.route;
  $('#main').innerHTML = (views[view] ?? views.words)(arg);
  const tab = view === 'w' ? 'words' : view;
  for (const a of document.querySelectorAll('nav.tabs a')) a.classList.toggle('on', a.dataset.tab === tab);
  const badge = $('#dueBadge');
  const due = words().filter((w) => isDue(w.srs)).length + dueNotes().length;
  badge.textContent = due > 99 ? '99+' : due;
  badge.hidden = !due;
  renderTop();
}

let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
}

// ---------------- actions ----------------

const actions = {
  sync: () => sync(),
  logout: () => confirm('Çıkış yapılsın mı?') && logout(),
  speak: (el) => speak(el.dataset.text),
  filter(el) { pref('filter', el.dataset.v); render(); },
  mode(el) { pref('mode', el.dataset.v); state.review.flipped = false; render(); },
  wwhich(el) { pref('wwhich', el.dataset.v); render(); },
  flip() { state.review.flipped = true; render(); },
  star(el) {
    const w = state.data['w:' + el.dataset.id];
    w.starred = !w.starred;
    w.updatedAt = Date.now();
    changed(['w:' + w.id]);
    render();
  },
  'mini-pick'(el) {
    state.miniQuiz[el.dataset.id] = Number(el.dataset.i);
    render();
  },
  grade(el) {
    const g = Number(el.dataset.g);
    const r = state.review;
    const id = r.queue[r.idx];
    const now = Date.now();
    if (r.scope === 'notes') {
      const n = state.data['n:' + id];
      n.srs = review(n.srs ?? newSrs(), g);
      n.syncAt = now; // a review is not an edit
      changed(['n:' + id], { at: now, id, g, kind: 'note' });
    } else {
      const w = state.data['w:' + id];
      w.srs = review(w.srs, g);
      w.updatedAt = now;
      changed(['w:' + id], { at: now, id, g });
      r.flipped = false;
    }
    if (g === 0) r.queue.push(id);
    r.idx += 1;
    r.done += 1;
    render();
    window.scrollTo(0, 0);
  },
};

document.addEventListener('click', (ev) => {
  const img = ev.target.closest('img[data-zoom]');
  if (img) {
    const box = Object.assign(document.createElement('div'), { className: 'lightbox' });
    box.innerHTML = `<img src="${img.src}" alt="">`;
    box.onclick = () => box.remove();
    document.body.appendChild(box);
    return;
  }
  const el = ev.target.closest('[data-act]');
  if (el && actions[el.dataset.act]) {
    ev.preventDefault();
    actions[el.dataset.act](el);
  }
});

document.addEventListener('input', (ev) => {
  if (ev.target.id !== 'q') return;
  pref('q', ev.target.value);
  $('#wlist').innerHTML = wordListHtml();
});

document.addEventListener('change', (ev) => {
  const k = ev.target.dataset.change;
  if (!k) return;
  pref(k, ev.target.value);
  render();
});

document.addEventListener('submit', async (ev) => {
  if (ev.target.dataset.form !== 'login') return;
  ev.preventDefault();
  const token = $('#token').value.trim();
  state.login = { busy: true, error: '' };
  render();
  try {
    await gh.verify(token);
    localStorage.setItem(TOKEN_KEY, token);
    state.token = token;
    state.login = { busy: false, error: '' };
    location.hash = '#words';
    render();
    await sync({ quiet: true });
    render();
  } catch (err) {
    state.login = { busy: false, error: err.message };
    render();
  }
});

window.addEventListener('hashchange', () => { render(); window.scrollTo(0, 0); });
// leaving the app sends pending changes; coming back fetches the computers' changes
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') push();
  else sync({ quiet: true });
});

// ---------------- start ----------------

(async () => {
  if (state.token) {
    try {
      const saved = await db.get('state');
      if (saved) {
        Object.assign(state, { data: saved.data ?? {}, phone: saved.phone ?? {}, shas: saved.shas ?? {}, syncAt: saved.syncAt ?? 0 });
        dirty = Boolean(saved.dirty); // changes not sent before the app was closed
      }
    } catch { /* first start or storage blocked: everything comes from GitHub */ }
  }
  render();
  sync({ quiet: true });
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
