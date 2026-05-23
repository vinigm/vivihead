// Camada de persistência — Firestore com fallback localStorage.

import {
  doc, setDoc, getDoc, getDocs, collection, query, where, serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js';
import { db } from './firebase-config.js';

const LS_PREFIX = 'vh:day:';

function dayDocId(userId, dateStr) {
  return `${userId}_${dateStr}`;
}

export async function saveDay(userId, dateStr, data) {
  const id = dayDocId(userId, dateStr);
  const payload = {
    userId,
    date: dateStr,
    hadHeadache: data.hadHeadache === true ? true : data.hadHeadache === false ? false : null,
    startedAt: Array.isArray(data.startedAt) ? data.startedAt : [],
    passedAt: Array.isArray(data.passedAt) ? data.passedAt : [],
    meds: Array.isArray(data.meds) ? data.meds : [],
    notes: data.notes || '',
    updatedAt: serverTimestamp(),
  };
  try {
    await setDoc(doc(db, 'days', id), payload, { merge: true });
  } catch (e) {
    // fallback local
    localStorage.setItem(LS_PREFIX + id, JSON.stringify({ ...payload, updatedAt: Date.now() }));
    throw e;
  }
  // mantém um cache local também (útil offline)
  try {
    localStorage.setItem(LS_PREFIX + id, JSON.stringify({ ...payload, updatedAt: Date.now() }));
  } catch (_) {}
}

export async function loadDay(userId, dateStr) {
  const id = dayDocId(userId, dateStr);
  try {
    const snap = await getDoc(doc(db, 'days', id));
    if (snap.exists()) return snap.data();
  } catch (_) {}
  // fallback
  const local = localStorage.getItem(LS_PREFIX + id);
  if (local) {
    try { return JSON.parse(local); } catch (_) {}
  }
  return null;
}

export async function loadRange(userId, fromDateStr, toDateStr) {
  // Carrega todos os docs do usuário; o filtro de range é feito client-side.
  // Como cada usuário tem ~1 doc/dia, é OK pro volume esperado por anos.
  try {
    const q = query(collection(db, 'days'), where('userId', '==', userId));
    const snap = await getDocs(q);
    const out = [];
    snap.forEach((d) => {
      const data = d.data();
      if (data.date >= fromDateStr && data.date <= toDateStr) out.push(data);
    });
    return out;
  } catch (e) {
    // fallback local
    const out = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k?.startsWith(LS_PREFIX + userId + '_')) continue;
      try {
        const v = JSON.parse(localStorage.getItem(k));
        if (v.date >= fromDateStr && v.date <= toDateStr) out.push(v);
      } catch (_) {}
    }
    return out;
  }
}

export async function loadAll(userId) {
  try {
    const q = query(collection(db, 'days'), where('userId', '==', userId));
    const snap = await getDocs(q);
    const out = [];
    snap.forEach((d) => out.push(d.data()));
    return out;
  } catch (_) {
    const out = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k?.startsWith(LS_PREFIX + userId + '_')) continue;
      try { out.push(JSON.parse(localStorage.getItem(k))); } catch (_) {}
    }
    return out;
  }
}
