// Renders a word's YDS card (shared by the dashboard and the popup).
import { escapeHtml as e } from './util.js';

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

export function speak(text) {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = 0.95;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

const section = (title, body) => (body ? `<section class="card-sec"><h4>${title}</h4>${body}</section>` : '');

// Bolds the studied word inside an example sentence (also catches inflections like "resiliently").
export function highlight(sentence, term) {
  const safe = e(sentence);
  const stem = term.split(' ')[0].replace(/[^\p{L}'-]/gu, '').slice(0, Math.max(4, term.length - 2));
  if (!stem) return safe;
  return safe.replace(new RegExp(`\\b(${stem.replace(/[-']/g, '\\$&')}\\p{L}*)`, 'giu'), '<b>$1</b>');
}

export function quizHtml(q, picked, attrs = '') {
  if (!q?.options?.length) return '';
  const opts = q.options.map((o, i) => {
    let cls = '';
    if (picked != null) cls = i === q.answer ? 'right' : i === picked ? 'wrong' : 'dim';
    return `<button class="opt ${cls}" data-act="mini-pick" data-i="${i}" ${attrs} ${picked != null ? 'disabled' : ''}><b>${LETTERS[i]})</b> ${e(o)}</button>`;
  }).join('');
  const expl = picked != null && q.explanation ? `<div class="expl">${picked === q.answer ? '✅ Doğru! ' : '❌ '}${e(q.explanation)}</div>` : '';
  return `<div class="stem">${e(q.stem).replace(/-{3,}/g, '<span class="blank">––––</span>')}</div><div class="opts">${opts}</div>${expl}`;
}

// Simple string hash → deterministic choices, so a card's question doesn't reshuffle on every render.
function hash(str) {
  let h = 2166136261;
  for (const c of str) h = Math.imul(h ^ c.codePointAt(0), 16777619);
  return h >>> 0;
}

function seededShuffle(arr, seed) {
  const a = arr.slice();
  let s = seed || 1;
  for (let i = a.length - 1; i > 0; i--) {
    s = Math.imul(s ^ (s >>> 15), 2246822519) >>> 0;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// A token-free practice question: one of the word's own example sentences with the word blanked,
// distractors taken from other words in the notebook.
export function freeQuiz(w, pool = []) {
  const i = w.info ?? {};
  const escape = (s) => s.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&');
  const stem = escape(w.term.split(' ')[0].slice(0, Math.max(4, w.term.length - 2)));
  const re = w.term.includes(' ') ? new RegExp(`\\b${escape(w.term)}\\b`, 'i') : new RegExp(`\\b${stem}\\p{L}*`, 'iu');
  const ex = [...(i.academicExamples ?? []), ...(i.examples ?? [])].find((x) => re.test(x.en));
  if (!ex) return null;
  const form = ex.en.match(re)[0];
  const multi = w.term.includes(' ');
  const others = pool.filter((o) => o.id !== w.id && o.info?.meanings?.length && o.term.includes(' ') === multi);
  const pos = i.meanings?.[0]?.pos;
  const samePos = others.filter((o) => o.info.meanings[0].pos === pos);
  const cands = samePos.length >= 4 ? samePos : others;
  if (cands.length < 4) return null;
  const distractors = seededShuffle(cands, hash(w.id)).slice(0, 4).map((o) => o.term);
  const options = seededShuffle([form, ...distractors], hash(`${w.id}:o`));
  return {
    stem: ex.en.replace(re, '----'),
    options,
    answer: options.indexOf(form),
    explanation: ex.tr ? `“${form}” — ${ex.tr}` : `Doğru cevap: ${form}`,
  };
}

// `footer: false` leaves out the source line and the Claude hints (the phone app has no Claude).
export function wordInfoHtml(w, { compact = false, quizPick = null, pool = [], aiOn = false, footer = true } = {}) {
  const i = w.info;
  if (w.infoStatus === 'pending') return `<p class="muted"><span class="spin"></span> YDS kartı hazırlanıyor…</p>`;
  if (w.infoStatus === 'error') {
    return `<p class="err">⚠️ ${e(w.infoError)}</p><button class="btn" data-act="reenrich" data-id="${w.id}">Tekrar dene</button>`;
  }
  if (!i) return '';

  const meanings = (i.meanings ?? []).map((m) => `<li>${m.pos ? `<span class="pos">${e(m.pos)}</span> ` : ''}<b>${e(m.tr)}</b>${m.en && !compact ? `<div class="muted small">${e(m.en)}</div>` : ''}</li>`).join('');
  const examples = [...(i.academicExamples ?? []), ...(i.examples ?? [])].slice(0, compact ? 1 : 6).map((x) => `
    <li><div class="ex-en">${highlight(x.en, w.term)} <button class="icon" data-act="speak" data-text="${e(x.en)}" title="Dinle">🔊</button></div>${x.tr ? `<div class="ex-tr">${e(x.tr)}</div>` : ''}</li>`).join('');
  const chips = (arr, cls = '') => (arr ?? []).map((s) => `<span class="chip ${cls}">${e(s)}</span>`).join(' ');

  let html = section('Anlamlar', meanings && `<ul class="means">${meanings}</ul>`)
    + section('Örnek cümleler', examples && `<ul class="examples">${examples}</ul>`)
    + section('Eş anlamlılar', chips(compact ? i.synonyms?.slice(0, 6) : i.synonyms));
  if (i.ydsTip) html += `<div class="tip">💡 <b>YDS ipucu:</b> ${e(i.ydsTip)}</div>`;
  if (compact) return html;

  html += section('Zıt anlamlılar', chips(i.antonyms));
  html += section('Kelime ailesi', (i.wordFamily ?? []).length
    ? `<table class="fam">${i.wordFamily.map((f) => `<tr><td><b>${e(f.word)}</b></td><td class="muted">${e(f.pos)}</td><td>${e(f.tr)}</td></tr>`).join('')}</table>` : '');
  html += section('Kalıplar & edatlar', (i.collocations ?? []).length
    ? `<ul class="colls">${i.collocations.map((c) => `<li><b>${e(c.phrase)}</b> <span class="muted">— ${e(c.tr)}</span></li>`).join('')}</ul>` : '');
  html += section('Karıştırılan kelimeler', (i.confusables ?? []).length
    ? `<ul class="colls">${i.confusables.map((c) => `<li><b>${e(c.word)}</b> <span class="muted">— ${e(c.note)}</span></li>`).join('')}</ul>` : '');
  if (i.mnemonic) html += `<div class="tip mn">🧠 <b>Hafıza kancası:</b> ${e(i.mnemonic)}</div>`;
  const quiz = i.quiz ?? freeQuiz(w, pool);
  if (quiz) html += section(i.quiz ? 'Mini YDS sorusu' : 'Mini soru <span class="muted small">(defterindeki kelimelerden)</span>', `<div class="quiz" data-word="${w.id}">${quizHtml(quiz, quizPick, `data-id="${w.id}"`)}</div>`);
  if (!footer) return html;
  const source = i.engine === 'claude' ? e(i.model) : `ücretsiz sözlük${i.extras ? ` + ${e(i.extrasModel ?? 'Claude')}` : ''}`;
  html += `<p class="muted small engine">Kaynak: ${source}</p>`;
  if (!i.extras && i.engine !== 'claude') {
    html += aiOn
      ? `<button class="btn" data-act="claude-extras" data-id="${w.id}">✨ Claude ile YDS ayrıntılarını ekle <span class="muted small">(token harcar)</span></button>
         <p class="muted small">Akademik örnekler, kalıplar & edatlar, kelime ailesi, karıştırılanlar, YDS ipucu ve sınav tarzı soru.</p>`
      : `<p class="muted small">Claude'u Ayarlar'dan açarsan YDS ipucu, kalıplar, kelime ailesi ve sınav tarzı soru da eklenebilir.</p>`;
  }
  return html;
}
