/* ============================================================
   书桌 · store.js — 题库适配 / 本地状态 / 遗忘曲线 / 统计
   ============================================================ */
(function () {
'use strict';

const KEY = 'shuzhuo_v1';
const DAY = 86400000;
const INTERVALS = [1, 2, 4, 7, 15, 30, 60];      // 遗忘曲线复习间隔（天）
const N = QBANK.r.length;

const DEFAULT_SETTINGS = {
  theme: 'liquid',
  font: 'sys',
  fontSize: 1,                                  // rem 倍率
  bgImg: '',                                     // dataURL
  bgBlur: 0,
  overlay: 0,                                    // 背景遮罩
  hue: 0, sat: 1, bright: 1,
  accent: '',                                    // 自定义强调色
  particles: true,
  particleDensity: 1,
  sound: true,
  soundPack: 'classic',
  soundOk: true,
  soundBad: true,
  volume: 0.7,
  mastery: 3,                                    // 连续答对次数 = 掌握
  dailyGoal: 30,
  autoSpeak: false
};

let state = load();

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && s.v === 1) {
      s.settings = Object.assign({}, DEFAULT_SETTINGS, s.settings || {});
      s.q = s.q || {}; s.days = s.days || {}; s.eggs = s.eggs || {};
      return s;
    }
  } catch (e) {}
  return { v: 1, q: {}, days: {}, eggs: {}, settings: Object.assign({}, DEFAULT_SETTINGS), daily: freshDaily() };
}
function freshDaily() {
  return { date: todayStr(), done: 0 };
}
let saveTimer = null;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (e) { /* 配额超限时静默 */ }
  }, 120);
}
saveNow();
function saveNow() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }

