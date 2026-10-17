// Spaced repetition (SM-2 variant, Anki-like grades).
// grade: 0 = Tekrar (unuttum), 1 = Zor, 2 = İyi, 3 = Kolay
import { DAY, startOfDay } from './util.js';

// The review screen asks only "did you know it?": the two answers map to grades 0 and 2.
export const ANSWERS = [{ g: 0, word: 'Bilmiyorum', note: 'Hatırlamıyorum' }, { g: 2, word: 'Biliyorum', note: 'Hatırlıyorum' }];

export function newSrs(now = Date.now()) {
  return { reps: 0, interval: 0, ease: 2.5, lapses: 0, due: now, last: null };
}

export function review(srs, grade, now = Date.now()) {
  const s = { ...newSrs(now), ...srs, last: now };
  if (grade === 0) {
    s.reps = 0;
    s.lapses += 1;
    s.interval = 0;
    s.ease = Math.max(1.3, s.ease - 0.2);
    s.due = now + 10 * 60 * 1000; // same session, 10 minutes later
    return s;
  }
  let interval;
  if (s.reps === 0) interval = grade === 3 ? 4 : 1;
  else if (s.reps === 1) interval = grade === 1 ? 2 : grade === 2 ? 3 : 6;
  else {
    const factor = grade === 1 ? 1.2 : grade === 2 ? s.ease : s.ease * 1.3;
    interval = Math.max(s.interval + 1, Math.round(s.interval * factor));
  }
  s.ease = Math.min(3.0, Math.max(1.3, s.ease + (grade === 1 ? -0.15 : grade === 3 ? 0.15 : 0)));
  s.interval = interval;
  s.reps += 1;
  s.due = startOfDay(now) + interval * DAY;
  return s;
}

// Looking a word up again means it was forgotten: bring it back to the queue.
export function relookup(srs, now = Date.now()) {
  const s = { ...newSrs(now), ...srs };
  if (s.reps > 0) {
    s.ease = Math.max(1.3, s.ease - 0.1);
    s.due = now;
  }
  return s;
}

export function isDue(srs, now = Date.now()) {
  return !srs || srs.due <= now;
}

export function status(srs) {
  if (!srs || srs.reps === 0) return 'new';
  // reps counts consecutive "Biliyorum"s — any "Bilmiyorum" resets it to 0 (see review() above).
  if (srs.reps >= 2) return 'mastered';
  return 'learning';
}

export const STATUS_LABEL = { new: 'Yeni', learning: 'Öğreniliyor', mastered: 'Öğrenildi' };
