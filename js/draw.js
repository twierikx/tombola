// Pure logic for choosing an idea and for the draw schedule. No DOM, no backend.

export function passes(idea, f = {}, me = null) {
  if (f.maxDuration && idea.duration && idea.duration > f.maxDuration) return false;
  if (f.maxCost != null && idea.cost != null && idea.cost > f.maxCost) return false;
  if (f.place === 'in' && idea.place === 'out') return false;
  if (f.place === 'out' && idea.place === 'in') return false;
  if (f.notMine && idea.authorId === me) return false;
  return true;
}

export function eligibleIdeas(ideas, filters, me) {
  return ideas.filter((i) => i.status === 'pot' && passes(i, filters, me));
}

const pickFrom = (list, rng) => list[Math.floor(rng() * list.length)];

/**
 * Choose one idea according to the circle's fairness mode.
 *  person – every person has the same chance, however many ideas they put in
 *  turns  – the person whose ideas were drawn least often goes first
 *  cap    – everyone may hold a limited number of ideas; the draw itself is uniform
 *  random – uniform over all ideas
 */
export function pickIdea({ ideas, draws = [], settings = {}, filters = {}, me = null, rng = Math.random }) {
  const pool = eligibleIdeas(ideas, filters, me);
  if (!pool.length) return null;
  const mode = settings.fairness || 'person';
  if (mode === 'random' || mode === 'cap') return pickFrom(pool, rng);

  const byAuthor = new Map();
  for (const idea of pool) {
    if (!byAuthor.has(idea.authorId)) byAuthor.set(idea.authorId, []);
    byAuthor.get(idea.authorId).push(idea);
  }
  let authors = [...byAuthor.keys()];

  if (mode === 'turns') {
    const count = new Map();
    const last = new Map();
    for (const d of draws) {
      if (d.status === 'skipped') continue;
      count.set(d.authorId, (count.get(d.authorId) || 0) + 1);
      last.set(d.authorId, Math.max(last.get(d.authorId) || 0, d.drawnAt || 0));
    }
    const min = Math.min(...authors.map((a) => count.get(a) || 0));
    authors = authors.filter((a) => (count.get(a) || 0) === min);
    const oldest = Math.min(...authors.map((a) => last.get(a) || 0));
    authors = authors.filter((a) => (last.get(a) || 0) === oldest);
  }
  return pickFrom(byAuthor.get(pickFrom(authors, rng)), rng);
}

/** First moment on schedule.weekday at schedule.hour that lies after `afterMs`. */
export function nextSlot(schedule, afterMs) {
  const d = new Date(afterMs);
  d.setHours(schedule.hour ?? 10, 0, 0, 0);
  d.setDate(d.getDate() + ((((schedule.weekday ?? 6) - d.getDay()) % 7) + 7) % 7);
  if (d.getTime() <= afterMs) d.setDate(d.getDate() + 7);
  return d.getTime();
}

/** The slot after `prevMs`, skipping any slots that already passed. */
export function advanceSlot(schedule, prevMs, nowMs) {
  const step = 7 * (schedule.everyWeeks || 1);
  const d = new Date(prevMs);
  do {
    d.setDate(d.getDate() + step);
  } while (d.getTime() <= nowMs);
  return d.getTime();
}
