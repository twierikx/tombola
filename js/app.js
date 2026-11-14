import { t, setLang, getLang, detectLang, LANGS, weekdayName, fmtDate, fmtWhen } from './i18n.js';
import { pickIdea, eligibleIdeas, nextSlot, advanceSlot } from './draw.js';

const DEMO = new URLSearchParams(location.search).has('demo');
let backend;

// ---------------------------------------------------------------- state
const S = {
  user: undefined, // undefined = not known yet, null = signed out
  route: { name: 'home' },
  circles: null,
  circle: undefined, // undefined = loading, null = gone / no access
  ideas: [], mySecrets: {}, visSecrets: {}, draws: [],
  loaded: {},
  sheet: null,
  overlay: null,
  drawUI: { open: false, filters: {}, surprise: false },
  invite: undefined,
  showDrawn: false,
  installEvt: null,
};
let unsubCircles = null;
let unsubCircle = null;
let watchedCid = null;
let knownDraws = null;
let autoBusy = false;
let redirected = false;

const COLORS = [
  ['#e0245e', '#fff'], ['#ffb703', '#1b1a3a'], ['#0fa3a3', '#fff'], ['#6c4cf1', '#fff'],
  ['#ff7a3d', '#1b1a3a'], ['#2f7df6', '#fff'], ['#2fb36d', '#1b1a3a'], ['#c13fd6', '#fff'],
];
const EMOJIS = ['🎟️', '💘', '🥂', '🌮', '🏔️', '🎲', '🪩', '🌴', '🎬', '🚲', '☕', '🐙'];
const DEFAULT_SETTINGS = {
  reveal: 'everyone', fairness: 'person', cap: 10, whoDraws: 'anyone',
  schedule: { enabled: false, everyWeeks: 1, weekday: 6, hour: 10 },
};

// ---------------------------------------------------------------- helpers
const $ = (sel, root = document) => root.querySelector(sel);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch {} },
};
const svg = (d, cls = 'icon', fill = false) =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="${fill ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="${fill ? 0 : 2}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const I = {
  ticket: '<path d="M3 9V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a3 3 0 0 0 0 6v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a3 3 0 0 0 0-6Z"/><path d="M9 4v2M9 10v4M9 18v2"/>',
  bulb: '<path d="M9 18h6M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.800 1-2.3A7 7 0 0 0 12 2Z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.870M16 3.130a4 4 0 0 1 0 7.750"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  chev: '<path d="m6 9 6 6 6-6"/>',
  back: '<path d="m15 18-6-6 6-6"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
  star: '<path d="m12 2 3.090 6.260L22 9.270l-5 4.870 1.180 6.880L12 17.770l-6.180 3.250L7 14.140 2 9.270l6.910-1.010L12 2Z"/>',
};
const icon = (name, cls) => svg(I[name], cls, name === 'star');
const LOGO = `<svg viewBox="0 0 32 32" aria-hidden="true"><g transform="rotate(-12 16 16)"><path d="M4 9a3 3 0 0 1 3-3h18a3 3 0 0 1 3 3v3.500a3.500 3.500 0 0 0 0 7V23a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-3.500a3.500 3.500 0 0 0 0-7Z" fill="var(--pink)"/><path d="M12 7v18" stroke="#fff" stroke-width="2" stroke-dasharray="2.500 2.500" opacity=".8"/><path d="m19.500 11.500 1.400 2.900 3.100.4-2.300 2.200.6 3.100-2.800-1.500-2.800 1.500.6-3.100-2.300-2.200 3.100-.4Z" fill="#fff"/></g></svg>`;
const GOOGLE = `<svg class="icon" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.500c3.540 0 6.710 1.220 9.210 3.600l6.850-6.850C35.900 2.380 30.470 0 24 0 14.620 0 6.510 5.380 2.560 13.220l7.980 6.190C12.430 13.720 17.740 9.500 24 9.500z"/><path fill="#4285F4" d="M46.980 24.550c0-1.570-.150-3.090-.380-4.550H24v9.020h12.940c-.580 2.960-2.260 5.480-4.780 7.180l7.730 6c4.510-4.180 7.090-10.360 7.090-17.650z"/><path fill="#FBBC05" d="M10.530 28.590c-.480-1.450-.760-2.990-.760-4.590s.270-3.140.760-4.590l-7.980-6.190C.920 16.460 0 20.120 0 24c0 3.880.920 7.540 2.560 10.780l7.970-6.190z"/><path fill="#34A853" d="M24 48c6.480 0 11.930-2.130 15.890-5.810l-7.730-6c-2.150 1.450-4.920 2.300-8.160 2.300-6.260 0-11.570-4.220-13.470-9.910l-7.980 6.190C6.510 42.620 14.620 48 24 48z"/></svg>`;

const me = () => S.user?.uid;
const isAdmin = () => !!S.circle?.adminIds?.includes(me());
const settings = () => ({ ...DEFAULT_SETTINGS, ...(S.circle?.settings || {}), schedule: { ...DEFAULT_SETTINGS.schedule, ...(S.circle?.settings?.schedule || {}) } });
const member = (uid) => S.circle?.members?.[uid] || { name: t('someone') };
const nameOf = (uid) => member(uid).name || t('someone');
function colorOf(uid) {
  const m = S.circle?.members?.[uid];
  let i = m?.color;
  if (i == null) i = Math.max(0, (S.circle?.memberIds || []).indexOf(uid));
  return COLORS[i % COLORS.length];
}
const cvars = (uid) => { const [c, ci] = colorOf(uid); return `--c:${c};--ci:${ci}`; };
const secretOf = (id) => S.mySecrets[id] || S.visSecrets[id] || null;
function serials() {
  const sorted = [...S.ideas].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0) || (a.id < b.id ? -1 : 1));
  const map = {};
  sorted.forEach((i, n) => { map[i.id] = i.no ?? n + 1; });
  return map;
}
const nextNo = () => Math.max(0, ...Object.values(serials())) + 1;
const pad = (n) => String(n ?? '').padStart(2, '0');
const go = (hash) => { if (location.hash === hash) onRoute(); else location.hash = hash; };

function avatar(uid, cls = '') {
  const m = member(uid);
  const inner = m.photo ? `<img src="${esc(m.photo)}" alt="" referrerpolicy="no-referrer">` : esc((m.name || '?').charAt(0).toUpperCase());
  return `<span class="avatar ${cls}" style="${cvars(uid)}" title="${esc(m.name || '')}">${inner}</span>`;
}
function userAvatar() {
  const u = S.user;
  const inner = u.photo ? `<img src="${esc(u.photo)}" alt="" referrerpolicy="no-referrer">` : esc((u.name || '?').charAt(0).toUpperCase());
  return `<span class="avatar" style="--c:var(--ink);--ci:var(--bg)">${inner}</span>`;
}

function metaBits(idea) {
  if (!idea) return '';
  const bits = [];
  if (idea.duration) bits.push(t('dur' + idea.duration));
  if (idea.cost != null) bits.push(idea.cost === 0 ? t('cost0') : '€'.repeat(idea.cost));
  if (idea.place) bits.push(t({ in: 'placeIn', out: 'placeOut', both: 'placeBoth' }[idea.place]));
  if (idea.repeat) bits.push(t('repeats'));
  return bits.map((b) => `<span>${esc(b)}</span>`).join('');
}

/** A raffle ticket. `hidden` renders it face-down in the author's colour. */
function ticket({ idea, authorId, serial, title, extra = '', hidden = false, action = '', cls = '' }) {
  const tag = action ? 'button' : 'div';
  const meta = (hidden ? '' : metaBits(idea)) + extra;
  return `<${tag} class="tk ${hidden ? 'tk-secret' : ''} ${cls}" style="${cvars(authorId)}" ${action}>
    <span class="tk-in">
      <span class="tk-stub"><small>Nº</small><b>${pad(serial)}</b></span>
      <span class="tk-body">
        <span class="tk-title">${esc(title)}</span>
        ${meta ? `<span class="tk-meta">${meta}</span>` : ''}
      </span>
    </span>
  </${tag}>`;
}

