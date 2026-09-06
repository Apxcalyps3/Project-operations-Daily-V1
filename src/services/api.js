/**
 * api.js — Storage Service for Operations Daily
 * Handles solver history, challenge records, and daily challenge models.
 */

const SOLVE_HISTORY_KEY  = 'operations_daily_solve_history';
const CHALLENGE_LP_KEY   = 'op_challenge_lp_solved';
const CHALLENGE_IP_KEY   = 'op_challenge_ip_solved';

import { db, auth } from './firebase';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';

/* ── Solver History ── */

export function getSolveHistory() {
  try {
    const raw = localStorage.getItem(SOLVE_HISTORY_KEY);
    if (!raw) {
      // Seed with sample records matching PDF Page 9
      const initial = [
        { id: 1, type: 'IP', timestamp: '09/05/2026 14:30', description: 'SOLVED IP PROBLEM 09/05/2026 14:30', details: {} },
        { id: 2, type: 'IP', timestamp: '09/04/2026 18:15', description: 'SOLVED IP PROBLEM 09/04/2026 18:15', details: {} },
        { id: 3, type: 'IP', timestamp: '09/03/2026 09:20', description: 'SOLVED IP PROBLEM 09/03/2026 09:20', details: {} },
        { id: 4, type: 'LP', timestamp: '09/02/2026 21:00', description: 'SOLVED LP PROBLEM 09/02/2026 21:00', details: {} },
        { id: 5, type: 'LP', timestamp: '09/01/2026 11:45', description: 'SOLVED LP PROBLEM 09/01/2026 11:45', details: {} },
        { id: 6, type: 'LP', timestamp: '08/31/2026 16:10', description: 'SOLVED LP PROBLEM 08/31/2026 16:10', details: {} },
      ];
      localStorage.setItem(SOLVE_HISTORY_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveSolveRecord(type = 'LP', details = {}) {
  try {
    const history = getSolveHistory();
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const dateStr = `${pad(now.getMonth() + 1)}/${pad(now.getDate())}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const record = {
      id: Date.now(),
      type: type.toUpperCase(),
      timestamp: dateStr,
      description: `SOLVED ${type.toUpperCase()} PROBLEM ${dateStr}`,
      details,        // Contains full model snapshot + optimalZ
    };

    const updated = [record, ...history].slice(0, 50); // keep last 50
    localStorage.setItem(SOLVE_HISTORY_KEY, JSON.stringify(updated));

    if (auth && auth.currentUser) {
      try {
        addDoc(collection(db, 'users', auth.currentUser.uid, 'history'), record).catch(console.error);
      } catch (err) {
        console.error('Firestore save error:', err);
      }
    }

    return record;
  } catch (e) {
    console.error('saveSolveRecord error:', e);
  }
}

/* ── Challenge Solve Tracking ── */

export function markChallengeAsSolved(type = 'LP', dateKey, modelSnapshot = {}) {
  const key = type === 'IP' ? CHALLENGE_IP_KEY : CHALLENGE_LP_KEY;
  try {
    const raw = localStorage.getItem(key);
    const data = raw ? JSON.parse(raw) : {};
    const challengeRecord = { solvedAt: new Date().toISOString(), model: modelSnapshot };
    data[dateKey] = challengeRecord;
    localStorage.setItem(key, JSON.stringify(data));

    if (auth && auth.currentUser) {
      try {
        setDoc(doc(db, 'users', auth.currentUser.uid, 'challenges', `${type}_${dateKey}`), challengeRecord).catch(console.error);
      } catch (err) {
        console.error('Firestore save error:', err);
      }
    }
  } catch (e) {
    console.error('markChallengeAsSolved error:', e);
  }
}

export function getChallengeHistory(type = 'LP') {
  const key = type === 'IP' ? CHALLENGE_IP_KEY : CHALLENGE_LP_KEY;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
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