/* ---------- 时间工具 ---------- */
function todayStr(d) {
  d = d || new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function now() { return Date.now(); }

/* ---------- 题目适配 ---------- */
const qCache = new Array(N);
function Q(i) {
  if (i < 0 || i >= N) return null;
  if (qCache[i]) return qCache[i];
  const r = QBANK.r[i];
  const type = r[1];
  let opts, ans;
  if (type === 1) {                              // 判断
    opts = ['正确', '错误'];
    ans = [r[4]];
  } else {
    opts = r.slice(5);
    ans = r[4].split('');
  }
  return qCache[i] = {
    id: i, dept: r[0], type: type, no: r[2],
    q: r[3], ans: ans, opts: opts
  };
}
const typeName = i => QBANK.t[i];
const deptName = i => QBANK.d[i];

/* ---------- 单题状态 ---------- */
function rec(id) {
  return state.q[id] || (state.q[id] = { r: 0, w: 0, s: 0, i: 0, d: 0, l: 0, f: 0, n: '' });
}
function isMastered(id) { const x = state.q[id]; return !!x && x.s >= state.settings.mastery; }
function isWrong(id) { const x = state.q[id]; return x && x.w > 0 && x.s < state.settings.mastery; }
function isSeen(id) { return !!state.q[id] && (state.q[id].r + state.q[id].w > 0); }
function fav(id) { const x = rec(id); x.f = x.f ? 0 : 1; save(); return x.f; }
function setNote(id, t) { rec(id).n = t; save(); }
function removeWrong(id) {
  const x = state.q[id]; if (x) { x.w = 0; x.s = state.settings.mastery; x.d = 0; save(); }
}

/* ---------- 遗忘曲线调度 ---------- */
function schedule(id, correct) {
  const x = rec(id);
  if (correct) {
    x.s += 1;
    const iv = INTERVALS[Math.min(x.s - 1, INTERVALS.length - 1)];
    x.i = iv;
    x.d = now() + iv * DAY;
  } else {
    x.s = 0; x.i = 0; x.d = now();
  }
  x.l = now();
  return x;
}
function dueIds(ts) {
  ts = ts || now();
  const out = [];
  for (const id in state.q) {
    const x = state.q[id];
    if (x.d && x.d <= ts && x.s < state.settings.mastery) out.push(+id);
  }
  return out;
}
function dueCount(ts) {
  ts = ts || now(); let c = 0;
  for (const id in state.q) {
    const x = state.q[id];
    if (x.d && x.d <= ts && x.s < state.settings.mastery) c++;
  }
  return c;
}

/* ---------- 作答记录 ---------- */
function answer(id, correct, ms) {
  const x = schedule(id, correct);
  if (correct) x.r += 1; else x.w += 1;
  const dk = todayStr();
  const day = state.days[dk] || (state.days[dk] = { a: 0, c: 0, t: 0 });
  day.a += 1; if (correct) day.c += 1;
  if (ms) day.t += ms;
  if (state.daily.date !== dk) state.daily = freshDaily();
  state.daily.done += 1;
  save();
  return x;
}
// 背题/闪卡的三档反馈：0 不认识 1 模糊 2 认识
function grade(id, g) {
  const correct = g > 0;
  const x = schedule(id, correct);
  if (g === 2) x.r += 1; else x.w += 1;
  bumpDay(correct);
  return x;
}
function bumpDay(correct) {
  const dk = todayStr();
  const day = state.days[dk] || (state.days[dk] = { a: 0, c: 0, t: 0 });
  day.a += 1; if (correct) day.c += 1;
  if (state.daily.date !== dk) state.daily = freshDaily();
  state.daily.done += 1; save();
}

/* ---------- 题库池构建 ---------- */
function buildPool(o) {
  o = o || {};
  const depts = o.depts && o.depts.length ? o.depts : null;
  const types = o.types && o.types.length ? o.types : null;
  let ids = [];
  for (let i = 0; i < N; i++) {
    const row = QBANK.r[i];
    if (depts && depts.indexOf(row[0]) < 0) continue;
    if (types && types.indexOf(row[1]) < 0) continue;
    if (o.onlyWrong && !isWrong(i)) continue;
    if (o.onlyFav && !(state.q[i] && state.q[i].f)) continue;
    if (o.onlyDue) {
      const x = state.q[i];
      if (!x || !x.d || x.d > now() || x.s >= state.settings.mastery) continue;
    }
    ids.push(i);
  }
  if (o.range && (o.range[0] > 1 || o.range[1] < ids.length)) {
    const a = Math.max(1, o.range[0]) - 1;
    const b = Math.min(ids.length, o.range[1]);
    ids = ids.slice(a, b);
  }
  return ids;
}

/* ---------- 统计 ---------- */
function totals() {
  let seen = 0, mastered = 0, wrong = 0, r = 0, w = 0, favN = 0;
  for (const id in state.q) {
    const x = state.q[id];
    if (x.r + x.w > 0) seen++;
    if (x.s >= state.settings.mastery && (x.r + x.w > 0)) mastered++;
    if (isWrong(id)) wrong++;
    if (x.f) favN++;
    r += x.r; w += x.w;
  }
  return { total: N, seen, mastered, wrong, r, w, fav: favN, acc: r + w ? r / (r + w) : 0 };
}
function byGroup(kind) {
  const nG = kind === 'dept' ? QBANK.d.length : QBANK.t.length;
  const g = Array.from({ length: nG }, () => ({ r: 0, w: 0, seen: 0, mastered: 0 }));
  for (const id in state.q) {
    const row = QBANK.r[id];
    const k = kind === 'dept' ? row[0] : row[1];
    const x = state.q[id];
    g[k].r += x.r; g[k].w += x.w;
    if (x.r + x.w > 0) g[k].seen++;
    if (x.s >= state.settings.mastery) g[k].mastered++;
  }
  return g.map((x, i) => ({
    name: kind === 'dept' ? QBANK.d[i] : QBANK.t[i],
    acc: x.r + x.w ? x.r / (x.r + x.w) : null,
    seen: x.seen, mastered: x.mastered,
    total: countAll(kind, i)
  }));
}
function countAll(kind, k) {
  let c = 0;
  for (const row of QBANK.r) if (row[kind === 'dept' ? 0 : 1] === k) c++;
  return c;
}
function dayStreak() {
  const set = new Set(Object.keys(state.days).filter(k => state.days[k].a > 0));
  let streak = 0;
  const d = new Date();
  if (!set.has(todayStr(d))) d.setDate(d.getDate() - 1);
  while (set.has(todayStr(d))) { streak++; d.setDate(d.getDate() - 1); }
  return streak;
}
function lastDays(n) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const k = todayStr(d);
    out.push({ date: k, day: d.getDay(), data: state.days[k] || null });
  }
  return out;
}

/* ---------- 设置 ---------- */
function settings() { return state.settings; }
function updateSettings(patch) {
  Object.assign(state.settings, patch);
  saveNow();
}
function exportJSON() { return JSON.stringify(state); }
function importJSON(txt) {
  const s = JSON.parse(txt);
  if (s.v !== 1) throw new Error('版本不符');
  state = s;
  state.settings = Object.assign({}, DEFAULT_SETTINGS, s.settings || {});
  saveNow();
}
function resetAll() {
  state = { v: 1, q: {}, days: {}, eggs: {}, settings: Object.assign({}, DEFAULT_SETTINGS), daily: freshDaily() };
  saveNow();
}
function clearDays() { state.days = {}; saveNow(); }

window.Store = {
  N, KEY,
  Q, typeName, deptName,
  rec, isMastered, isWrong, isSeen, fav, setNote, removeWrong,
  schedule, dueIds, dueCount,
  answer, grade, bumpDay,
  buildPool, totals, byGroup, dayStreak, lastDays,
  settings, updateSettings, exportJSON, importJSON, resetAll, clearDays,
  todayStr, save: saveNow,
  raw: () => state
};
})();