let toastTimer;
function toast(msg) {
  const root = $('#toast-root');
  root.innerHTML = `<div class="toast" role="status">${esc(msg)}</div>`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { root.innerHTML = ''; }, 2800);
}
async function run(fn, okMsg) {
  try {
    const r = await fn();
    if (okMsg) toast(okMsg);
    return r;
  } catch (err) {
    console.error('[tombola]', err);
    toast(t('error'));
    return undefined;
  }
}

// ---------------------------------------------------------------- routing & data
function parseRoute() {
  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  if (parts[0] === 'c' && parts[1]) return { name: 'circle', cid: parts[1], tab: ['draw', 'ideas', 'log', 'circle'].includes(parts[2]) ? parts[2] : 'draw' };
  if (parts[0] === 'join' && parts[1]) return { name: 'join', code: parts[1] };
  if (parts[0] === 'about') return { name: 'about' };
  return { name: 'home' };
}

function onRoute() {
  S.route = parseRoute();
  S.sheet = null;
  renderSheet();
  if (S.route.name === 'join') {
    try { sessionStorage.setItem('tombola.join', S.route.code); } catch {}
    if (S.user) loadInvite(S.route.code);
  }
  syncCircleWatch();
  render();
  window.scrollTo(0, 0);
}

function syncCircleWatch() {
  const cid = S.user && S.route.name === 'circle' ? S.route.cid : null;
  if (cid === watchedCid) return;
  if (unsubCircle) unsubCircle();
  unsubCircle = null;
  watchedCid = cid;
  S.circle = undefined; S.ideas = []; S.mySecrets = {}; S.visSecrets = {}; S.draws = []; S.loaded = {};
  S.drawUI = { open: false, filters: {}, surprise: false };
  knownDraws = null;
  if (!cid) return;
  store.set('tombola.last', cid);
  const byId = (list) => Object.fromEntries(list.map((x) => [x.id, x]));
  unsubCircle = backend.watchCircle(cid, me(), {
    circle: (c) => { S.circle = c; S.loaded.circle = true; if (c) syncProfile(); onData(); },
    ideas: (l) => { S.ideas = l; S.loaded.ideas = true; onData(); },
    mySecrets: (l) => { S.mySecrets = byId(l); onData(); },
    visibleSecrets: (l) => { S.visSecrets = byId(l); onData(); },
    draws: (l) => {
      S.draws = l.sort((a, b) => b.drawnAt - a.drawnAt);
      if (knownDraws && l.some((d) => !knownDraws.has(d.id) && d.drawnBy !== me())) toast(t('newDrawToast'));
      knownDraws = new Set(l.map((d) => d.id));
      S.loaded.draws = true;
      onData();
    },
  });
}

let renderQueued = false;
function onData() {
  if (renderQueued) return;
  renderQueued = true;
  queueMicrotask(() => {
    renderQueued = false;
    render();
    if (S.sheet?.type === 'draw') { captureForm(); renderSheet(); }
    refreshOverlay();
    checkSchedule();
  });
}

/** Keep my photo current and claim a ticket colour the first time I open a circle. */
function syncProfile() {
  const c = S.circle;
  const mine = c.members?.[me()];
  if (!c.memberIds.includes(me())) return;
  const used = new Set(c.memberIds.filter((u) => u !== me()).map((u) => c.members?.[u]?.color ?? c.memberIds.indexOf(u)));
  let color = mine?.color;
  if (color == null) { color = 0; while (used.has(color) && color < 64) color++; }
  const next = { name: mine?.name || S.user.name, photo: S.user.photo || mine?.photo || '', color };
  if (!mine || mine.color == null || mine.photo !== next.photo || !mine.name) backend.updateMember(c.id, me(), next).catch(() => {});
}

async function loadInvite(code) {
  S.invite = undefined;
  render();
  try { S.invite = await backend.getInvite(code); } catch { S.invite = null; }
  render();
}

function checkSchedule() {
  const c = S.circle;
  if (!c || autoBusy || !S.loaded.ideas || !S.loaded.draws) return;
  const sch = settings().schedule;
  if (!sch.enabled || !c.nextDrawAt || Date.now() < c.nextDrawAt) return;
  autoBusy = true;
  const next = advanceSlot(sch, c.nextDrawAt, Date.now());
  const idea = pickIdea({ ideas: S.ideas, draws: S.draws, settings: settings(), me: me() });
  const job = idea
    ? backend.commitDraw(c.id, { idea, user: S.user, surprise: settings().reveal === 'surprise', auto: true, expectNextDrawAt: c.nextDrawAt, newNextDrawAt: next })
      .then(() => toast(t('newDrawToast')))
    : backend.skipScheduledDraw(c.id, c.nextDrawAt, next);
  job.catch((e) => { if (e?.code !== 'not-due' && e?.code !== 'taken') console.error('[tombola] auto draw', e); })
    .finally(() => { setTimeout(() => { autoBusy = false; }, 1500); });
}
setInterval(checkSchedule, 30000);

// ---------------------------------------------------------------- views
function render() {
  const root = $('#app');
  const act = document.activeElement;
  const keep = act && act.id && root.contains(act) ? { id: act.id, s: act.selectionStart, e: act.selectionEnd } : null;
  const vals = {};
  root.querySelectorAll('[data-keep]').forEach((el) => { vals[el.id] = el.value; });

  root.innerHTML = view();

  for (const id in vals) { const el = document.getElementById(id); if (el) el.value = vals[id]; }
  if (keep) {
    const el = document.getElementById(keep.id);
    if (el) { el.focus({ preventScroll: true }); try { el.setSelectionRange(keep.s, keep.e); } catch {} }
  }
  document.title = S.route.name === 'circle' && S.circle ? `${S.circle.name} · Tómbola` : 'Tómbola';
}

function view() {
  if (S.user === undefined && S.route.name !== 'about') return `<div class="login"><p class="muted">${t('loading')}</p></div>`;
  if (S.route.name === 'about') return shell(viewAbout(), false);
  if (!S.user) return viewLogin();
  if (S.route.name === 'join') return shell(viewJoin(), false);
  if (S.route.name === 'circle') return viewCircle();
  return shell(viewHome(), false);
}

function langButtons() {
  return `<div class="langs" role="group" aria-label="${t('language')}">${Object.keys(LANGS).map((l) =>
    `<button data-action="lang" data-lang="${l}" aria-pressed="${l === getLang()}">${LANGS[l]}</button>`).join('')}</div>`;
}

function fan(authors) {
  const n = authors.length;
  if (!n) return `<div class="pot-empty"><div class="mini-ghost"></div></div>`;
  const spread = Math.min(64, 12 * (n - 1));
  return `<div class="pot" aria-hidden="true">${authors.map((a, i) => {
    const ang = n === 1 ? 0 : -spread / 2 + (spread * i) / (n - 1);
    const col = Array.isArray(a) ? `--c:${a[0]};--ci:${a[1]}` : cvars(a);
    return `<span class="mini" style="${col};--a:${ang.toFixed(1)}deg">?</span>`;
  }).join('')}</div>`;
}

function viewLogin() {
  const invited = S.route.name === 'join';
  return `<main class="login">
    ${fan([COLORS[2], COLORS[1], COLORS[0], COLORS[3], COLORS[4]])}
    <div class="stack">
      <h1>Tómbola</h1>
      <p class="lead">${t('tagline')}</p>
      <p class="muted">${invited ? t('invitedHint') : t('pitch')}</p>
    </div>
    <button class="btn google" data-action="signIn">${GOOGLE} ${t('signIn')}</button>
    ${S.installEvt ? `<button class="btn btn-s" data-action="install">${t('install')}</button>` : ''}
    ${langButtons()}
    <a class="linkbtn small" href="#/about">${t('about')}</a>
  </main>`;
}

function viewAbout() {
  const standalone = matchMedia('(display-mode: standalone)').matches;
  return `<article class="about stack-l">
    <p><button class="linkbtn small" data-action="back">${icon('back', 'icon-s')} ${t('back')}</button></p>
    <h1>${t('about')}</h1>
    <p class="about-lead">${t('aboutIdea')}</p>
    <p>© Anne Margot Ridderikhoff<br><span class="muted">${t('aboutRights')}</span></p>
    <section class="card stack">
      <h2>${t('aboutApp')}</h2>
      ${standalone ? `<p class="muted">${t('aboutInstalled')}</p>`
        : S.installEvt ? `<div><button class="btn btn-ink" data-action="install">${t('install')}</button></div>`
        : `<p class="muted">${t('aboutAppHint')}</p>`}
    </section>
    ${langButtons()}
  </article>`;
}

