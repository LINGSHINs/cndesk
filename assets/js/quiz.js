/* ============================================================
   书桌 · quiz.js — 通用 UI 工具 + 刷题引擎 + 组卷考试
   ============================================================ */
(function () {
'use strict';

/* ---------- DOM 工具 ---------- */
function h(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}
function mount(node) {
  const v = document.getElementById('view');
  v.innerHTML = '';
  v.appendChild(node);
  window.scrollTo(0, 0);
}
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const shuffle = arr => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const fmtTime = sec => {
  sec = Math.max(0, Math.round(sec));
  const m = Math.floor(sec / 60), s = sec % 60;
  return (m > 9 ? m : '0' + m) + ':' + (s > 9 ? s : '0' + s);
};
function ringSVG(pct, size, sw, color) {
  size = size || 120; sw = sw || 10;
  const r = (size - sw) / 2;
  const c = 2 * Math.PI * r;
  pct = Math.max(0, Math.min(1, pct));
  return '<svg width="' + size + '" height="' + size + '">' +
    '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" stroke="var(--surface-2)" stroke-width="' + sw + '" fill="none"/>' +
    '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" stroke="' + (color || 'var(--accent)') + '" stroke-width="' + sw + '" fill="none"' +
    ' stroke-linecap="round" stroke-dasharray="' + c + '" stroke-dashoffset="' + c * (1 - pct) + '" style="transition:stroke-dashoffset .8s var(--ease)"/></svg>';
}

/* ---------- Toast / Sheet / Modal ---------- */
function toast(msg) {
  const root = document.getElementById('toast-root');
  const n = h('<div class="toast">' + esc(msg) + '</div>');
  root.appendChild(n);
  setTimeout(() => n.remove(), 2300);
}
function sheet(content) {
  const root = document.getElementById('sheet-root');
  const wrap = h('<div class="scrim"></div>');
  const panel = h('<div class="sheet"><div class="sheet-grip"></div></div>');
  if (typeof content === 'string') panel.appendChild(h(content));
  else panel.appendChild(content);
  root.appendChild(wrap); root.appendChild(panel);
  requestAnimationFrame(() => { wrap.classList.add('show'); panel.classList.add('show'); });
  let closed = false;
  const close = () => {
    if (closed) return; closed = true;
    wrap.classList.remove('show'); panel.classList.remove('show');
    setTimeout(() => { wrap.remove(); panel.remove(); }, 380);
  };
  wrap.addEventListener('click', close);
  return { close, panel, wrap };
}
function modal(htmlStr) {
  const root = document.getElementById('sheet-root');
  const wrap = h('<div class="scrim"></div>');
  const box = h('<div class="modal">' + htmlStr + '</div>');
  root.appendChild(wrap); root.appendChild(box);
  requestAnimationFrame(() => { wrap.classList.add('show'); box.classList.add('show'); });
  let closed = false;
  const close = () => {
    if (closed) return; closed = true;
    wrap.classList.remove('show'); box.classList.remove('show');
    setTimeout(() => { wrap.remove(); box.remove(); }, 320);
  };
  wrap.addEventListener('click', close);
  return { close, box, wrap };
}

window.UI = { h, mount, esc, shuffle, fmtTime, ringSVG, toast, sheet, modal };

/* ============================================================
   刷题引擎
   cfg = { title, ids, mode, quick(秒), loop, memorize, select, auto, exitHash }
   ============================================================ */
let active = null;
function stop() { if (active) active.destroy(); active = null; }

class Runner {
  constructor(cfg) {
    this.cfg = Object.assign({ exitHash: '#/hub', auto: false }, cfg);
    this.queue = cfg.ids.slice();
    this.pos = 0;
    this.results = new Map();          // id → { ok, chosen, g }
    this.chosen = [];
    this.locked = false;
    this.auto = !!cfg.auto;
    this.sessR = 0; this.sessW = 0;
    this.startTs = Date.now();
    this.qStart = Date.now();
    this.wrongCounts = {};
    this.timers = [];
    this.dir = '';
  }
  start() {
    active = this;
    if (!this.queue.length) { this.empty(); return; }
    this.root = h('<div class="runner"></div>');
    mount(this.root);
    this.render();
  }
  destroy() {
    this.timers.forEach(t => { clearInterval(t); clearTimeout(t); });
    this.timers = [];
  }
  curId() { return this.queue[this.pos]; }

  /* ---------- 渲染 ---------- */
  render() {
    const id = this.curId();
    const q = Store.Q(id);
    const total = this.cfg.loop ? this.queue.length : this.queue.length;
    const doneN = this.results.size;
    const head = h(
      '<div class="quiz-head">' +
        '<button class="icon-btn" data-act="exit" aria-label="退出">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h9M17 9l3 3-3 3M20 12H9"/></svg>' +
        '</button>' +
        '<div class="qh-progress">' +
          '<div class="flex aic jcb"><span class="qh-count">' + this.headerText(q) + '</span>' +
          '<span class="muted small" id="q-timer-lab"></span></div>' +
          '<div class="mini-track"><div class="mini-fill" style="width:' + (this.cfg.loop ? this.loopPct() : (this.pos / this.queue.length * 100)) + '%"></div></div>' +
        '</div>' +
        (this.cfg.select ? '<button class="icon-btn" data-act="card" aria-label="答题卡"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h2M14 8h2M8 12h2M14 12h2M8 16h2M14 16h2"/></svg></button>' : '<span style="width:40px"></span>') +
      '</div>');

    const card = h(
      '<div class="card q-card ' + this.dir + '">' +
        '<div class="q-meta">' +
          '<span class="badge">' + Store.typeName(q.type) + '</span>' +
          '<span class="badge glass">' + Store.deptName(q.dept) + '</span>' +
          '<span class="muted small">部门题号 ' + q.no + '</span>' +
        '</div>' +
        '<div class="q-text">' + esc(q.q) + '</div>' +
        '<div class="q-body"></div>' +
      '</div>');

    const actions = h(
      '<div class="quiz-actions">' +
        '<button class="btn" data-act="prev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>上一题</button>' +
        '<button class="chip ' + (this.auto ? 'on' : '') + '" data-act="auto">自动前进</button>' +
        '<div class="spacer"></div>' +
        '<button class="btn btn-primary" data-act="next" disabled>下一题<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>' +
      '</div>');

    this.root.innerHTML = '';
    this.root.append(head, card, actions);

    if (this.cfg.loop) actions.querySelector('[data-act=prev]').style.visibility = 'hidden';
    head.querySelector('[data-act=exit]').onclick = () => { location.hash = this.cfg.exitHash; };
    const cardBtn = head.querySelector('[data-act=card]');
    if (cardBtn) cardBtn.onclick = () => this.openCard();
    actions.querySelector('[data-act=prev]').onclick = () => this.prev();
    actions.querySelector('[data-act=next]').onclick = () => this.next();
    actions.querySelector('[data-act=auto]').onclick = e => {
      this.auto = !this.auto;
      e.currentTarget.classList.toggle('on', this.auto);
    };

    this.cardEl = card;
    this.bodyEl = card.querySelector('.q-body');
    this.nextBtn = actions.querySelector('[data-act=next]');
    this.prevBtn = actions.querySelector('[data-act=prev]');

    const saved = this.results.get(id);
    this.qStart = Date.now();
    if (saved) {
      this.chosen = saved.chosen.slice();
      this.locked = true;
      this.paintQuestion(q);
      this.showFeedback(q, saved.ok, saved);
      this.nextBtn.disabled = false;
    } else {
      this.chosen = []; this.locked = false;
      this.paintQuestion(q);
      if (this.cfg.memorize) this.paintMemorize(q);
    }
    if (this.cfg.quick && !saved) this.startQuick(q, this.cfg.quick);
    if (!this.cfg.loop) this.prevBtn.disabled = this.pos === 0;
  }

  headerText(q) {
    if (this.cfg.loop) {
      const mastered = Store.totals().mastered;
      return '循环 · 剩余 ' + this.queue.length + ' · 已掌握 ' + mastered;
    }
    return this.cfg.title + ' · ' + (this.pos + 1) + ' / ' + this.queue.length;
  }
  loopPct() {
    const total0 = this.cfg.ids.length;
    return ((total0 - this.queue.length) / total0 * 100).toFixed(1);
  }

  /* ---------- 题目选项 ---------- */
  paintQuestion(q) {
    const b = this.bodyEl;
    b.innerHTML = '';
    if (q.type === 1) {
      const grid = h('<div class="judge-grid"></div>');
      q.opts.forEach((t, i) => {
        const L = String.fromCharCode(65 + i);
        const btn = h('<button class="judge-btn" data-l="' + L + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">' +
          (i === 0 ? '<path d="M20 6 9 17l-5-5"/>' : '<path d="M18 6 6 18M6 6l12 12"/>') + '</svg>' + esc(t) + '</button>');
        btn.onclick = () => this.commit([L]);
        grid.appendChild(btn);
      });
      b.appendChild(grid);
    } else {
      const multi = q.type === 2;
      q.opts.forEach((t, i) => {
        const L = String.fromCharCode(65 + i);
        const o = h('<button class="opt" data-l="' + L + '"><span class="letter">' + L + '</span><span class="ot">' + esc(t) + '</span></button>');
        o.onclick = () => {
          if (this.locked) return;
          if (multi) {
            const idx = this.chosen.indexOf(L);
            if (idx >= 0) this.chosen.splice(idx, 1); else this.chosen.push(L);
            o.classList.toggle('selected');
            if (this._multiTick) this._multiTick();
          } else {
            this.chosen = [L];
            this.commit([L]);
          }
        };
        b.appendChild(o);
      });
      if (multi) {
        const row = h('<div class="mt12"><button class="btn btn-primary btn-block" disabled data-act="confirm">确认提交（多选）</button></div>');
        const btn = row.querySelector('button');
        btn.onclick = () => { if (this.chosen.length) this.commit(this.chosen.slice()); };
        const tick = () => btn.disabled = this.chosen.length === 0;
        this._multiTick = tick; tick();
        b.appendChild(row);
      }
    }
    // 恢复选中态
    if (this.locked) this.lockPaint(q);
  }

  /* ---------- 背题模式 ---------- */
  paintMemorize(q) {
    const veil = h('<div class="mt16 center"><button class="btn btn-primary btn-lg" data-act="reveal">点击显示答案</button></div>');
    this.bodyEl.appendChild(veil);
    veil.querySelector('button').onclick = () => {
      veil.remove();
      this.lockPaint(q, true);
      const gradeRow = h('<div class="chip-row mt16 jcb" style="justify-content:center">' +
        '<button class="chip" data-g="0">不认识</button>' +
        '<button class="chip" data-g="1">模糊</button>' +
        '<button class="chip on" data-g="2">认识</button></div>');
      gradeRow.querySelectorAll('button').forEach(b => b.onclick = () => {
        const g = +b.dataset.g;
        Store.grade(this.curId(), g);
        this.results.set(this.curId(), { ok: g > 0, chosen: q.ans.slice(), g });
        if (g === 2) this.sessR++; else this.sessW++;
        FX.play(g === 2 ? 'ok' : 'bad');
        this.nextBtn.disabled = false;
        this.locked = true;
        this.afterGrade(q, g);
      });
      this.bodyEl.appendChild(gradeRow);
    };
  }
  afterGrade(q, g) {
    const f = h('<div class="feedback ' + (g === 2 ? 'good' : 'bad') + ' mt12"><b>' + ['背下来了吗？','再记一记','很好，已记入复习计划'][g] + '</b>' +
      '<p>正确答案：<span class="ans-line">' + q.ans.join('') + '</span> · 下次复习按遗忘曲线自动安排</p></div>');
    this.cardEl.appendChild(f);
    if (this.auto) this.later(() => this.next(), 1400);
  }

  /* ---------- 提交判定 ---------- */
  commit(letters, timeout) {
    if (this.locked) return;
    this.locked = true;
    const id = this.curId();
    const q = Store.Q(id);
    const correct = sameSet(letters, q.ans);
    const ms = Date.now() - this.qStart;
    Store.answer(id, correct, ms);
    this.results.set(id, { ok: correct, chosen: letters.slice(), timeout: !!timeout });
    if (correct) this.sessR++; else { this.sessW++; this.wrongCounts[id] = (this.wrongCounts[id] || 0) + 1; }
    FX.play(correct ? 'ok' : 'bad');
    const r = Store.rec(id);
    const rect = this.cardEl.getBoundingClientRect();
    FX.burst(rect.left + rect.width / 2, rect.top + rect.height * .4, correct);
    if (!correct) {
      this.cardEl.classList.add('shake');
      setTimeout(() => this.cardEl.classList.remove('shake'), 450);
    }
    this.lockPaint(q);
    this.showFeedback(q, correct, { chosen: letters, timeout: !!timeout });
    this.nextBtn.disabled = false;
    if (this.cfg.loop) this.loopReschedule(id, correct);
    if (this.auto) this.later(() => this.next(), correct ? 850 : 1900);
    this.goalCheck();
  }

  lockPaint(q, noDisable) {
    const opts = this.bodyEl.querySelectorAll('.opt');
    opts.forEach(el => {
      el.classList.add('locked');
      const L = el.dataset.l;
      if (q.ans.indexOf(L) >= 0) el.classList.add('correct');
      if (this.chosen.indexOf(L) >= 0 && q.ans.indexOf(L) < 0) el.classList.add('wrong');
    });
    this.bodyEl.querySelectorAll('.judge-btn').forEach(el => {
      const L = el.dataset.l;
      el.classList.add('locked');
      el.classList.remove('sel-c', 'sel-w');
      if (q.ans.indexOf(L) >= 0) el.classList.add('sel-c');
      if (this.chosen.indexOf(L) >= 0 && q.ans.indexOf(L) < 0) el.classList.add('sel-w');
    });
  }

  showFeedback(q, correct, saved) {
    const old = this.cardEl.querySelector('.feedback');
    if (old) old.remove();
    const r = Store.rec(this.curId());
    const timeoutTag = saved.timeout ? '<span class="badge bad">超时</span>' : '';
    const f = h('<div class="feedback ' + (correct ? 'good' : 'bad') + '">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
          (correct ? '<path d="M20 6 9 17l-5-5"/>' : '<path d="M12 9v4M12 17h.01"/><circle cx="12" cy="12" r="9"/>') + '</svg>' +
        '<div style="flex:1"><b>' + (correct ? '回答正确' : '回答错误') + ' ' + timeoutTag + '</b>' +
        '<p>正确答案 <span class="ans-line">' + q.ans.join('') + '</span> · 历史答对 ' + r.r + ' 次 / 答错 ' + r.w + ' 次' +
        (r.s >= Store.settings().mastery ? ' · 已掌握' : ' · 连对 ' + r.s + ' 次') + '</p>' +
        '<div class="f-actions">' +
          '<button class="chip" data-act="fav">' + (r.f ? '已收藏' : '收藏本题') + '</button>' +
          '<button class="chip" data-act="note">笔记</button>' +
        '</div></div></div>');
    f.querySelector('[data-act=fav]').onclick = e => {
      Store.fav(this.curId());
      e.currentTarget.textContent = '已收藏';
    };
    f.querySelector('[data-act=note]').onclick = () => this.openNote(q);
    this.cardEl.appendChild(f);
  }

  openNote(q) {
    const r = Store.rec(this.curId());
    const node = h('<div><h3>本题笔记</h3><textarea class="input" rows="5" placeholder="记下你的理解…">' + esc(r.n) + '</textarea>' +
      '<div class="mt16 flex gap12"><button class="btn btn-ghost" data-a="cancel">取消</button><button class="btn btn-primary" data-a="save" style="margin-left:auto">保存</button></div></div>');
    const s = sheet(node);
    node.querySelector('[data-a=cancel]').onclick = s.close;
    node.querySelector('[data-a=save]').onclick = () => {
      Store.setNote(this.curId(), node.querySelector('textarea').value);
      toast('笔记已保存'); s.close();
    };
  }

  /* ---------- 循环调度 ---------- */
  loopReschedule(id, correct) {
    if (correct && Store.isMastered(id)) {
      this._drop = true;                 // 下一题时移除
    } else if (!correct) {
      const wc = this.wrongCounts[id] || 1;
      const delay = Math.min(this.queue.length - 1, 3 * Math.pow(2, wc - 1));
      this._reinsertDelay = Math.max(1, delay);
    }
  }

  /* ---------- 翻页 ---------- */
  next() {
    if (this.cfg.loop) {
      // 处理队首
      const id = this.queue.shift();
      if (!this._drop && this._reinsertDelay) {
        const at = Math.min(this.queue.length, this._reinsertDelay);
        this.queue.splice(at, 0, id);
      }
      this._drop = false; this._reinsertDelay = 0;
      if (!this.queue.length) { this.finish(true); return; }
      this.pos = 0;
    } else {
      this.pos += 1;
      if (this.pos >= this.queue.length) { this.finish(false); return; }
    }
    this.dir = '';
    this.chosen = []; this.locked = false;
    this.render();
  }
  prev() {
    if (this.cfg.loop || this.pos === 0) return;
    this.pos -= 1; this.dir = 'back';
    const s = this.results.get(this.curId());
    this.chosen = s ? s.chosen.slice() : [];
    this.locked = !!s;
    this.render();
  }

  /* ---------- 答题卡 ---------- */
  openCard() {
    const node = h('<div><h3>答题卡</h3><div class="answer-card"></div></div>');
    const grid = node.querySelector('.answer-card');
    this.queue.forEach((id, i) => {
      const r = this.results.get(id);
      let cls = '';
      if (Store.isMastered(id)) cls = 'mastered';
      else if (r) cls = r.ok ? 'done' : 'fail';
      if (i === this.pos) cls += ' current';
      const c = h('<button class="ac-cell ' + cls + '">' + (i + 1) + '</button>');
      c.onclick = () => {
        s.close();
        if (i !== this.pos) {
          this.pos = i; this.dir = '';
          const sv = this.results.get(id);
          this.chosen = sv ? sv.chosen.slice() : [];
          this.locked = !!sv;
          this.render();
        }
      };
      grid.appendChild(c);
    });
    const s = sheet(node);
  }

  /* ---------- 快答倒计时 ---------- */
  startQuick(q, sec) {
    let left = sec;
    const ring = h('<div class="timer-ring">' + quickSVG(sec / sec) + '<b>' + sec + '</b></div>');
    const head = this.root.querySelector('.quiz-head');
    head.querySelector('.qh-progress').before(ring);
    const iv = setInterval(() => {
      left -= .1;
      const fg = ring.querySelector('circle[data-fg]');
      const c = 2 * Math.PI * 22;
      fg.setAttribute('stroke-dashoffset', c * (1 - Math.max(0, left / sec)));
      ring.querySelector('b').textContent = Math.ceil(Math.max(0, left));
      if (left <= 0) {
        clearInterval(iv);
        if (!this.locked) {
          this.chosen = [];
          this.commit([], true);
          this.later(() => this.next(), 1400);
        }
      }
    }, 100);
    this.timers.push(iv);
  }

  later(fn, ms) {
    const t = setTimeout(() => { if (active === this) fn(); }, ms);
    this.timers.push(t);
    return t;
  }

  goalCheck() {
    const st = Store.raw();
    const dk = Store.todayStr();
    if (st.daily.date === dk && st.daily.done === Store.settings().dailyGoal) {
      toast('今日目标达成，继续保持');
    }
  }

  empty() {
    mount(h('<div class="empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M8 15h8M9 9h.01M15 9h.01"/></svg>' +
      '<p>这里还没有题目，换个筛选条件试试</p><div class="mt16"><a class="btn btn-primary" href="#/hub">去选模式</a></div></div>'));
  }

  /* ---------- 结算 ---------- */
  finish(allMastered) {
    const sec = (Date.now() - this.startTs) / 1000;
    const answered = this.sessR + this.sessW;
    const acc = answered ? this.sessR / answered : 0;
    const msg = allMastered ? '全部掌握，队列清空' :
      acc >= .9 ? '近乎完美' : acc >= .7 ? '表现不错' : acc > 0 ? '继续加油' : '完成';
    const node = h('<div class="card center" style="max-width:560px;margin:20px auto">' +
      '<h2 class="mt8">' + (allMastered ? '循环完成' : this.cfg.title + ' · 完成') + '</h2>' +
      '<div class="ring-wrap mt24">' + ringSVG(acc, 170, 14) +
        '<div class="ring-center"><b>' + Math.round(acc * 100) + '%</b><span>正确率</span></div></div>' +
      '<h3 class="mt16">' + msg + '</h3>' +
      '<div class="grid g3 mt24">' +
        '<div class="kpi-card center"><b>' + answered + '</b><span>作答</span></div>' +
        '<div class="kpi-card center"><b>' + this.sessR + '</b><span>答对</span></div>' +
        '<div class="kpi-card center"><b>' + fmtTime(sec) + '</b><span>用时</span></div>' +
      '</div>' +
      '<div class="flex gap12 mt24" style="justify-content:center;flex-wrap:wrap">' +
        '<a class="btn" href="#/hub">返回模式</a>' +
        '<button class="btn btn-primary" data-act="retry">再来一组</button>' +
      '</div></div>');
    mount(node);
    if (acc >= .8) celebrate();
    node.querySelector('[data-act=retry]').onclick = () => {
      if (this.cfg.onRetry) this.cfg.onRetry();
    };
  }
}

function sameSet(a, b) {
  if (a.length !== b.length) return false;
  const x = a.slice().sort(), y = b.slice().sort();
  return x.every((v, i) => v === y[i]);
}
function quickSVG(pct) {
  const c = 2 * Math.PI * 22;
  return '<svg width="52" height="52"><circle cx="26" cy="26" r="22" fill="none" stroke="var(--surface-2)" stroke-width="4"/>' +
    '<circle data-fg cx="26" cy="26" r="22" fill="none" stroke="var(--accent)" stroke-width="4" stroke-linecap="round"' +
    ' stroke-dasharray="' + c + '" stroke-dashoffset="0" transform="rotate(-90 26 26)"/></svg>';
}
function celebrate() {
  for (let i = 0; i < 5; i++) {
    setTimeout(() => FX.burst(window.innerWidth * (0.15 + i * .18), window.innerHeight * .35, true), i * 180);
  }
}

/* ============================================================
   组卷考试
   cfg = { title, ids, duration(秒,0不限) }
   ============================================================ */
class Exam {
  constructor(cfg) {
    this.cfg = cfg;
    this.pos = 0;
    this.answers = new Map();
    this.startTs = Date.now();
    this.timers = [];
  }
  start() {
    active = this;
    this.root = h('<div class="exam"></div>');
    mount(this.root);
    this.render();
    if (this.cfg.duration) {
      let left = this.cfg.duration;
      const iv = setInterval(() => {
        left -= 1;
        const lab = this.root.querySelector('#exam-time');
        if (lab) lab.textContent = fmtTime(left);
        if (left <= 0) { clearInterval(iv); this.submit(true); }
      }, 1000);
      this.timers.push(iv);
    }
  }
  destroy() { this.timers.forEach(clearInterval); }
  render() {
    const q = Store.Q(this.cfg.ids[this.pos]);
    const answeredN = this.answers.size;
    const head = h('<div class="quiz-head">' +
      '<button class="icon-btn" data-act="exit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h9M17 9l3 3-3 3M20 12H9"/></svg></button>' +
      '<div class="qh-progress"><div class="flex jcb aic"><span class="qh-count">' + esc(this.cfg.title) + ' · ' + (this.pos + 1) + '/' + this.cfg.ids.length + '</span>' +
      '<span class="chip-row" style="gap:8px"><span class="chip" id="exam-time">' + (this.cfg.duration ? fmtTime(this.cfg.duration) : '不限时') + '</span>' +
      '<span class="chip">已答 ' + answeredN + '</span></span></div>' +
      '<div class="mini-track"><div class="mini-fill" style="width:' + ((this.pos + 1) / this.cfg.ids.length * 100 + '%') + '"></div></div></div>' +
      '<button class="btn btn-primary btn-sm" data-act="submit">交卷</button></div>');

    const card = h('<div class="card q-card"><div class="q-meta"><span class="badge">' + Store.typeName(q.type) + '</span>' +
      '<span class="badge glass">' + Store.deptName(q.dept) + '</span></div>' +
      '<div class="q-text">' + esc(q.q) + '</div><div class="q-body"></div></div>');

    const actions = h('<div class="quiz-actions"><button class="btn" data-act="card"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>答题卡</button>' +
      '<div class="spacer"></div><button class="btn" data-act="prev">上一题</button><button class="btn btn-primary" data-act="next">下一题</button></div>');

    this.root.innerHTML = '';
    this.root.append(head, card, actions);
    head.querySelector('[data-act=exit]').onclick = () => this.confirmExit();
    head.querySelector('[data-act=submit]').onclick = () => this.submit(false);
    actions.querySelector('[data-act=prev]').onclick = () => this.jump(this.pos - 1);
    actions.querySelector('[data-act=next]').onclick = () => this.jump(this.pos + 1);
    actions.querySelector('[data-act=card]').onclick = () => this.openCard();

    this.bodyEl = card.querySelector('.q-body');
    this.paintOptions(q);
  }

  paintOptions(q) {
    const b = this.bodyEl; b.innerHTML = '';
    const cur = this.answers.get(this.pos) || [];
    if (q.type === 1) {
      const grid = h('<div class="judge-grid"></div>');
      q.opts.forEach((t, i) => {
        const L = String.fromCharCode(65 + i);
        const btn = h('<button class="judge-btn ' + (cur.indexOf(L) >= 0 ? 'sel-c' : '') + '" data-l="' + L + '"><b>' + esc(t) + '</b></button>');
        btn.onclick = () => this.setAns([L]);
        grid.appendChild(btn);
      });
      b.appendChild(grid);
    } else {
      q.opts.forEach((t, i) => {
        const L = String.fromCharCode(65 + i);
        const o = h('<button class="opt ' + (cur.indexOf(L) >= 0 ? 'selected' : '') + '" data-l="' + L + '"><span class="letter">' + L + '</span><span class="ot">' + esc(t) + '</span></button>');
        o.onclick = () => {
          if (q.type === 2) {
            let a = (this.answers.get(this.pos) || []).slice();
            const i2 = a.indexOf(L);
            if (i2 >= 0) a.splice(i2, 1); else a.push(L);
            this.answers.set(this.pos, a);
            o.classList.toggle('selected');
          } else this.setAns([L]);
        };
        b.appendChild(o);
      });
    }
  }
  setAns(letters) {
    this.answers.set(this.pos, letters);
    const q = Store.Q(this.cfg.ids[this.pos]);
    if (q.type === 1) {
      this.bodyEl.querySelectorAll('.judge-btn').forEach(b => b.classList.toggle('sel-c', b.dataset.l === letters[0]));
    } else this.bodyEl.querySelectorAll('.opt').forEach(o => o.classList.toggle('selected', o.dataset.l === letters[0]));
    FX.click();
  }
  jump(i) {
    if (i < 0 || i >= this.cfg.ids.length) return;
    this.pos = i; this.render();
  }
  openCard() {
    const node = h('<div><h3>答题卡</h3><div class="answer-card"></div></div>');
    const grid = node.querySelector('.answer-card');
    this.cfg.ids.forEach((id, i) => {
      const has = this.answers.has(i);
      const c = h('<button class="ac-cell ' + (has ? 'done' : '') + ' ' + (i === this.pos ? 'current' : '') + '">' + (i + 1) + '</button>');
      c.onclick = () => { s.close(); this.jump(i); };
      grid.appendChild(c);
    });
    const s = sheet(node);
  }

  confirmExit() {
    const m = modal('<h3>离开考试？</h3><p class="muted">当前答卷不会保存，也不会计入统计</p><div class="mt16 flex gap12"><button class="btn" data-a="stay">继续答题</button><button class="btn btn-danger" data-a="out" style="margin-left:auto">离开</button></div>');
    m.box.querySelector('[data-a=stay]').onclick = m.close;
    m.box.querySelector('[data-a=out]').onclick = () => { location.hash = '#/hub'; };
  }

  submit(auto) {
    const missing = this.cfg.ids.length - this.answers.size;
    const doSubmit = () => this.grade();
    if (auto || missing === 0) doSubmit();
    else {
      const m = modal('<h3>确认交卷？</h3><p class="muted">还有 ' + missing + ' 题未作答，将按答错处理</p>' +
        '<div class="mt16 flex gap12"><button class="btn" data-a="back">再检查一下</button><button class="btn btn-primary" data-a="ok" style="margin-left:auto">确认交卷</button></div>');
      m.box.querySelector('[data-a=back]').onclick = m.close;
      m.box.querySelector('[data-a=ok]').onclick = () => { m.close(); doSubmit(); };
    }
  }

  grade() {
    let r = 0, w = 0;
    const rows = [];
    this.cfg.ids.forEach((id, i) => {
      const q = Store.Q(id);
      const chosen = this.answers.get(i) || [];
      const ok = sameSet(chosen, q.ans);
      Store.answer(id, ok);
      if (ok) r++; else w++;
      rows.push({ id, q, chosen, ok });
    });
    this.report(rows, r, w);
  }

  report(rows, r, w) {
    const total = rows.length;
    const acc = r / total;
    const sec = (Date.now() - this.startTs) / 1000;
    const onlyWrong = h('<button class="chip" id="wrong-filter">只看错题 (' + w + ')</button>');
    const node = h('<div class="exam-report">' +
      '<div class="card center"><h2>成绩单</h2>' +
        '<div class="ring-wrap mt24">' + ringSVG(acc, 170, 14) +
        '<div class="ring-center"><b>' + Math.round(acc * 100) + '</b><span>得分</span></div></div>' +
        '<div class="grid g3 mt24"><div class="kpi-card center"><b>' + r + '</b><span>答对</span></div>' +
        '<div class="kpi-card center"><b>' + w + '</b><span>答错/漏答</span></div>' +
        '<div class="kpi-card center"><b>' + fmtTime(sec) + '</b><span>用时</span></div></div>' +
        '<div class="flex gap12 mt24" style="justify-content:center;flex-wrap:wrap"><a class="btn" href="#/hub">返回</a>' +
        '<a class="btn btn-primary" href="#/mode/exam">再组一套</a></div></div>' +
      '<div class="section-h"><h2>试卷回顾</h2><div class="spacer"></div>' + onlyWrong.outerHTML + '</div>' +
      '<div id="review-list" class="grid"></div></div>');
    mount(node);
    if (acc >= .8) celebrate();

    const listEl = node.querySelector('#review-list');
    const draw = filterWrong => {
      listEl.innerHTML = '';
      rows.filter(x => !filterWrong || !x.ok).forEach((x, idx) => {
        const c = h('<div class="card"><div class="flex aic gap8 mb12"><span class="badge ' + (x.ok ? 'ok' : 'bad') + '">' + (x.ok ? '正确' : '错误') + '</span>' +
          '<span class="muted small">' + Store.deptName(x.q.dept) + ' · ' + Store.typeName(x.q.type) + '</span></div>' +
          '<div class="q-text" style="font-size:16px">' + esc(x.q.q) + '</div>' +
          '<p class="small mt8">你的答案：<b style="color:' + (x.ok ? 'var(--ok)' : 'var(--bad)') + '">' + (x.chosen.join('') || '未作答') + '</b> · 正确答案：<b style="color:var(--ok)">' + x.q.ans.join('') + '</b></p></div>');
        listEl.appendChild(c);
      });
      if (!listEl.children.length) listEl.appendChild(h('<div class="empty"><p>没有错题，全部答对</p></div>'));
    };
    draw(false);
    node.querySelector('#wrong-filter').onclick = e => {
      const on = e.currentTarget.classList.toggle('on');
      draw(on);
    };
  }
}

/* ---------- 对外接口 ---------- */
window.Quiz = {
  run: cfg => { stop(); new Runner(cfg).start(); },
  exam: cfg => { stop(); new Exam(cfg).start(); },
  stop
};
})();
