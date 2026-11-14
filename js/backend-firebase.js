// Firebase backend: Google sign-in + Cloud Firestore.
// The demo backend (backend-demo.js) implements the same interface.
import { firebaseConfig } from './config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/13.3.0/firebase-app.js';
import {
  getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut as fbSignOut,
} from 'https://www.gstatic.com/firebasejs/13.3.0/firebase-auth.js';
import {
  getFirestore, doc, collection, query, where, onSnapshot, getDoc, getDocs, updateDoc,
  writeBatch, runTransaction, arrayUnion, arrayRemove,
} from 'https://www.gstatic.com/firebasejs/13.3.0/firebase-firestore.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const firstName = (n) => (n || '').trim().split(/\s+/)[0] || '';
const toUser = (u) => u && { uid: u.uid, name: firstName(u.displayName) || (u.email || '').split('@')[0], photo: u.photoURL || '' };
const rid = (n = 20) => {
  const abc = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const a = crypto.getRandomValues(new Uint8Array(n));
  return Array.from(a, (x) => abc[x % abc.length]).join('');
};
const cRef = (cid) => doc(db, 'circles', cid);
const sub = (cid, name) => collection(db, 'circles', cid, name);
const list = (snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() }));
const fail = (label) => (err) => console.error(`[tombola] ${label}`, err);