function shell(content, nav) {
  const c = S.circle;
  const tabs = [['draw', 'ticket', 'tabDraw'], ['ideas', 'bulb', 'tabIdeas'], ['log', 'clock', 'tabLog'], ['circle', 'users', 'tabCircle']];
  const header = `<header class="topbar">
      <a class="wordmark" href="#/" data-action="home" aria-label="Tómbola">${LOGO}<span class="wm-text">Tómbola</span></a>
      ${nav && c ? `<button class="circle-switch" data-action="home" title="${t('allCircles')}"><span>${esc(c.emoji || '🎟️')}</span><span class="name">${esc(c.name)}</span>${icon('chev', 'icon-s')}</button>` : ''}
      <span class="grow"></span>
      ${S.user ? `<button class="avatar-btn" data-action="menu" aria-label="${esc(S.user.name)}">${userAvatar()}</button>` : ''}
    </header>`;
  const side = nav ? `<aside class="side">${header}
      <nav class="tabs" aria-label="Tómbola">${tabs.map(([id, ic, label]) =>
        `<a class="tab" href="#/c/${esc(S.route.cid)}/${id}" ${S.route.tab === id ? 'aria-current="page"' : ''}>${icon(ic)}<span>${t(label)}</span></a>`).join('')}</nav>
      <div class="side-foot"><button class="btn btn-quiet btn-block" style="justify-content:flex-start" data-action="menu">${userAvatar()} ${esc(S.user.name)}</button></div>
    </aside>` : header;
  return `<div class="shell ${nav ? 'has-nav' : ''}">
    ${side}
    <main class="main ${nav ? '' : 'no-nav'}">
      ${backend?.demo ? `<p class="banner" style="margin-bottom:12px">${t('demoBanner')}</p>` : ''}
      ${content}
    </main>
  </div>`;
}

function viewHome() {
  if (S.circles === null) return `<p class="muted center" style="padding:48px 0">${t('loading')}</p>`;
  if (!S.circles.length) {
    return `<div class="stack-l center" style="padding:32px 0">
      ${fan([COLORS[0], COLORS[1], COLORS[2]])}
      <p class="muted" style="max-width:34ch;margin:0 auto">${t('noCircles')}</p>
      <div><button class="btn btn-ink" data-action="newCircle">${icon('plus', 'icon-s')} ${t('createFirst')}</button></div>
    </div>`;
  }
  return `<div class="section-head"><h1>${t('yourCircles')}</h1></div>
    <div class="list">
      ${S.circles.map((c) => `<button class="circle-card" data-action="openCircle" data-id="${esc(c.id)}">
        <span class="emoji">${esc(c.emoji || '🎟️')}</span>
        <span class="grow"><h2>${esc(c.name)}</h2><span class="muted small">${c.memberIds.length === 1 ? t('member1') : t('members', { n: c.memberIds.length })}</span></span>
      </button>`).join('')}
    </div>
    <div style="margin-top:18px"><button class="btn" data-action="newCircle">${icon('plus', 'icon-s')} ${t('newCircle')}</button></div>
    <p style="margin-top:40px"><a class="linkbtn small" href="#/about">${t('about')}</a></p>`;
}

function viewJoin() {
  if (S.invite === undefined) return `<p class="muted center" style="padding:48px 0">${t('loading')}</p>`;
  if (!S.invite) return `<div class="stack-l center" style="padding:48px 0"><p>${t('joinInvalid')}</p><div><a class="btn" href="#/">${t('yourCircles')}</a></div></div>`;
  return `<div class="stack-l center" style="padding:28px 0">
    <div style="font-size:3.5rem">${esc(S.invite.emoji || '🎟️')}</div>
    <h1>${t('joinTitle', { name: esc(S.invite.name) })}</h1>
    <p class="muted" style="max-width:36ch;margin:0 auto">${t('joinText')}</p>
    <div><button class="btn btn-ink" data-action="join">${t('join')}</button></div>
  </div>`;
}

function viewCircle() {
  if (S.circle === undefined) return shell(`<p class="muted center" style="padding:48px 0">${t('loading')}</p>`, false);
  if (S.circle === null) return shell(`<div class="stack-l center" style="padding:48px 0"><p>${t('noAccess')}</p><div><a class="btn" href="#/">${t('yourCircles')}</a></div></div>`, false);
  const tab = { draw: tabDraw, ideas: tabIdeas, log: tabLog, circle: tabCircle }[S.route.tab]();
  return shell(tab, true);
}

// ---- draw tab
function drawTitle(d) {
  const sec = secretOf(d.ideaId);
  if (sec) return { title: sec.title, hidden: false, sec };
  return { title: t('surpriseFrom', { name: nameOf(d.authorId) }), hidden: true, sec: null };
}

