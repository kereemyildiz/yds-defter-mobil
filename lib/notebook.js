// "Notlar": the student's notes as a study notebook, in three views —
//   📖 Okuma   one centred document, a chapter per topic, table of contents that follows the scroll
//   🗂 Kartlar a card gallery for scanning; a card opens the note large, ← → move between notes
//   🕒 Zaman   what you learned, grouped by day
// Reading comfort: optional light "paper" page, text size, focus mode (hides the app chrome).
import { escapeHtml as e, startOfDay, DAY } from '../lib/util.js';
import { renderMarkdown } from '../lib/md.js';
import { TOPICS } from '../lib/grammar-data.js';

const fmtTime = (sec) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
const fmtDate = (ts) => new Date(ts).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
const topicOf = (id) => TOPICS.find((t) => t.id === id) ?? { id: '', icon: '🗒', title: 'Genel notlar' };
const PREFS_KEY = 'nb-prefs';

function sourceHtml(n) {
  if (!n.source?.url) return '';
  return `<a href="${e(n.source.url)}" target="_blank" title="${e(n.source.url)}">🎬 ${e(n.source.title || 'Kaynak')}${n.source.time != null ? ` · ${fmtTime(n.source.time)}` : ''}</a>`;
}

// One note, as shown in the notebook, the topic page, the review screen and the editor preview.
export function noteEntryHtml(n, { editable = true } = {}) {
  const imgs = n.images ?? [];
  const meta = [sourceHtml(n), fmtDate(n.createdAt ?? n.updatedAt), n.review ? '🔁 tekrarda' : ''].filter(Boolean).join(' · ');
  return `<article class="nentry${imgs.length ? ' has-img' : ''}${n.pinned ? ' pinned' : ''}" id="note-${n.id}">
    <div class="ntext">
      ${n.title ? `<h3>${n.pinned ? '📌 ' : ''}${e(n.title)}</h3>` : ''}
      <div class="md">${n.body?.trim() ? renderMarkdown(n.body) : ''}</div>
      ${imgs.length ? `<div class="nimgs">${imgs.map((s, i) => `<img src="${s}" alt="" data-zoom="1" data-note="${n.id}" data-i="${i}" loading="lazy">`).join('')}</div>` : ''}
      <div class="nmeta"><span>${meta}</span>${editable ? `<span class="nact"><a href="#notes/${n.id}" title="Düzenle">✏️ Düzenle</a></span>` : ''}</div>
    </div>
  </article>`;
}

function excerpt(n) {
  // first ~6 lines of the rendered note for cards; CSS clamps the height
  const lines = String(n.body ?? '').split('\n').slice(0, 8).join('\n');
  return renderMarkdown(lines);
}