export const backend = {
  demo: false,

  onAuth(cb) {
    return onAuthStateChanged(auth, (u) => cb(toUser(u)));
  },
  async signIn() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    await signInWithPopup(auth, provider);
  },
  signOut() {
    return fbSignOut(auth);
  },

  watchCircles(uid, cb) {
    const q = query(collection(db, 'circles'), where('memberIds', 'array-contains', uid));
    return onSnapshot(q, (s) => cb(list(s)), fail('circles'));
  },

  watchCircle(cid, uid, on) {
    const unsubs = [
      onSnapshot(cRef(cid), (s) => on.circle(s.exists() ? { id: s.id, ...s.data() } : null), (e) => { fail('circle')(e); on.circle(null); }),
      onSnapshot(sub(cid, 'ideas'), (s) => on.ideas(list(s)), fail('ideas')),
      onSnapshot(query(sub(cid, 'secrets'), where('authorId', '==', uid)), (s) => on.mySecrets(list(s)), fail('my secrets')),
      onSnapshot(query(sub(cid, 'secrets'), where('visible', '==', true)), (s) => on.visibleSecrets(list(s)), fail('visible secrets')),
      onSnapshot(sub(cid, 'draws'), (s) => on.draws(list(s)), fail('draws')),
    ];
    return () => unsubs.forEach((u) => u());
  },

  async createCircle({ name, emoji, settings }, user) {
    const ref = doc(collection(db, 'circles'));
    const code = rid();
    const batch = writeBatch(db);
    batch.set(ref, {
      name, emoji, settings,
      createdBy: user.uid, createdAt: Date.now(),
      adminIds: [user.uid], memberIds: [user.uid],
      members: { [user.uid]: { name: user.name, photo: user.photo } },
      inviteCode: code, nextDrawAt: null,
    });
    batch.set(doc(db, 'invites', code), { circleId: ref.id, name, emoji });
    await batch.commit();
    return ref.id;
  },

  async getInvite(code) {
    const s = await getDoc(doc(db, 'invites', code));
    return s.exists() ? s.data() : null;
  },

  async joinCircle(code, user) {
    const inv = await this.getInvite(code);
    if (!inv) return null;
    try {
      await updateDoc(cRef(inv.circleId), {
        memberIds: arrayUnion(user.uid),
        [`members.${user.uid}`]: { name: user.name, photo: user.photo },
        joinCode: code,
      });
    } catch (err) {
      // Already a member? Then reading the circle works.
      const s = await getDoc(cRef(inv.circleId)).catch(() => null);
      if (!s || !s.exists()) throw err;
    }
    return inv.circleId;
  },

  async updateCircle(cid, patch) {
    const batch = writeBatch(db);
    batch.update(cRef(cid), patch);
    if (patch.name !== undefined || patch.emoji !== undefined) {
      const cur = (await getDoc(cRef(cid))).data();
      batch.update(doc(db, 'invites', cur.inviteCode), {
        name: patch.name ?? cur.name, emoji: patch.emoji ?? cur.emoji,
      });
    }
    await batch.commit();
  },

  updateMember(cid, uid, profile) {
    return updateDoc(cRef(cid), { [`members.${uid}`]: profile });
  },

  setAdmin(cid, uid, on) {
    return updateDoc(cRef(cid), { adminIds: on ? arrayUnion(uid) : arrayRemove(uid) });
  },

  /** Take a member (or yourself) out of the circle and their ideas out of the pot. */
  async removeMember(cid, uid, ideaIds) {
    const batch = writeBatch(db);
    for (const id of ideaIds) {
      batch.delete(doc(db, 'circles', cid, 'ideas', id));
      batch.delete(doc(db, 'circles', cid, 'secrets', id));
    }
    await batch.commit();
    await updateDoc(cRef(cid), { memberIds: arrayRemove(uid), adminIds: arrayRemove(uid) });
  },

  async regenerateInvite(cid, circle) {
    const code = rid();
    const batch = writeBatch(db);
    batch.delete(doc(db, 'invites', circle.inviteCode));
    batch.set(doc(db, 'invites', code), { circleId: cid, name: circle.name, emoji: circle.emoji });
    batch.update(cRef(cid), { inviteCode: code });
    await batch.commit();
    return code;
  },

  async deleteCircle(cid, circle) {
    const [ideas, draws] = await Promise.all([getDocs(sub(cid, 'ideas')), getDocs(sub(cid, 'draws'))]);
    const refs = [];
    ideas.forEach((d) => refs.push(d.ref, doc(db, 'circles', cid, 'secrets', d.id)));
    draws.forEach((d) => refs.push(d.ref));
    for (let i = 0; i < refs.length; i += 400) {
      const batch = writeBatch(db);
      refs.slice(i, i + 400).forEach((r) => batch.delete(r));
      await batch.commit();
    }
    const batch = writeBatch(db);
    batch.delete(doc(db, 'invites', circle.inviteCode));
    batch.delete(cRef(cid));
    await batch.commit();
  },

  async addIdea(cid, user, { meta, secret }) {
    const ref = doc(sub(cid, 'ideas'));
    const now = Date.now();
    const batch = writeBatch(db);
    batch.set(ref, { ...meta, authorId: user.uid, status: 'pot', createdAt: now });
    batch.set(doc(db, 'circles', cid, 'secrets', ref.id), { ...secret, authorId: user.uid, createdAt: now });
    await batch.commit();
    return ref.id;
  },

  async updateIdea(cid, id, { meta, secret }) {
    const batch = writeBatch(db);
    if (meta) batch.update(doc(db, 'circles', cid, 'ideas', id), meta);
    if (secret) batch.update(doc(db, 'circles', cid, 'secrets', id), secret);
    await batch.commit();
  },

  async deleteIdea(cid, id) {
    const batch = writeBatch(db);
    batch.delete(doc(db, 'circles', cid, 'ideas', id));
    batch.delete(doc(db, 'circles', cid, 'secrets', id));
    await batch.commit();
  },

  /**
   * Record a draw. Fails with code 'taken' when the idea left the pot in the meantime,
   * and with 'not-due' when another device already did this automatic draw.
   */
  async commitDraw(cid, { idea, user, surprise, auto, expectNextDrawAt, newNextDrawAt }) {
    const ideaRef = doc(db, 'circles', cid, 'ideas', idea.id);
    const drawRef = doc(sub(cid, 'draws'));
    const now = Date.now();
    await runTransaction(db, async (tx) => {
      const [circleSnap, ideaSnap] = [await tx.get(cRef(cid)), await tx.get(ideaRef)];
      if (auto && circleSnap.data().nextDrawAt !== expectNextDrawAt) throw Object.assign(new Error('not due'), { code: 'not-due' });
      if (!ideaSnap.exists() || ideaSnap.data().status !== 'pot') throw Object.assign(new Error('taken'), { code: 'taken' });
      tx.update(ideaRef, { status: 'drawn', drawnAt: now });
      if (!surprise) tx.update(doc(db, 'circles', cid, 'secrets', idea.id), { visible: true, revealedAt: now });
      tx.set(drawRef, {
        ideaId: idea.id, authorId: idea.authorId, drawnBy: user.uid, drawnAt: now, auto: !!auto,
        surprise: !!surprise, revealed: !surprise, status: 'open', plannedFor: null, ratings: {}, note: '',
      });
      if (auto) tx.update(cRef(cid), { nextDrawAt: newNextDrawAt });
    });
    return drawRef.id;
  },

  /** Move the schedule on without drawing (the pot was empty). */
  async skipScheduledDraw(cid, expectNextDrawAt, newNextDrawAt) {
    await runTransaction(db, async (tx) => {
      const s = await tx.get(cRef(cid));
      if (s.data().nextDrawAt !== expectNextDrawAt) return;
      tx.update(cRef(cid), { nextDrawAt: newNextDrawAt });
    });
  },

  async revealDraw(cid, draw) {
    const batch = writeBatch(db);
    batch.update(doc(db, 'circles', cid, 'secrets', draw.ideaId), { visible: true, revealedAt: Date.now() });
    batch.update(doc(db, 'circles', cid, 'draws', draw.id), { revealed: true });
    await batch.commit();
  },

  updateDraw(cid, id, patch) {
    return updateDoc(doc(db, 'circles', cid, 'draws', id), patch);
  },

  /** Close a draw as 'done' or 'skipped' and move the idea accordingly. */
  async finishDraw(cid, draw, status, ideaStatus) {
    const batch = writeBatch(db);
    const patch = { status };
    if (status === 'done') {
      patch.doneAt = Date.now();
      if (!draw.revealed) {
        patch.revealed = true;
        batch.update(doc(db, 'circles', cid, 'secrets', draw.ideaId), { visible: true, revealedAt: Date.now() });
      }
    }
    batch.update(doc(db, 'circles', cid, 'draws', draw.id), patch);
    if (ideaStatus) batch.update(doc(db, 'circles', cid, 'ideas', draw.ideaId), { status: ideaStatus });
    await batch.commit();
  },
};