function calendarLink(title, date, note) {
  const d0 = date.replaceAll('-', '');
  const next = new Date(date + 'T12:00:00'); next.setDate(next.getDate() + 1);
  const d1 = next.toISOString().slice(0, 10).replaceAll('-', '');
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${d0}/${d1}${note ? `&details=${encodeURIComponent(note)}` : ''}`;
}

function drawnCard(d, ser) {
  const idea = S.ideas.find((i) => i.id === d.ideaId);
  const { title, hidden, sec } = drawTitle(d);
  const mine = d.authorId === me();
  const who = mine ? t('ideaByYou') : t('ideaBy', { name: esc(nameOf(d.authorId)) });
  let hint = '';
  if (d.surprise && !d.revealed) hint = mine ? t('surpriseYours') : t('surpriseWait', { name: esc(nameOf(d.authorId)) });
  return `<article class="drawn-card">
    ${ticket({ idea, authorId: d.authorId, serial: ser[d.ideaId], title, hidden })}
    <div class="row-wrap small muted">
      ${avatar(d.authorId, 'avatar-s')} <span>${who}</span>
      <span>${d.auto ? t('drawnAuto') : t('drawnBy', { name: esc(d.drawnBy === me() ? t('you') : nameOf(d.drawnBy)) })}, ${fmtDate(d.drawnAt, false)}</span>
    </div>
    ${hint ? `<p class="banner">${hint}</p>` : ''}
    ${sec?.note ? `<p class="small">${esc(sec.note)}</p>` : ''}
    ${sec?.link ? `<p class="small"><a href="${esc(sec.link)}" target="_blank" rel="noopener noreferrer">${esc(sec.link.replace(/^https?:\/\//, '').slice(0, 48))}</a></p>` : ''}
    <div class="when">
      <label class="label" for="plan-${esc(d.id)}">${t('planFor')}</label>
      <input class="input" type="date" id="plan-${esc(d.id)}" data-change="plan" data-id="${esc(d.id)}" value="${esc(d.plannedFor || '')}">
      ${d.plannedFor && !hidden ? `<a class="linkbtn small" href="${calendarLink(title, d.plannedFor, sec?.note)}" target="_blank" rel="noopener noreferrer">${t('toCalendar')}</a>` : ''}
    </div>
    <div class="actions">
      <button class="btn btn-ink btn-s" data-action="done" data-id="${esc(d.id)}">${t('markDone')}</button>
      ${d.surprise && !d.revealed && mine ? `<button class="btn btn-s" data-action="reveal" data-id="${esc(d.id)}">${t('reveal')}</button>` : ''}
      <button class="btn btn-quiet btn-s" data-action="putBack" data-id="${esc(d.id)}">${t('backInPot')}</button>
    </div>
  </article>`;
}

function chipRow(group, options, current) {
  return `<div class="chips" role="group">${options.map(([val, label]) =>
    `<button type="button" class="chip" data-action="chip" data-group="${group}" data-val="${esc(val)}" aria-pressed="${String(current) === String(val)}">${esc(label)}</button>`).join('')}</div>`;
}

function tabDraw() {
  const st = settings();
  const ser = serials();
  const pot = S.ideas.filter((i) => i.status === 'pot');
  const open = S.draws.filter((d) => d.status === 'open');
  const canDraw = st.whoDraws === 'anyone' || isAdmin();
  const f = S.drawUI.filters;
  const hasFilter = Object.values(f).some((v) => v != null && v !== false && v !== '');
  const match = eligibleIdeas(S.ideas, f, me()).length;
  const counts = {};
  pot.forEach((i) => { counts[i.authorId] = (counts[i.authorId] || 0) + 1; });
  const sample = [...pot].sort((a, b) => (a.id < b.id ? -1 : 1)).slice(0, 11).map((i) => i.authorId);

  let filters = '';
  if (S.drawUI.open) {
    filters = `<div class="filters card">
      <div class="field"><span class="label">${t('maxDuration')}</span>${chipRow('f.maxDuration', [['', t('any')], [1, t('dur1')], [2, t('dur2')], [3, t('dur3')]], f.maxDuration ?? '')}</div>
      <div class="field"><span class="label">${t('maxCost')}</span>${chipRow('f.maxCost', [['', t('any')], [0, t('cost0')], [1, '€'], [2, '€€']], f.maxCost ?? '')}</div>
      <div class="field"><span class="label">${t('fPlace')}</span>${chipRow('f.place', [['', t('any')], ['in', t('placeIn')], ['out', t('placeOut')]], f.place ?? '')}</div>
      <label class="switch"><input type="checkbox" data-change="f.notMine" ${f.notMine ? 'checked' : ''}><span class="track"></span><span><b>${t('notMine')}</b></span></label>
      <p class="small muted">${match ? t('filterMatch', { n: match, total: pot.length }) : t('filterNone')}</p>
    </div>`;
  }

  const hero = !pot.length
    ? `<section class="draw-hero">
        ${fan([])}
        <h2>${t('potEmpty')}</h2>
        <p class="muted" style="max-width:32ch">${t('potEmptyHint')}</p>
        <a class="btn btn-ink" href="#/c/${esc(S.route.cid)}/ideas">${icon('plus', 'icon-s')} ${t('addIdeas')}</a>
      </section>`
    : `<section class="draw-hero">
        ${fan(sample)}
        <h2>${pot.length === 1 ? t('potCount1') : t('potCount', { n: pot.length })}</h2>
        <div class="legend">${S.circle.memberIds.map((u) => `<span><i class="dot-c" style="${cvars(u)}"></i>${esc(nameOf(u))} ${counts[u] || 0}</span>`).join('')}</div>
        ${canDraw
          ? `<button class="btn btn-draw" data-action="draw" ${match ? '' : 'disabled'}>${t('drawBtn')}</button>
             ${st.reveal === 'choose' ? `<label class="switch" style="text-align:left"><input type="checkbox" data-change="surprise" ${S.drawUI.surprise ? 'checked' : ''}><span class="track"></span><span><b>${t('asSurprise')}</b><span class="small muted">${t('asSurpriseHint')}</span></span></label>` : ''}
             <button class="linkbtn" data-action="toggleFilters" aria-expanded="${S.drawUI.open}">${t('filterDraw')}${hasFilter && !S.drawUI.open ? ` (${match})` : ''}</button>
             ${filters}`
          : `<p class="banner">${t('drawAdminsOnly')}</p>`}
        ${st.schedule.enabled && S.circle.nextDrawAt ? `<p class="small muted">${t('nextAuto', { when: fmtWhen(S.circle.nextDrawAt) })}</p>` : ''}
      </section>`;

  return `${open.length ? `<div class="section-head"><h2>${t('upNext')}</h2></div><div class="list">${open.map((d) => drawnCard(d, ser)).join('')}</div>` : ''}
    ${hero}`;
}

// ---- ideas tab
function tabIdeas() {
  const st = settings();
  const ser = serials();
  const mine = S.ideas.filter((i) => i.authorId === me()).sort((a, b) => b.createdAt - a.createdAt);
  const inPot = mine.filter((i) => i.status === 'pot');
  const gone = mine.filter((i) => i.status !== 'pot');
  const others = S.ideas.filter((i) => i.authorId !== me() && i.status === 'pot' && S.visSecrets[i.id]);
  const capOn = st.fairness === 'cap';
  const full = capOn && inPot.length >= st.cap;
  const row = (i, opts = {}) => {
    const sec = secretOf(i.id);
    const extra = sec?.visible && i.status === 'pot' ? `<span class="pill">${t('open')}</span>` : '';
    return ticket({ idea: i, authorId: i.authorId, serial: ser[i.id], title: sec?.title || '…', extra, ...opts });
  };
  return `<form class="quick" data-submit="quickAdd" style="margin-top:8px">
      <input class="input" id="quick-title" data-keep maxlength="120" autocomplete="off" placeholder="${t('quickAddPh')}" aria-label="${t('quickAddPh')}" ${full ? 'disabled' : ''}>
      <button class="btn btn-ink" ${full ? 'disabled' : ''}>${t('inThePot')}</button>
    </form>
    <div class="row" style="justify-content:space-between;margin-top:8px">
      <button class="linkbtn small" data-action="newIdea" ${full ? 'disabled' : ''}>${t('moreOptions')}</button>
      ${capOn ? `<span class="small muted">${t('capInfo', { n: inPot.length, cap: st.cap })}</span>` : ''}
    </div>
    ${full ? `<p class="banner" style="margin-top:10px">${t('capFull', { cap: st.cap })}</p>` : ''}

    <div class="section-head"><h2>${t('myIdeasInPot')}</h2></div>
    <p class="small muted row" style="gap:6px;margin:-4px 0 12px">${icon('lock', 'icon-s')} ${t('secretHint')}</p>
    ${inPot.length
      ? `<div class="list">${inPot.map((i) => row(i, { action: `data-action="editIdea" data-id="${esc(i.id)}"` })).join('')}</div>`
      : `<p class="empty">${t('noIdeasYet')}</p>`}

    ${others.length ? `<div class="section-head"><h2>${t('openIdeas')}</h2></div><div class="list">${others.map((i) => row(i)).join('')}</div>` : ''}

    ${gone.length ? `<div class="section-head"><h2>${t('drawnIdeas')}</h2><button class="linkbtn small" data-action="toggleDrawn">${gone.length} ${icon('chev', 'icon-s')}</button></div>
      ${S.showDrawn ? `<div class="list">${gone.map((i) => row(i, { cls: i.status === 'done' ? 'tk-done' : '' })).join('')}</div>` : ''}` : ''}`;
}

// ---- log tab
function avgRating(d) {
  const v = Object.values(d.ratings || {}).filter(Boolean);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
}
function tabLog() {
  const ser = serials();
  if (!S.draws.length) return `<div class="section-head"><h1>${t('tabLog')}</h1></div><p class="empty">${t('logEmpty')}</p>`;
  const done = S.draws.filter((d) => d.status === 'done');
  const per = {};
  S.draws.filter((d) => d.status !== 'skipped').forEach((d) => { per[d.authorId] = (per[d.authorId] || 0) + 1; });
  return `<div class="section-head"><h1>${t('tabLog')}</h1></div>
    <div class="legend" style="justify-content:flex-start;margin-bottom:16px">
      <span><b>${t('doneCount', { n: done.length })}</b></span>
      ${Object.keys(per).map((u) => `<span><i class="dot-c" style="${cvars(u)}"></i>${t('drawnCountOf', { name: esc(nameOf(u)), n: per[u] })}</span>`).join('')}
    </div>
    <div class="list">${S.draws.map((d) => {
      const { title, hidden } = drawTitle(d);
      const idea = S.ideas.find((i) => i.id === d.ideaId);
      const avg = avgRating(d);
      const pill = d.status === 'done' ? `<span class="pill pill-ok">${t('stDone')}</span>` : d.status === 'open' ? `<span class="pill pill-open">${t('stOpen')}</span>` : `<span class="pill">${t('stSkipped')}</span>`;
      const extra = `<span>${fmtDate(d.doneAt || d.drawnAt)}</span>${pill}${avg ? `<span class="stars-ro">${icon('star')} ${avg.toFixed(1).replace('.0', '')}</span>` : ''}`;
      return ticket({ idea: null, authorId: d.authorId, serial: ser[d.ideaId], title, hidden, extra, action: `data-action="openDraw" data-id="${esc(d.id)}"` });
    }).join('')}</div>`;
}

// ---- circle tab
function option(group, val, label, desc, current, disabled) {
  return `<button type="button" class="option" role="radio" aria-checked="${current === val}" data-action="setting" data-group="${group}" data-val="${val}" ${disabled ? 'disabled' : ''}>
    <span class="dot"></span><span><b>${label}</b>${desc ? `<span class="small muted">${desc}</span>` : ''}</span></button>`;
}

function tabCircle() {
  const c = S.circle;
  const st = settings();
  const admin = isAdmin();
  const dis = !admin;
  const link = `${location.origin}${location.pathname}#/join/${c.inviteCode}`;
  const inPot = {}; const drawn = {};
  S.ideas.forEach((i) => { if (i.status === 'pot') inPot[i.authorId] = (inPot[i.authorId] || 0) + 1; });
  S.draws.forEach((d) => { if (d.status !== 'skipped') drawn[d.authorId] = (drawn[d.authorId] || 0) + 1; });
  const sch = st.schedule;

  return `<div class="section-head"><h1>${esc(c.emoji || '')} ${esc(c.name)}</h1>${admin ? `<button class="linkbtn small" data-action="renameCircle">${t('rename')}</button>` : ''}</div>

    <section class="card stack">
      <h2>${t('invite')}</h2>
      <p class="small muted">${t('inviteHint')}</p>
      <div class="invite-link">
        <input class="input" readonly value="${esc(link)}" id="invite-link" aria-label="${t('invite')}">
        <button class="btn btn-ink" data-action="copyLink">${t('copyLink')}</button>
      </div>
      <div class="row-wrap">
        ${navigator.share ? `<button class="btn btn-s" data-action="shareLink">${t('share')}</button>` : ''}
        ${admin ? `<button class="linkbtn small" data-action="newLink">${t('newLink')}</button>` : ''}
      </div>
    </section>

    <div class="section-head"><h2>${t('membersTitle')}</h2></div>
    <section class="card">
      ${c.memberIds.map((u) => `<div class="member">
        ${avatar(u, 'ring')}
        <div class="grow">
          <div class="name">${esc(nameOf(u))}${u === me() ? ` <span class="muted">(${t('you')})</span>` : ''} ${c.adminIds.includes(u) ? `<span class="pill">${t('admin')}</span>` : ''}</div>
          <div class="small muted">${t('inPotN', { n: inPot[u] || 0 })}, ${t('drawnN', { n: drawn[u] || 0 })}</div>
        </div>
        ${u === me() ? `<button class="linkbtn small" data-action="editName">${t('edit')}</button>`
          : admin ? `<button class="iconbtn" data-action="memberMenu" data-id="${esc(u)}" aria-label="${esc(nameOf(u))}">${icon('chev')}</button>` : ''}
      </div>`).join('')}
    </section>

    <div class="section-head"><h2>${t('settings')}</h2></div>
    ${dis ? `<p class="banner" style="margin-bottom:12px">${t('settingsAdminOnly')}</p>` : ''}
    <div class="stack-l">
      <section class="stack" role="radiogroup" aria-label="${t('setFair')}">
        <h3>${t('setFair')}</h3>
        ${option('fairness', 'person', t('fairPerson'), t('fairPersonD'), st.fairness, dis)}
        ${option('fairness', 'turns', t('fairTurns'), t('fairTurnsD'), st.fairness, dis)}
        ${option('fairness', 'cap', t('fairCap'), t('fairCapD'), st.fairness, dis)}
        ${st.fairness === 'cap' ? `<div class="field"><label for="cap">${t('fairCapN')}</label>
          <select class="select" id="cap" data-change="cap" ${dis ? 'disabled' : ''}>${[3, 5, 10, 15, 20, 30].map((n) => `<option ${n === st.cap ? 'selected' : ''}>${n}</option>`).join('')}</select></div>` : ''}
        ${option('fairness', 'random', t('fairRandom'), t('fairRandomD'), st.fairness, dis)}
      </section>

      <section class="stack" role="radiogroup" aria-label="${t('setReveal')}">
        <h3>${t('setReveal')}</h3>
        ${option('reveal', 'everyone', t('revEveryone'), t('revEveryoneD'), st.reveal, dis)}
        ${option('reveal', 'surprise', t('revSurprise'), t('revSurpriseD'), st.reveal, dis)}
        ${option('reveal', 'choose', t('revChoose'), t('revChooseD'), st.reveal, dis)}
      </section>

      <section class="stack" role="radiogroup" aria-label="${t('setWho')}">
        <h3>${t('setWho')}</h3>
        ${option('whoDraws', 'anyone', t('whoAnyone'), '', st.whoDraws, dis)}
        ${option('whoDraws', 'admins', t('whoAdmins'), '', st.whoDraws, dis)}
      </section>

      <section class="stack">
        <h3>${t('setSchedule')}</h3>
        <label class="switch"><input type="checkbox" data-change="sched.enabled" ${sch.enabled ? 'checked' : ''} ${dis ? 'disabled' : ''}><span class="track"></span><span><b>${t('schedOn')}</b><span class="small muted">${t('schedHint')}</span></span></label>
        ${sch.enabled ? `<div class="row-wrap">
          <select class="select" style="width:auto" data-change="sched.everyWeeks" aria-label="${t('setSchedule')}" ${dis ? 'disabled' : ''}>${[1, 2, 4].map((n) => `<option value="${n}" ${n === sch.everyWeeks ? 'selected' : ''}>${t('every' + n)}</option>`).join('')}</select>
          <select class="select" style="width:auto" data-change="sched.weekday" aria-label="${t('schedDay')}" ${dis ? 'disabled' : ''}>${[1, 2, 3, 4, 5, 6, 0].map((n) => `<option value="${n}" ${n === sch.weekday ? 'selected' : ''}>${weekdayName(n)}</option>`).join('')}</select>
          <select class="select" style="width:auto" data-change="sched.hour" aria-label="${t('schedHour')}" ${dis ? 'disabled' : ''}>${Array.from({ length: 24 }, (_, n) => `<option value="${n}" ${n === sch.hour ? 'selected' : ''}>${pad(n)}:00</option>`).join('')}</select>
        </div>
        ${c.nextDrawAt ? `<p class="small muted">${t('nextAuto', { when: fmtWhen(c.nextDrawAt) })}</p>` : ''}` : ''}
      </section>

      <section class="row-wrap" style="border-top:1px solid var(--line);padding-top:18px">
        <button class="btn btn-s" data-action="leave">${t('leave')}</button>
        ${admin ? `<button class="btn btn-s btn-danger" data-action="deleteCircle">${t('deleteCircle')}</button>` : ''}
      </section>
    </div>`;
}

