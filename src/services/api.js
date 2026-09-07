/**
 * api.js — Storage Service for Operations Daily
 * Handles solver history, challenge records, and daily challenge models.
 * Supports user-scoped history with Firestore synchronization and guest fallback.
 */

import { db, auth } from './firebase';
import { collection, addDoc, doc, setDoc, getDocs } from 'firebase/firestore';

/* ── Storage Key Helpers ── */

export function getChallengeStorageKey(type = 'LP', uid = null) {
  const activeUid = uid || auth?.currentUser?.uid;
  const t = type.toLowerCase();
  return activeUid ? `op_${activeUid}_challenge_${t}_solved` : `op_guest_challenge_${t}_solved`;
}

export function getSolveHistoryStorageKey(uid = null) {
  const activeUid = uid || auth?.currentUser?.uid;
  return activeUid ? `op_${activeUid}_solve_history` : `op_guest_solve_history`;
}

/* ── Solver History ── */

export function getSolveHistory(uid = null) {
  const activeUid = uid || auth?.currentUser?.uid;
  const storageKey = getSolveHistoryStorageKey(activeUid);

  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      // If guest, provide default sample records matching PDF Page 9
      if (!activeUid) {
        const initial = [
          { id: 1, type: 'IP', timestamp: '09/05/2026 14:30', description: 'SOLVED IP PROBLEM 09/05/2026 14:30', details: {} },
          { id: 2, type: 'IP', timestamp: '09/04/2026 18:15', description: 'SOLVED IP PROBLEM 09/04/2026 18:15', details: {} },
          { id: 3, type: 'IP', timestamp: '09/03/2026 09:20', description: 'SOLVED IP PROBLEM 09/03/2026 09:20', details: {} },
          { id: 4, type: 'LP', timestamp: '09/02/2026 21:00', description: 'SOLVED LP PROBLEM 09/02/2026 21:00', details: {} },
          { id: 5, type: 'LP', timestamp: '09/01/2026 11:45', description: 'SOLVED LP PROBLEM 09/01/2026 11:45', details: {} },
          { id: 6, type: 'LP', timestamp: '08/31/2026 16:10', description: 'SOLVED LP PROBLEM 08/31/2026 16:10', details: {} },
        ];
        localStorage.setItem(storageKey, JSON.stringify(initial));
        return initial;
      }
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveSolveRecord(type = 'LP', details = {}, uid = null) {
  try {
    const activeUid = uid || auth?.currentUser?.uid;
    const history = getSolveHistory(activeUid);
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const dateStr = `${pad(now.getMonth() + 1)}/${pad(now.getDate())}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const record = {
      id: Date.now(),
      type: type.toUpperCase(),
      timestamp: dateStr,
      description: `SOLVED ${type.toUpperCase()} PROBLEM ${dateStr}`,
      details, // Contains full model snapshot + optimalZ
      createdAt: Date.now(),
      userId: activeUid || 'guest'
    };

    const updated = [record, ...history].slice(0, 50); // keep last 50
    localStorage.setItem(getSolveHistoryStorageKey(activeUid), JSON.stringify(updated));

    if (activeUid && db) {
      try {
        addDoc(collection(db, 'users', activeUid, 'history'), record).catch(console.error);
      } catch (err) {
        console.error('Firestore save solve history error:', err);
      }
    }

    return record;
  } catch (e) {
    console.error('saveSolveRecord error:', e);
  }
}

export async function syncUserSolveHistoryFromFirestore(uid) {
  if (!uid || !db) return getSolveHistory(null);
  try {
    const snap = await getDocs(collection(db, 'users', uid, 'history'));
    const local = getSolveHistory(uid);
    const remote = [];
    snap.forEach((docSnap) => {
      const d = docSnap.data();
      remote.push({
        id: d.id || docSnap.id,
        type: d.type || 'LP',
        timestamp: d.timestamp || '',
        description: d.description || '',
        details: d.details || {},
        createdAt: d.createdAt || 0,
        userId: uid
      });
    });

    // Merge remote and local by id or signature
    const seen = new Set();
    const combined = [];
    [...remote, ...local].forEach((item) => {
      const key = item.id ? String(item.id) : `${item.type}_${item.timestamp}`;
      if (!seen.has(key)) {
        seen.add(key);
        combined.push(item);
      }
    });

    combined.sort((a, b) => (b.createdAt || b.id || 0) - (a.createdAt || a.id || 0));
    const finalHistory = combined.slice(0, 50);

    localStorage.setItem(getSolveHistoryStorageKey(uid), JSON.stringify(finalHistory));
    return finalHistory;
  } catch (err) {
    console.warn('Could not sync solve history from Firestore:', err);
    return getSolveHistory(uid);
  }
}

/* ── Challenge Solve Tracking ── */

export function markChallengeAsSolved(type = 'LP', dateKey, modelSnapshot = {}, uid = null) {
  const activeUid = uid || auth?.currentUser?.uid;
  const storageKey = getChallengeStorageKey(type, activeUid);
  try {
    const raw = localStorage.getItem(storageKey);
    const data = raw ? JSON.parse(raw) : {};
    const challengeRecord = {
      solvedAt: new Date().toISOString(),
      model: modelSnapshot,
      type: type.toUpperCase(),
      dateKey,
      userId: activeUid || 'guest'
    };
    data[dateKey] = challengeRecord;
    localStorage.setItem(storageKey, JSON.stringify(data));

    if (activeUid && db) {
      try {
        setDoc(doc(db, 'users', activeUid, 'challenges', `${type}_${dateKey}`), challengeRecord).catch(console.error);
      } catch (err) {
        console.error('Firestore save challenge error:', err);
      }
    }
  } catch (e) {
    console.error('markChallengeAsSolved error:', e);
  }
}

export function getChallengeHistory(type = 'LP', uid = null) {
  const activeUid = uid || auth?.currentUser?.uid;
  const storageKey = getChallengeStorageKey(type, activeUid);
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export async function syncUserChallengesFromFirestore(uid) {
  if (!uid || !db) return { lp: getChallengeHistory('LP'), ip: getChallengeHistory('IP') };
  try {
    const snap = await getDocs(collection(db, 'users', uid, 'challenges'));
    const lpData = { ...getChallengeHistory('LP', uid) };
    const ipData = { ...getChallengeHistory('IP', uid) };

    snap.forEach((docSnap) => {
      const d = docSnap.data();
      const type = (d.type || (docSnap.id.startsWith('IP') ? 'IP' : 'LP')).toUpperCase();
      const dateKey = d.dateKey || docSnap.id.replace(/^(LP|IP)_/, '');
      const record = {
        solvedAt: d.solvedAt || new Date().toISOString(),
        model: d.model || null,
        type,
        dateKey
      };
      if (type === 'IP') {
        ipData[dateKey] = record;
      } else {
        lpData[dateKey] = record;
      }
    });

    localStorage.setItem(getChallengeStorageKey('LP', uid), JSON.stringify(lpData));
    localStorage.setItem(getChallengeStorageKey('IP', uid), JSON.stringify(ipData));

    return { lp: lpData, ip: ipData };
  } catch (err) {
    console.warn('Could not sync challenges from Firestore:', err);
    return {
      lp: getChallengeHistory('LP', uid),
      ip: getChallengeHistory('IP', uid),
    };
  }
}

/* ── Daily Challenge Models ── */

// Simple seeded PRNG
function mulberry32(a) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

function generateModel(type, dateStr) {
  // Use date string as seed
  let seed = 0;
  for (let i = 0; i < dateStr.length; i++) {
    seed += dateStr.charCodeAt(i) * Math.pow(10, i % 3);
  }
  const random = mulberry32(seed + (type === 'IP' ? 100 : 0));

  const numVars = Math.floor(random() * 3) + 2; // 2 to 4
  const numConstraints = Math.floor(random() * 3) + 2; // 2 to 4
  const isMax = random() > 0.5;

  const rawObjective = Array.from({ length: numVars }, () => Math.floor(random() * 9) + 1);
  let objectiveStr = `${isMax ? 'MAXIMIZE' : 'MINIMIZE'} Z = ` + rawObjective.map((c, i) => `${c}X${String.fromCharCode(8321 + i)}`).join(' + ');

  const constraints = [];
  const rels = ['<=', '>=', '='];
  for (let i = 0; i < numConstraints; i++) {
    const coeffs = Array.from({ length: numVars }, () => Math.floor(random() * 10));
    const rhs = Math.floor(random() * 20) + 5;
    const rel = rels[Math.floor(random() * rels.length)];
    
    let textParts = [];
    coeffs.forEach((c, j) => {
      if (c !== 0) {
        textParts.push(`${c}X${String.fromCharCode(8321 + j)}`);
      }
    });
    let text = textParts.join(' + ');
    if (!text) text = `0X₁`;
    
    let relStr = rel === '<=' ? '≤' : (rel === '>=' ? '≥' : '=');
    text += ` ${relStr} ${rhs}`;

    constraints.push({
      text,
      coefficients: coeffs,
      relation: rel,
      rhs
    });
  }

  const varsArr = Array.from({ length: numVars }, (_, i) => `X${String.fromCharCode(8321 + i)}`);
  
  return {
    title: `DAILY ${type} MODEL`,
    objective: objectiveStr,
    rawObjective,
    isMax,
    constraints,
    nonNegativity: `${varsArr.join(', ')} ≥ 0`,
    integerConstraint: type === 'IP' ? `${varsArr.join(', ')} ∈ ℤ` : undefined,
    numVars,
  };
}

export function getDailyLPModel(dateStr) {
  return generateModel('LP', dateStr);
}

export function getDailyIPModel(dateStr) {
  return generateModel('IP', dateStr);
}
