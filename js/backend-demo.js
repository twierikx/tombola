// In-memory backend for trying the app without an account (open the page with ?demo).
// Implements the same interface as backend-firebase.js. Nothing is saved.

const params = new URLSearchParams(location.search);
const ME = params.get('as') === 'b'
  ? { uid: 'demo-b', name: 'Noor', photo: '' }
  : { uid: 'demo-a', name: 'Sam', photo: '' };

const day = 86400000;
const now = Date.now();
let seq = 100;
const nid = (p) => `${p}${seq++}`;
const clone = (x) => JSON.parse(JSON.stringify(x));

const db = { circles: {}, invites: {}, ideas: {}, secrets: {}, draws: {} };
const listeners = new Set();
const emit = () => listeners.forEach((fn) => fn());

function seed() {
  const cid = 'demo-circle';
  db.circles[cid] = {
    id: cid, name: 'Wij tweeën', emoji: '🎟️', createdBy: 'demo-a', createdAt: now - 60 * day,
    adminIds: ['demo-a'], memberIds: ['demo-a', 'demo-b'],
    members: { 'demo-a': { name: 'Sam', photo: '' }, 'demo-b': { name: 'Noor', photo: '' } },
    inviteCode: 'demo-invite',
    settings: { reveal: 'everyone', fairness: 'person', cap: 10, whoDraws: 'anyone', schedule: { enabled: true, everyWeeks: 1, weekday: 6, hour: 10 } },
    nextDrawAt: now + 3 * day,
  };
  db.invites['demo-invite'] = { circleId: cid, name: 'Wij tweeën', emoji: '🎟️' };
  db.ideas[cid] = {}; db.secrets[cid] = {}; db.draws[cid] = {};
  const add = (author, title, meta = {}, extra = {}) => {
    const id = nid('i');
    db.ideas[cid][id] = { id, authorId: author, status: 'pot', createdAt: now - Math.random() * 40 * day, duration: null, cost: null, place: null, repeat: false, ...meta };
    db.secrets[cid][id] = { id, authorId: author, title, note: '', link: '', visible: false, createdAt: now, ...extra };
    return id;
  };
  add('demo-a', 'Vermut en tapas in La Latina', { duration: 1, cost: 2, place: 'both' });
  add('demo-a', 'Zonsondergang bij de Templo de Debod', { duration: 1, cost: 0, place: 'out' });
  add('demo-a', 'Dagje wandelen in de Sierra de Guadarrama', { duration: 3, cost: 1, place: 'out' }, { note: 'Trein naar Cercedilla, Camino Schmid.' });
  add('demo-a', 'Samen een paella leren maken', { duration: 2, cost: 2, place: 'in', repeat: true });
  add('demo-a', 'Improvshow kijken', { duration: 1, cost: 1, place: 'in' });
  add('demo-b', 'Kanoën op het meer van Casa de Campo', { duration: 1, cost: 1, place: 'out' });
  add('demo-b', 'Keramiekworkshop', { duration: 2, cost: 3, place: 'in' });
  add('demo-b', 'Picknick in El Retiro', { duration: 2, cost: 1, place: 'out' }, { visible: true });
  add('demo-b', 'Weekend Toledo', { duration: 4, cost: 3, place: 'both' });
  const done1 = add('demo-b', 'Churros bij San Ginés na middernacht', { duration: 1, cost: 1, place: 'in', status: 'done' }, { visible: true });
  const done2 = add('demo-a', 'Fietstocht langs Madrid Río', { duration: 2, cost: 0, place: 'out', status: 'done' }, { visible: true });
  const open1 = add('demo-b', 'Rooftop-bioscoop', { duration: 1, cost: 2, place: 'out', status: 'drawn' }, { visible: true });
  const mk = (ideaId, author, ago, status, extra = {}) => {
    const id = nid('d');
    db.draws[cid][id] = { id, ideaId, authorId: author, drawnBy: 'demo-a', drawnAt: now - ago * day, auto: true, surprise: false, revealed: true, status, plannedFor: null, ratings: {}, note: '', ...extra };
  };
  mk(done2, 'demo-a', 21, 'done', { doneAt: now - 19 * day, ratings: { 'demo-a': 4, 'demo-b': 5 }, note: 'Tot aan de Matadero gefietst, daarna horchata.' });
  mk(done1, 'demo-b', 14, 'done', { doneAt: now - 13 * day, ratings: { 'demo-a': 5, 'demo-b': 4 }, auto: false });
  mk(open1, 'demo-b', 2, 'open', { plannedFor: new Date(now + 5 * day).toISOString().slice(0, 10) });
}
seed();

const authListeners = new Set();
let signedIn = true;