// ---------------------------------------------------------------- sheets
function openSheet(sheet) { S.sheet = sheet; renderSheet(); }
function closeSheet() { S.sheet = null; renderSheet(); }

function captureForm() {
  if (!S.sheet?.form) return;
  document.querySelectorAll('#sheet-root [data-field]').forEach((el) => {
    S.sheet.form[el.dataset.field] = el.type === 'checkbox' ? el.checked : el.value;
  });
}

function renderSheet() {
  const root = $('#sheet-root');
  if (!S.sheet) { root.innerHTML = ''; document.body.style.overflow = S.overlay ? 'hidden' : ''; return; }
  const old = $('.sheet', root);
  const scroll = old?.scrollTop || 0;
  root.innerHTML = `<div class="scrim ${old ? 'no-anim' : ''}" data-action="scrim"><div class="sheet" role="dialog" aria-modal="true">${sheetBody(S.sheet)}</div></div>`;
  const sheet = $('.sheet', root);
  sheet.scrollTop = scroll;
  document.body.style.overflow = 'hidden';
  if (S.sheet.focus) { S.sheet.focus = false; $('[data-autofocus]', root)?.focus(); }
}

const sheetHead = (title) => `<div class="sheet-head"><h2>${title}</h2><button class="iconbtn" data-action="closeSheet" aria-label="${t('close')}">${icon('x')}</button></div>`;