export function createNotebook({ state, render }) {
  let prefs = { view: 'read', paper: false, size: 1, focus: false };
  try { prefs = { ...prefs, ...JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') }; } catch { /* storage unavailable */ }
  const savePrefs = () => { try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch { /* ignore */ } };
  const nb = () => (state.nb ??= { topic: 'all', q: '', open: null });

  function filtered() {
    const { q } = nb();
    const needle = q.toLocaleLowerCase('tr');
    return state.notes.filter((n) => !needle || `${n.title} ${n.body} ${n.source?.title ?? ''}`.toLocaleLowerCase('tr').includes(needle));
  }

  function chapters(notes) {
    return [...TOPICS.map((t) => t.id), '']
      .map((id) => ({
        ...topicOf(id),
        notes: notes.filter((n) => (n.topic ?? '') === id)
          .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || (a.createdAt ?? 0) - (b.createdAt ?? 0)),
      }))
      .filter((c) => c.notes.length);
  }

  // the notes the open-note viewer steps through, in the order the current view shows them
  function sequence() {
    const notes = filtered();
    if (prefs.view === 'time') return notes.slice().sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    const topic = nb().topic;
    return chapters(notes).filter((c) => prefs.view === 'read' || topic === 'all' || c.id === topic).flatMap((c) => c.notes);
  }

  // ---------------- views ----------------

  function readView(chs) {
    return `<div class="reader">${chs.map((c) => `<section class="nchapter" id="ch-${c.id || 'genel'}" data-ch="${c.id}">
        <h2><span>${c.icon} ${e(c.title)}</span><span class="muted small">${c.notes.length} not</span>
          ${c.id ? `<a class="small" href="#grammar/t/${c.id}">konu anlatımı →</a>` : ''}</h2>
        ${c.notes.map((n) => noteEntryHtml(n)).join('')}</section>`).join('')}</div>`;
  }

  function card(n) {
    const t = topicOf(n.topic ?? '');
    const img = n.images?.[0];
    return `<article class="ncard" data-act="nb-open" data-id="${n.id}" tabindex="0">
      ${img ? `<div class="ncard-img"><img src="${img}" alt="" loading="lazy"></div>` : ''}
      <div class="ncard-body">
        ${n.title ? `<h3>${n.pinned ? '📌 ' : ''}${e(n.title)}</h3>` : ''}
        <div class="md ncard-text">${excerpt(n)}</div>
      </div>
      <div class="ncard-foot"><span class="tchip">${t.icon} ${e(t.title)}</span>
        <span class="muted small">${n.source ? '🎬 ' : ''}${(n.images?.length ?? 0) > 1 ? `🖼${n.images.length} ` : ''}${new Date(n.createdAt ?? n.updatedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</span></div>
    </article>`;
  }

  function cardsView(chs) {
    const topic = nb().topic;
    const notes = chs.filter((c) => topic === 'all' || c.id === topic).flatMap((c) => c.notes);
    return `<div class="ncards">${notes.map(card).join('')}</div>`;
  }

  function timeView(notes) {
    const today = startOfDay();
    const label = (ts) => {
      const d = startOfDay(ts);
      if (d === today) return 'Bugün';
      if (d === today - DAY) return 'Dün';
      if (d > today - 7 * DAY) return 'Bu hafta';
      if (d > today - 30 * DAY) return 'Bu ay';
      return new Date(ts).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
    };
    const groups = new Map();
    for (const n of notes.slice().sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))) {
      const k = label(n.createdAt ?? n.updatedAt);
      groups.set(k, [...(groups.get(k) ?? []), n]);
    }
    return `<div class="ntimeline">${[...groups].map(([k, ns]) => `<section><h2>${k} <span class="muted small">${ns.length} not</span></h2>
      <div class="ncards">${ns.map(card).join('')}</div></section>`).join('')}</div>`;
  }

  function viewerHtml() {
    const seq = sequence();
    const i = seq.findIndex((n) => n.id === nb().open);
    if (i < 0) { nb().open = null; return ''; }
    const n = seq[i];
    const t = topicOf(n.topic ?? '');
    return `<div class="nviewer" data-act="nb-close">
      <div class="nviewer-box ${prefs.paper ? 'paper' : ''}" data-act="nb-noop">
        <div class="nviewer-head"><span class="tchip">${t.icon} ${e(t.title)}</span><span class="muted small">${i + 1} / ${seq.length}</span>
          <span class="grow"></span><a class="btn ghost small" href="#notes/${n.id}">✏️ Düzenle</a>
          <button class="btn ghost" data-act="nb-close" title="Kapat (Esc)">✕</button></div>
        ${noteEntryHtml(n, { editable: false })}
        <div class="nviewer-nav"><button class="btn" data-act="nb-step" data-d="-1" ${i ? '' : 'disabled'}>← Önceki</button>
          <span class="muted small">← → ile gez · Esc kapat</span>
          <button class="btn" data-act="nb-step" data-d="1" ${i < seq.length - 1 ? '' : 'disabled'}>Sonraki →</button></div>
      </div></div>`;
  }

  function view() {
    const { topic, q } = nb();
    const notes = filtered();
    const chs = chapters(notes);
    const wordNotes = state.words.filter((w) => w.note?.trim() && (!q || `${w.term} ${w.note}`.toLocaleLowerCase('tr').includes(q.toLocaleLowerCase('tr'))));
    const toc = `<a class="toc ${topic === 'all' ? 'on' : ''}" data-act="nb-topic" data-topic="all">📚 Tümü <span>${notes.length}</span></a>
      ${chs.map((c) => `<a class="toc" data-act="nb-topic" data-topic="${c.id}">${c.icon} ${e(c.title)} <span>${c.notes.length}</span></a>`).join('')}
      ${wordNotes.length ? `<a class="toc ${topic === 'words' ? 'on' : ''}" data-act="nb-topic" data-topic="words">🔤 Kelime notların <span>${wordNotes.length}</span></a>` : ''}`;

    let body;
    if (!state.notes.length) {
      body = `<div class="panel empty"><div class="big">📝</div><h2>Defterin boş</h2>
        <p>Video izlerken <b>Alt+Shift+N</b> ile öğrendiğini yaz (görselle birlikte), ya da <b>+ Yeni not</b>.<br>
        Notlar konularına göre bölümlenir ve burada ders notu gibi büyür.</p></div>`;
    } else if (topic === 'words') {
      body = `<div class="reader"><section class="nchapter"><h2><span>🔤 Kelime notların</span></h2>${wordNotes.map((w) => `<article class="nentry"><div class="ntext">
        <h3><a href="#words/${w.id}">${e(w.term)}</a></h3><div class="md">${renderMarkdown(w.note)}</div></div></article>`).join('')}</section></div>`;
    } else if (!chs.length) {
      body = '<div class="panel empty">Aramana uyan not yok.</div>';
    } else if (prefs.view === 'cards') body = cardsView(chs);
    else if (prefs.view === 'time') body = timeView(notes);
    else body = readView(chs);

    const seg = (v, label) => `<button class="seg ${prefs.view === v ? 'on' : ''}" data-act="nb-view" data-v="${v}">${label}</button>`;
    const toolbar = `<div class="nb-toolbar">
      <div class="segs">${seg('read', '📖 Okuma')}${seg('cards', '🗂 Kartlar')}${seg('time', '🕒 Zaman')}</div>
      <span class="grow"></span>
      <button class="btn ghost" data-act="nb-size" data-d="-1" title="Yazıyı küçült">A−</button>
      <button class="btn ghost" data-act="nb-size" data-d="1" title="Yazıyı büyüt">A+</button>
      <button class="btn ghost ${prefs.paper ? 'on' : ''}" data-act="nb-paper" title="Açık renkli kâğıt sayfa">📄 Kâğıt</button>
      <button class="btn ghost" data-act="nb-focus" title="Odak modu: menüleri gizle (F)">⛶ Odak</button>
      <button class="btn ghost" data-act="nb-print" title="Yazdır / PDF">🖨</button>
    </div>`;

    return `<div class="notebook size-${prefs.size} ${prefs.paper ? 'paper-on' : ''} view-${prefs.view}">
      <aside class="nb-side">
        <button class="btn primary" data-act="note-new" style="width:100%;justify-content:center">+ Yeni not</button>
        <input id="nbq" type="search" data-live="search" placeholder="Notlarda ara…  ( / )" value="${e(q)}">
        <nav class="tocs">${toc}</nav>
        <details class="nb-help"><summary class="muted small">Yazım ipuçları</summary>
          <p class="small"><code>**kalın**</code> · <code>==vurgu==</code> · <code>- madde</code> · <code>\`kod\`</code><br>
          <code>! tuzak/dikkat</code> → ⚠️ kutusu<br><code>? kendine soru</code> → ❓ kutusu<br><code>&gt; not</code> → alıntı kutusu</p></details>
      </aside>
      <div class="nb-main">${toolbar}${body}</div>
      ${nb().open ? viewerHtml() : ''}
      ${prefs.focus ? '<button class="btn nb-unfocus" data-act="nb-focus">Odak modundan çık (Esc)</button>' : ''}
    </div>`;
  }

  // ---------------- behaviour ----------------

  let spy;
  function afterRender() {
    document.body.classList.toggle('nb-focus', prefs.focus);
    spy?.disconnect();
    if (prefs.view !== 'read') return;
    // table of contents follows the chapter being read
    const tocs = [...document.querySelectorAll('.toc[data-topic]')];
    spy = new IntersectionObserver((entries) => {
      const visible = entries.filter((x) => x.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (!visible) return;
      const id = visible.target.dataset.ch;
      for (const t of tocs) t.classList.toggle('on', t.dataset.topic === id);
    }, { rootMargin: '-80px 0px -60% 0px' });
    document.querySelectorAll('.nchapter[data-ch]').forEach((s) => spy.observe(s));
  }

  function leave() {
    spy?.disconnect();
    document.body.classList.remove('nb-focus');
  }

  const actions = {
    'nb-topic'(el) {
      const id = el.dataset.topic;
      if (prefs.view === 'read' && id !== 'words' && id !== 'all' && nb().topic !== 'words') {
        document.getElementById(`ch-${id || 'genel'}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      nb().topic = id;
      render();
      window.scrollTo(0, 0);
    },
    'nb-view'(el) { prefs.view = el.dataset.v; if (nb().topic === 'words') nb().topic = 'all'; savePrefs(); render(); },
    'nb-size'(el) { prefs.size = Math.max(0, Math.min(3, prefs.size + Number(el.dataset.d))); savePrefs(); render(); },
    'nb-paper'() { prefs.paper = !prefs.paper; savePrefs(); render(); },
    'nb-focus'() { prefs.focus = !prefs.focus; savePrefs(); render(); },
    'nb-print'() { window.print(); },
    'nb-open'(el) { nb().open = el.dataset.id; render(); },
    'nb-close'() { nb().open = null; render(); },
    'nb-noop'() {}, // clicks inside the open note must not close it
    'nb-step'(el) { step(Number(el.dataset.d)); },
  };

  function step(d) {
    const seq = sequence();
    const i = seq.findIndex((n) => n.id === nb().open);
    const next = seq[i + d];
    if (next) { nb().open = next.id; render(); }
  }

  // keys while the notebook is shown; returns true when handled
  function key(ev) {
    if (nb().open) {
      if (ev.key === 'ArrowRight') { step(1); return true; }
      if (ev.key === 'ArrowLeft') { step(-1); return true; }
      if (ev.key === 'Escape') { nb().open = null; render(); return true; }
      return false;
    }
    if (ev.key === 'Escape' && prefs.focus) { prefs.focus = false; savePrefs(); render(); return true; }
    if (ev.key === '/') { document.getElementById('nbq')?.focus(); return true; }
    if (ev.key.toLowerCase() === 'f') { prefs.focus = !prefs.focus; savePrefs(); render(); return true; }
    return false;
  }

  return { view, actions, afterRender, leave, key };
}