export const backend = {
  demo: true,

  onAuth(cb) {
    authListeners.add(cb);
    setTimeout(() => cb(signedIn ? ME : null), 0);
    return () => authListeners.delete(cb);
  },
  async signIn() { signedIn = true; authListeners.forEach((cb) => cb(ME)); },
  async signOut() { signedIn = false; authListeners.forEach((cb) => cb(null)); },

  watchCircles(uid, cb) {
    const fn = () => cb(clone(Object.values(db.circles).filter((c) => c.memberIds.includes(uid))));
    listeners.add(fn); setTimeout(fn, 0);
    return () => listeners.delete(fn);
  },

  watchCircle(cid, uid, on) {
    const fn = () => {
      const c = db.circles[cid];
      if (!c || !c.memberIds.includes(uid)) return on.circle(null);
      on.circle(clone(c));
      on.ideas(clone(Object.values(db.ideas[cid])));
      const secrets = Object.values(db.secrets[cid]);
      on.mySecrets(clone(secrets.filter((s) => s.authorId === uid)));
      on.visibleSecrets(clone(secrets.filter((s) => s.visible)));
      on.draws(clone(Object.values(db.draws[cid])));
    };
    listeners.add(fn); setTimeout(fn, 0);
    return () => listeners.delete(fn);
  },

  async createCircle({ name, emoji, settings }, user) {
    const id = nid('c'); const code = nid('inv');
    db.circles[id] = {
      id, name, emoji, settings, createdBy: user.uid, createdAt: Date.now(), adminIds: [user.uid], memberIds: [user.uid],
      members: { [user.uid]: { name: user.name, photo: user.photo } }, inviteCode: code, nextDrawAt: null,
    };
    db.invites[code] = { circleId: id, name, emoji };
    db.ideas[id] = {}; db.secrets[id] = {}; db.draws[id] = {};
    emit();
    return id;
  },

  async getInvite(code) { return db.invites[code] ? clone(db.invites[code]) : null; },

  async joinCircle(code, user) {
    const inv = db.invites[code];
    if (!inv) return null;
    const c = db.circles[inv.circleId];
    if (!c.memberIds.includes(user.uid)) c.memberIds.push(user.uid);
    c.members[user.uid] = { name: user.name, photo: user.photo };
    emit();
    return inv.circleId;
  },

  async updateCircle(cid, patch) {
    Object.assign(db.circles[cid], clone(patch));
    const inv = db.invites[db.circles[cid].inviteCode];
    if (inv) { inv.name = db.circles[cid].name; inv.emoji = db.circles[cid].emoji; }
    emit();
  },
  async updateMember(cid, uid, profile) { db.circles[cid].members[uid] = profile; emit(); },
  async setAdmin(cid, uid, on) {
    const c = db.circles[cid];
    c.adminIds = c.adminIds.filter((x) => x !== uid);
    if (on) c.adminIds.push(uid);
    emit();
  },
  async removeMember(cid, uid, ideaIds) {
    const c = db.circles[cid];
    ideaIds.forEach((id) => { delete db.ideas[cid][id]; delete db.secrets[cid][id]; });
    c.memberIds = c.memberIds.filter((x) => x !== uid);
    c.adminIds = c.adminIds.filter((x) => x !== uid);
    emit();
  },
  async regenerateInvite(cid, circle) {
    const code = nid('inv');
    delete db.invites[circle.inviteCode];
    db.invites[code] = { circleId: cid, name: circle.name, emoji: circle.emoji };
    db.circles[cid].inviteCode = code;
    emit();
    return code;
  },
  async deleteCircle(cid, circle) {
    delete db.invites[circle.inviteCode]; delete db.circles[cid];
    emit();
  },

  async addIdea(cid, user, { meta, secret }) {
    const id = nid('i');
    db.ideas[cid][id] = { id, ...meta, authorId: user.uid, status: 'pot', createdAt: Date.now() };
    db.secrets[cid][id] = { id, ...secret, authorId: user.uid, createdAt: Date.now() };
    emit();
    return id;
  },
  async updateIdea(cid, id, { meta, secret }) {
    if (meta) Object.assign(db.ideas[cid][id], meta);
    if (secret) Object.assign(db.secrets[cid][id], secret);
    emit();
  },
  async deleteIdea(cid, id) { delete db.ideas[cid][id]; delete db.secrets[cid][id]; emit(); },

  async commitDraw(cid, { idea, user, surprise, auto, expectNextDrawAt, newNextDrawAt }) {
    const c = db.circles[cid];
    if (auto && c.nextDrawAt !== expectNextDrawAt) throw Object.assign(new Error('not due'), { code: 'not-due' });
    const cur = db.ideas[cid][idea.id];
    if (!cur || cur.status !== 'pot') throw Object.assign(new Error('taken'), { code: 'taken' });
    const t = Date.now();
    cur.status = 'drawn'; cur.drawnAt = t;
    if (!surprise) db.secrets[cid][idea.id].visible = true;
    const id = nid('d');
    db.draws[cid][id] = {
      id, ideaId: idea.id, authorId: idea.authorId, drawnBy: user.uid, drawnAt: t, auto: !!auto,
      surprise: !!surprise, revealed: !surprise, status: 'open', plannedFor: null, ratings: {}, note: '',
    };
    if (auto) c.nextDrawAt = newNextDrawAt;
    emit();
    return id;
  },
  async skipScheduledDraw(cid, expect, next) {
    if (db.circles[cid].nextDrawAt === expect) { db.circles[cid].nextDrawAt = next; emit(); }
  },
  async revealDraw(cid, draw) {
    db.secrets[cid][draw.ideaId].visible = true;
    db.draws[cid][draw.id].revealed = true;
    emit();
  },
  async updateDraw(cid, id, patch) {
    const d = db.draws[cid][id];
    for (const k in patch) {
      if (k.startsWith('ratings.')) d.ratings[k.slice(8)] = patch[k];
      else d[k] = patch[k];
    }
    emit();
  },
  async finishDraw(cid, draw, status, ideaStatus) {
    const d = db.draws[cid][draw.id];
    d.status = status;
    if (status === 'done') {
      d.doneAt = Date.now();
      if (!d.revealed) { d.revealed = true; db.secrets[cid][draw.ideaId].visible = true; }
    }
    if (ideaStatus && db.ideas[cid][draw.ideaId]) db.ideas[cid][draw.ideaId].status = ideaStatus;
    emit();
  },
};
