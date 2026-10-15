// A small, safe Markdown renderer for notes: the text is escaped first, then a few markers are
// turned into tags. Supports # headings, - / * / • lists, 1. lists, > quotes, **bold**, *italic*,
// `code`, ==highlight==, links, blank-line paragraphs, and boxes: "! …" (warning), "? …" (question).
import { escapeHtml } from './util.js';

function inline(s) {
  return s
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/==(.+?)==/g, '<mark>$1</mark>')
    .replace(/(^|[\s(])\*([^*\s][^*]*?)\*(?=[\s).,!?:;]|$)/g, '$1<i>$2</i>')
    .replace(/(^|[\s(])_([^_\s][^_]*?)_(?=[\s).,!?:;]|$)/g, '$1<i>$2</i>')
    .replace(/\bhttps?:\/\/[^\s<]+[^\s<.,;:!?)]/g, (url) => `<a href="${url}" target="_blank" rel="noopener">${url}</a>`);
}

export function renderMarkdown(src) {
  const lines = escapeHtml(String(src ?? '').replace(/\r/g, '')).split('\n');
  const out = [];
  let list = null; // 'ul' | 'ol'
  let para = [];
  const flushPara = () => {
    if (para.length) out.push(`<p>${para.map(inline).join('<br>')}</p>`);
    para = [];
  };
  const closeList = () => {
    if (list) out.push(`</${list}>`);
    list = null;
  };
  for (const raw of lines) {
    const line = raw.trimEnd();
    let m;
    if (!line.trim()) { flushPara(); closeList(); continue; }
    if ((m = line.match(/^(#{1,3})\s+(.*)$/))) {
      flushPara(); closeList();
      out.push(`<h${m[1].length + 3}>${inline(m[2])}</h${m[1].length + 3}>`);
    } else if ((m = line.match(/^\s*(?:[-*•])\s+(.*)$/))) {
      flushPara();
      if (list !== 'ul') { closeList(); out.push('<ul>'); list = 'ul'; }
      out.push(`<li>${inline(m[1])}</li>`);
    } else if ((m = line.match(/^\s*\d+[.)]\s+(.*)$/))) {
      flushPara();
      if (list !== 'ol') { closeList(); out.push('<ol>'); list = 'ol'; }
      out.push(`<li>${inline(m[1])}</li>`);
    } else if ((m = line.match(/^&gt;\s?(.*)$/))) {
      flushPara(); closeList();
      out.push(`<blockquote>${inline(m[1])}</blockquote>`);
    } else if ((m = line.match(/^!\s+(.*)$/))) {
      // "! …" → a warning box (traps, exceptions)
      flushPara(); closeList();
      out.push(`<div class="callout warn"><span>⚠️</span><div>${inline(m[1])}</div></div>`);
    } else if ((m = line.match(/^\?\s+(.*)$/))) {
      // "? …" → a question to ask yourself
      flushPara(); closeList();
      out.push(`<div class="callout ask"><span>❓</span><div>${inline(m[1])}</div></div>`);
    } else {
      closeList();
      para.push(line);
    }
  }
  flushPara();
  closeList();
  return out.join('');
}