function sheetBody(sh) {
  const f = sh.form || {};
  if (sh.type === 'idea') {
    return `${sheetHead(sh.id ? t('editIdea') : t('newIdea'))}
      <form class="stack-l" data-submit="saveIdea">
        <div class="field"><label for="f-title">${t('fTitle')}</label><input class="input" id="f-title" data-field="title" data-autofocus maxlength="120" required value="${esc(f.title)}" placeholder="${t('quickAddPh')}"></div>
        <div class="field"><span class="label">${t('fDuration')}</span>${chipRow('duration', [[1, t('dur1')], [2, t('dur2')], [3, t('dur3')], [4, t('dur4')]], f.duration ?? '')}</div>
        <div class="field"><span class="label">${t('fCost')}</span>${chipRow('cost', [[0, t('cost0')], [1, '€'], [2, '€€'], [3, '€€€']], f.cost ?? '')}</div>
        <div class="field"><span class="label">${t('fPlace')}</span>${chipRow('place', [['in', t('placeIn')], ['out', t('placeOut')], ['both', t('placeBoth')]], f.place ?? '')}</div>
        <div class="field"><label for="f-note">${t('fNote')}</label><textarea class="textarea" id="f-note" data-field="note" maxlength="1000" placeholder="${t('fNotePh')}">${esc(f.note)}</textarea></div>
        <div class="field"><label for="f-link">${t('fLink')}</label><input class="input" id="f-link" data-field="link" type="url" inputmode="url" maxlength="500" placeholder="https://" value="${esc(f.link)}"></div>
        <label class="switch"><input type="checkbox" data-field="repeat" ${f.repeat ? 'checked' : ''}><span class="track"></span><span><b>${t('fRepeat')}</b><span class="small muted">${t('fRepeatHint')}</span></span></label>
        <label class="switch"><input type="checkbox" data-field="visible" ${f.visible ? 'checked' : ''}><span class="track"></span><span><b>${t('fOpen')}</b><span class="small muted">${t('fOpenHint')}</span></span></label>
        <div class="sheet-foot" style="margin-top:0">
          ${sh.id ? `<button type="button" class="btn btn-danger" style="flex:0 0 auto" data-action="askDeleteIdea">${t('delete')}</button>` : ''}
          <button class="btn btn-ink">${sh.id ? t('save') : t('inThePot')}</button>
        </div>
      </form>`;
  }
  if (sh.type === 'circle') {
    return `${sheetHead(sh.id ? t('rename') : t('newCircle'))}
      <form class="stack-l" data-submit="saveCircle">
        <div class="field"><label for="f-name">${t('circleName')}</label><input class="input" id="f-name" data-field="name" data-autofocus maxlength="40" required value="${esc(f.name)}" placeholder="${t('circleNamePh')}"></div>
        <div class="field"><span class="label">${t('icon')}</span><div class="emoji-grid">${EMOJIS.map((e) => `<button type="button" data-action="chip" data-group="emoji" data-val="${e}" aria-pressed="${f.emoji === e}">${e}</button>`).join('')}</div></div>
        <div class="sheet-foot" style="margin-top:0"><button class="btn btn-ink">${sh.id ? t('save') : t('createCircle')}</button></div>
      </form>`;
  }
  if (sh.type === 'name') {
    return `${sheetHead(t('yourName'))}
      <form class="stack-l" data-submit="saveName">
        <input class="input" data-field="name" data-autofocus maxlength="30" required value="${esc(f.name)}" aria-label="${t('yourName')}">
        <div class="sheet-foot" style="margin-top:0"><button class="btn btn-ink">${t('save')}</button></div>
      </form>`;
  }
  if (sh.type === 'confirm') {
    return `${sheetHead('')}
      <p style="font-size:1.0625rem">${esc(sh.text)}</p>
      <div class="sheet-foot"><button class="btn" data-action="closeSheet">${t('cancel')}</button><button class="btn btn-ink" data-action="confirmYes">${esc(sh.label)}</button></div>`;
  }
  if (sh.type === 'menu') {
    return `${sheetHead(esc(S.user.name))}
      <div class="stack-l">
        <div class="field"><span class="label">${t('language')}</span>${langButtons()}</div>
        ${S.installEvt ? `<button class="btn btn-ink" data-action="install">${t('install')}</button>` : ''}
        <a class="btn" href="#/about">${t('about')}</a>
        <button class="btn" data-action="signOut">${t('signOut')}</button>
      </div>`;
  }
  if (sh.type === 'member') {
    const u = sh.uid;
    const adm = S.circle.adminIds.includes(u);
    return `${sheetHead(esc(nameOf(u)))}
      <div class="stack">
        <button class="btn" data-action="toggleAdmin" data-id="${esc(u)}">${adm ? t('removeAdmin') : t('makeAdmin')}</button>
        <button class="btn btn-danger" data-action="askRemoveMember" data-id="${esc(u)}">${t('removeMember')}</button>
      </div>`;
  }
  if (sh.type === 'draw') {
    const d = S.draws.find((x) => x.id === sh.id);
    if (!d) return sheetHead('');
    const ser = serials();
    const idea = S.ideas.find((i) => i.id === d.ideaId);
    const { title, hidden, sec } = drawTitle(d);
    const my = d.ratings?.[me()] || 0;
    const others = Object.entries(d.ratings || {}).filter(([u, v]) => u !== me() && v);
    return `${sheetHead(fmtDate(d.doneAt || d.drawnAt))}
      <div class="stack-l">
        ${ticket({ idea, authorId: d.authorId, serial: ser[d.ideaId], title, hidden })}
        <div class="row-wrap small muted">${avatar(d.authorId, 'avatar-s')}
          <span>${d.authorId === me() ? t('ideaByYou') : t('ideaBy', { name: esc(nameOf(d.authorId)) })}</span>
          <span>${d.auto ? t('drawnAuto') : t('drawnBy', { name: esc(d.drawnBy === me() ? t('you') : nameOf(d.drawnBy)) })}</span>
        </div>
        ${sec?.note ? `<p class="small">${esc(sec.note)}</p>` : ''}
        ${sec?.link ? `<p class="small"><a href="${esc(sec.link)}" target="_blank" rel="noopener noreferrer">${esc(sec.link.replace(/^https?:\/\//, '').slice(0, 48))}</a></p>` : ''}
        ${d.status === 'done' ? `
          <div class="field"><span class="label">${t('yourRating')}</span>
            <div class="stars">${[1, 2, 3, 4, 5].map((n) => `<button type="button" data-action="rate" data-id="${esc(d.id)}" data-val="${n}" aria-pressed="${n <= my}" aria-label="${n}">${icon('star')}</button>`).join('')}</div>
            ${others.length ? `<div class="row-wrap small muted">${others.map(([u, v]) => `<span class="stars-ro">${esc(nameOf(u))} ${icon('star')} ${v}</span>`).join('')}</div>` : ''}
          </div>
          <form class="stack" data-submit="saveLogNote">
            <div class="field"><label for="f-lognote">${t('logNote')}</label><textarea class="textarea" id="f-lognote" data-field="note" maxlength="1000" placeholder="${t('logNotePh')}">${esc(f.note)}</textarea></div>
            <div><button class="btn btn-ink btn-s">${t('save')}</button></div>
          </form>` : ''}
        ${d.status === 'open' ? `<div class="row-wrap">
            <button class="btn btn-ink btn-s" data-action="done" data-id="${esc(d.id)}">${t('markDone')}</button>
            <button class="btn btn-quiet btn-s" data-action="putBack" data-id="${esc(d.id)}">${t('backInPot')}</button>
          </div>` : ''}
        ${d.status === 'skipped' ? `<p><span class="pill">${t('stSkipped')}</span></p>` : ''}
      </div>`;
  }
  return '';
}

// ---------------------------------------------------------------- the draw
function renderOverlay() {
  const root = $('#overlay-root');
  const o = S.overlay;
  if (!o) { root.innerHTML = ''; document.body.style.overflow = S.sheet ? 'hidden' : ''; return; }
  document.body.style.overflow = 'hidden';
  root.innerHTML = `<div class="stage" role="dialog" aria-modal="true" aria-live="polite">
    <p class="stage-caption" id="stage-caption">${t('drawing')}</p>
    <div class="deck" id="deck" style="${cvars(o.authorId)}">
      <span class="ghost"></span><span class="ghost"></span><span class="ghost"></span>
      <div class="flip">
        <div class="face face-back">?</div>
        <div class="face face-front" id="face-front"></div>
      </div>
    </div>
    <div class="stage-actions" id="stage-actions"></div>
  </div>`;
}

function frontFace() {
  const o = S.overlay;
  const idea = S.ideas.find((i) => i.id === o.ideaId) || o.idea;
  const sec = secretOf(o.ideaId);
  const mine = o.authorId === me();
  const ser = serials();
  const head = `<div class="top"><span>${esc(mine ? t('ideaByYou') : t('ideaBy', { name: nameOf(o.authorId) }))}</span><span><small>Nº</small> <b>${pad(ser[o.ideaId])}</b></span></div>`;
  if (o.surprise && !mine) {
    return `${head}<div class="mid"><h2>${esc(t('surpriseFrom', { name: nameOf(o.authorId) }))}</h2><p>${esc(t('surpriseWait', { name: nameOf(o.authorId) }))}</p></div>`;
  }
  return `${head}<div class="mid">
    <h2>${esc(sec?.title || '…')}</h2>
    ${metaBits(idea) ? `<div class="tk-meta">${metaBits(idea)}</div>` : ''}
    ${sec?.note ? `<p>${esc(sec.note)}</p>` : ''}
    ${o.surprise && mine ? `<p>${esc(t('surpriseYours'))}</p>` : ''}
  </div>`;
}

function refreshOverlay() {
  if (S.overlay?.stage !== 'reveal') return;
  const el = $('#face-front');
  if (el) el.innerHTML = frontFace();
}

async function doDraw() {
  if (S.overlay) return;
  const c = S.circle;
  const st = settings();
  const idea = pickIdea({ ideas: S.ideas, draws: S.draws, settings: st, filters: S.drawUI.filters, me: me() });
  if (!idea) return toast(t('filterNone'));
  const surprise = st.reveal === 'surprise' || (st.reveal === 'choose' && S.drawUI.surprise);
  S.overlay = { stage: 'shuffle', ideaId: idea.id, idea, authorId: idea.authorId, surprise };
  renderOverlay();
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  try {
    const [drawId] = await Promise.all([
      backend.commitDraw(c.id, { idea, user: S.user, surprise, auto: false }),
      wait(reduce ? 200 : 1900),
    ]);
    if (!S.overlay) return;
    S.overlay.stage = 'reveal';
    S.overlay.drawId = drawId;
    $('#face-front').innerHTML = frontFace();
    $('#deck').classList.add('is-revealed');
    $('#stage-caption').textContent = '';
    $('#stage-actions').innerHTML = `<button class="btn btn-ink" data-action="closeOverlay" id="stage-ok">${t('great')}</button>
      <button class="linkbtn" data-action="redraw">${t('drawAgain')}</button>`;
    $('#stage-ok').focus();
  } catch (err) {
    console.error('[tombola] draw', err);
    S.overlay = null;
    renderOverlay();
    toast(err?.code === 'taken' ? t('takenMeanwhile') : t('error'));
  }
}

async function finish(drawId, status) {
  const d = S.draws.find((x) => x.id === drawId);
  if (!d) return;
  const idea = S.ideas.find((i) => i.id === d.ideaId);
  const ideaStatus = !idea ? null : status === 'skipped' ? 'pot' : idea.repeat ? 'pot' : 'done';
  await run(() => backend.finishDraw(S.circle.id, d, status, ideaStatus));
}

// ---------------------------------------------------------------- actions
function ideaForm(idea, sec) {
  return {
    title: sec?.title || '', note: sec?.note || '', link: sec?.link || '', visible: !!sec?.visible,
    duration: idea?.duration ?? null, cost: idea?.cost ?? null, place: idea?.place ?? null, repeat: !!idea?.repeat,
  };
}
function capFull() {
  const st = settings();
  return st.fairness === 'cap' && S.ideas.filter((i) => i.authorId === me() && i.status === 'pot').length >= st.cap;
}
function saveSettings(patch) {
  const st = settings();
  const next = { ...st, ...patch, schedule: { ...st.schedule, ...(patch.schedule || {}) } };
  const upd = { settings: next };
  if (patch.schedule) upd.nextDrawAt = next.schedule.enabled ? nextSlot(next.schedule, Date.now()) : null;
  return run(() => backend.updateCircle(S.circle.id, upd));
}

const actions = {
  signIn: async () => {
    try { await backend.signIn(); } catch (err) {
      console.error('[tombola] sign-in', err);
      if (!['auth/popup-closed-by-user', 'auth/cancelled-popup-request'].includes(err?.code)) toast(`${t('signInFailed')}${err?.code ? ` (${err.code})` : ''}`);
    }
  },
  signOut: async () => { closeSheet(); await backend.signOut(); },
  lang: (el) => { setLang(el.dataset.lang); store.set('tombola.lang', el.dataset.lang); render(); renderSheet(); },
  menu: () => openSheet({ type: 'menu' }),
  back: () => { if (history.length > 1) history.back(); else go('#/'); },
  install: async () => {
    const ev = S.installEvt;
    if (!ev) return;
    S.installEvt = null;
    ev.prompt();
    await ev.userChoice.catch(() => {});
    render(); renderSheet();
  },
  home: (el, ev) => { ev.preventDefault(); redirected = true; go('#/'); },
  openCircle: (el) => go(`#/c/${el.dataset.id}/draw`),
  scrim: (el, ev) => { if (ev.target === el) closeSheet(); },
  closeSheet,

  newCircle: () => openSheet({ type: 'circle', form: { name: '', emoji: EMOJIS[0] }, focus: true }),
  renameCircle: () => openSheet({ type: 'circle', id: S.circle.id, form: { name: S.circle.name, emoji: S.circle.emoji || EMOJIS[0] } }),
  join: async () => {
    const cid = await run(() => backend.joinCircle(S.route.code, S.user));
    try { sessionStorage.removeItem('tombola.join'); } catch {}
    if (cid) go(`#/c/${cid}/ideas`);
  },

  chip: (el) => {
    const { group, val } = el.dataset;
    if (group.startsWith('f.')) {
      const key = group.slice(2);
      S.drawUI.filters[key] = val === '' ? null : key === 'place' ? val : Number(val);
      return render();
    }
    captureForm();
    const cur = S.sheet.form[group];
    const v = ['duration', 'cost'].includes(group) ? Number(val) : val;
    S.sheet.form[group] = group !== 'emoji' && String(cur) === String(v) ? null : v;
    renderSheet();
  },

  // ideas
  newIdea: () => openSheet({ type: 'idea', form: ideaForm(), focus: true }),
  editIdea: (el) => {
    const idea = S.ideas.find((i) => i.id === el.dataset.id);
    if (idea) openSheet({ type: 'idea', id: idea.id, form: ideaForm(idea, secretOf(idea.id)) });
  },
  askDeleteIdea: () => {
    const id = S.sheet.id;
    openSheet({ type: 'confirm', text: t('deleteIdeaConfirm'), label: t('delete'), yes: () => run(() => backend.deleteIdea(S.circle.id, id), t('removed')) });
  },
  toggleDrawn: () => { S.showDrawn = !S.showDrawn; render(); },

  // draw
  toggleFilters: () => { S.drawUI.open = !S.drawUI.open; render(); },
  draw: () => doDraw(),
  closeOverlay: () => { S.overlay = null; renderOverlay(); },
  redraw: async () => {
    const id = S.overlay?.drawId;
    S.overlay = null; renderOverlay();
    if (id) { await finish(id, 'skipped'); await wait(150); doDraw(); }
  },
  done: async (el) => {
    const id = el.dataset.id;
    await finish(id, 'done');
    const d = S.draws.find((x) => x.id === id);
    openSheet({ type: 'draw', id, form: { note: d?.note || '' } });
  },
  putBack: async (el) => { closeSheet(); await finish(el.dataset.id, 'skipped'); toast(t('putBack')); },
  reveal: (el) => {
    const d = S.draws.find((x) => x.id === el.dataset.id);
    if (d) run(() => backend.revealDraw(S.circle.id, d), t('revealed'));
  },
  openDraw: (el) => {
    const d = S.draws.find((x) => x.id === el.dataset.id);
    if (d) openSheet({ type: 'draw', id: d.id, form: { note: d.note || '' } });
  },
  rate: async (el) => {
    captureForm();
    const d = S.draws.find((x) => x.id === el.dataset.id);
    const v = Number(el.dataset.val);
    d.ratings = { ...(d.ratings || {}), [me()]: v };
    renderSheet();
    await run(() => backend.updateDraw(S.circle.id, d.id, { [`ratings.${me()}`]: v }));
  },

  // circle
  copyLink: async () => {
    const input = $('#invite-link');
    try { await navigator.clipboard.writeText(input.value); } catch { input.select(); document.execCommand('copy'); }
    toast(t('copied'));
  },
  shareLink: () => navigator.share({ title: 'Tómbola', text: t('shareText', { name: S.circle.name }), url: $('#invite-link').value }).catch(() => {}),
  newLink: () => openSheet({ type: 'confirm', text: t('newLinkConfirm'), label: t('newLink'), yes: () => run(() => backend.regenerateInvite(S.circle.id, S.circle), t('saved')) }),
  setting: (el) => saveSettings({ [el.dataset.group]: el.dataset.val }),
  editName: () => openSheet({ type: 'name', form: { name: nameOf(me()) }, focus: true }),
  memberMenu: (el) => openSheet({ type: 'member', uid: el.dataset.id }),
  toggleAdmin: (el) => {
    const u = el.dataset.id;
    closeSheet();
    run(() => backend.setAdmin(S.circle.id, u, !S.circle.adminIds.includes(u)), t('saved'));
  },
  askRemoveMember: (el) => {
    const u = el.dataset.id;
    const ids = S.ideas.filter((i) => i.authorId === u && i.status === 'pot').map((i) => i.id);
    openSheet({ type: 'confirm', text: t('removeMemberConfirm', { name: nameOf(u) }), label: t('removeMember'), yes: () => run(() => backend.removeMember(S.circle.id, u, ids), t('saved')) });
  },
  leave: () => {
    const c = S.circle;
    if (c.adminIds.includes(me()) && c.adminIds.length === 1 && c.memberIds.length > 1) return toast(t('lastAdmin'));
    const ids = S.ideas.filter((i) => i.authorId === me() && i.status === 'pot').map((i) => i.id);
    const alone = c.memberIds.length === 1;
    openSheet({
      type: 'confirm', text: alone ? t('deleteCircleConfirm') : t('leaveConfirm'), label: alone ? t('deleteCircle') : t('leave'),
      yes: async () => {
        const cid = c.id;
        redirected = true; store.set('tombola.last', '');
        go('#/');
        await run(() => (alone ? backend.deleteCircle(cid, c) : backend.removeMember(cid, me(), ids)));
      },
    });
  },
  deleteCircle: () => {
    const c = S.circle;
    openSheet({
      type: 'confirm', text: t('deleteCircleConfirm'), label: t('deleteCircle'),
      yes: async () => { redirected = true; store.set('tombola.last', ''); go('#/'); await run(() => backend.deleteCircle(c.id, c)); },
    });
  },
  confirmYes: async () => { const fn = S.sheet?.yes; closeSheet(); if (fn) await fn(); },
};

const submits = {
  quickAdd: async () => {
    const input = $('#quick-title');
    const title = input.value.trim();
    if (!title) return input.focus();
    if (capFull()) return toast(t('capFull', { cap: settings().cap }));
    input.value = '';
    await run(() => backend.addIdea(S.circle.id, S.user, {
      meta: { duration: null, cost: null, place: null, repeat: false, no: nextNo() },
      secret: { title, note: '', link: '', visible: false },
    }), t('added'));
    $('#quick-title')?.focus();
  },
  saveIdea: async () => {
    captureForm();
    const { id, form: f } = S.sheet;
    const title = (f.title || '').trim();
    if (!title) return;
    if (!id && capFull()) return toast(t('capFull', { cap: settings().cap }));
    const payload = {
      meta: { duration: f.duration ?? null, cost: f.cost ?? null, place: f.place ?? null, repeat: !!f.repeat },
      secret: { title, note: (f.note || '').trim(), link: (f.link || '').trim(), visible: !!f.visible },
    };
    if (!id) payload.meta.no = nextNo();
    closeSheet();
    await run(() => (id ? backend.updateIdea(S.circle.id, id, payload) : backend.addIdea(S.circle.id, S.user, payload)), id ? t('saved') : t('added'));
  },
  saveCircle: async () => {
    captureForm();
    const { id, form: f } = S.sheet;
    const name = (f.name || '').trim();
    if (!name) return;
    closeSheet();
    if (id) return run(() => backend.updateCircle(id, { name, emoji: f.emoji }), t('saved'));
    const cid = await run(() => backend.createCircle({ name, emoji: f.emoji, settings: DEFAULT_SETTINGS }, { ...S.user, color: 0 }));
    if (cid) go(`#/c/${cid}/ideas`);
  },
  saveName: async () => {
    captureForm();
    const name = (S.sheet.form.name || '').trim();
    if (!name) return;
    closeSheet();
    await run(() => backend.updateMember(S.circle.id, me(), { ...member(me()), name }), t('saved'));
  },
  saveLogNote: async () => {
    captureForm();
    const { id, form: f } = S.sheet;
    closeSheet();
    await run(() => backend.updateDraw(S.circle.id, id, { note: (f.note || '').trim() }), t('saved'));
  },
};

const changes = {
  plan: (el) => run(() => backend.updateDraw(S.circle.id, el.dataset.id, { plannedFor: el.value || null })),
  surprise: (el) => { S.drawUI.surprise = el.checked; },
  'f.notMine': (el) => { S.drawUI.filters.notMine = el.checked; render(); },
  cap: (el) => saveSettings({ cap: Number(el.value) }),
  'sched.enabled': (el) => saveSettings({ schedule: { enabled: el.checked } }),
  'sched.everyWeeks': (el) => saveSettings({ schedule: { everyWeeks: Number(el.value) } }),
  'sched.weekday': (el) => saveSettings({ schedule: { weekday: Number(el.value) } }),
  'sched.hour': (el) => saveSettings({ schedule: { hour: Number(el.value) } }),
};

document.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-action]');
  if (!el || el.disabled) return;
  const fn = actions[el.dataset.action];
  if (fn) fn(el, ev);
});
document.addEventListener('submit', (ev) => {
  const form = ev.target.closest('[data-submit]');
  if (!form) return;
  ev.preventDefault();
  submits[form.dataset.submit]?.(form);
});
document.addEventListener('change', (ev) => {
  const el = ev.target.closest('[data-change]');
  if (el) changes[el.dataset.change]?.(el);
});
document.addEventListener('keydown', (ev) => {
  if (ev.key !== 'Escape') return;
  if (S.sheet) closeSheet();
  else if (S.overlay?.stage === 'reveal') actions.closeOverlay();
});
window.addEventListener('hashchange', onRoute);
window.addEventListener('beforeinstallprompt', (ev) => { ev.preventDefault(); S.installEvt = ev; render(); });
window.addEventListener('appinstalled', () => { S.installEvt = null; render(); });
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('./sw.js').catch((err) => console.warn('[tombola] service worker', err));
}

// ---------------------------------------------------------------- boot
async function boot() {
  setLang(detectLang());
  S.route = parseRoute();
  render();
  try {
    ({ backend } = await import(DEMO ? './backend-demo.js' : './backend-firebase.js'));
  } catch (err) {
    console.error('[tombola] backend', err);
    $('#app').innerHTML = `<div class="login"><p>${t('error')}</p></div>`;
    return;
  }
  backend.onAuth((user) => {
    S.user = user;
    if (unsubCircles) { unsubCircles(); unsubCircles = null; }
    S.circles = null;
    if (user) {
      unsubCircles = backend.watchCircles(user.uid, (list) => {
        S.circles = list.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
        if (!redirected && S.route.name === 'home') {
          redirected = true;
          const last = store.get('tombola.last');
          const target = S.circles.find((c) => c.id === last) || (S.circles.length === 1 ? S.circles[0] : null);
          if (target) return go(`#/c/${target.id}/draw`);
        }
        if (S.route.name === 'home') render();
      });
      let pending = null;
      try { pending = sessionStorage.getItem('tombola.join'); } catch {}
      if (S.route.name === 'join') loadInvite(S.route.code);
      else if (pending && S.route.name === 'home') { redirected = true; return go(`#/join/${pending}`); }
    } else {
      redirected = false;
    }
    syncCircleWatch();
    render();
  });
}
boot();
