/* ============================================================
   书桌 · eggs.js — 彩蛋模式（20 种）
   ============================================================ */
(function () {
'use strict';
const { h, mount, esc, shuffle, fmtTime, ringSVG, toast, sheet, modal } = UI;
function sameSet(a, b) {
  if (a.length !== b.length) return false;
  const x = a.slice().sort(), y = b.slice().sort();
  return x.every((v, i) => v === y[i]);
}
function celebrate(n) {
  for (let i = 0; i < (n || 5); i++) setTimeout(() => FX.burst(window.innerWidth * (0.12 + i * .19), window.innerHeight * .32, true), i * 160);
}

const EGGS = [
  { id: 'boss', name: '王者对战', desc: '与 BOSS 血量对轰，连击放大伤害', use: 'battle' },
  { id: 'speed', name: '闪电侠', desc: '每答一题，下一题时限更短', flags: { shrink: [8, .15, 3] } },
  { id: 'wager', name: '押注大师', desc: '先下注，再答题', flags: { wager: 1 } },
  { id: 'fifty', name: '五十选一', desc: '自动排除两个干扰项', flags: { fifty: 1 } },
  { id: 'danmaku', name: '弹幕冲关', desc: '答案化做弹幕飞过', use: 'danmaku' },
  { id: 'mono6', name: '知识大富翁', desc: '掷骰前进，格中有题', use: 'board' },
  { id: 'mine', name: '题海扫雷', desc: '二十五格，答错踩雷', use: 'mine' },
  { id: 'arena', name: '擂台赛', desc: '三条命，答错即下场', flags: { lives: 3, endless: 1 } },
  { id: 'dictation', name: '听写剧场', desc: '听朗读作答，可重听两次', flags: { tts: 1 } },
  { id: 'versus', name: '双人对决', desc: '两人轮流，先得五分', flags: { dual: 5 } },
  { id: 'blindbox', name: '盲盒', desc: '揭开的信息越少分越高', flags: { blind: 1 } },
  { id: 'timestop', name: '时间静止', desc: '按住时停键，时间为你静止', flags: { timestop: 10 } },
  { id: 'ladder', name: '无限阶梯', desc: '每五题一阶，错题率越高阶越险', flags: { levels: 1, endless: 1 } },
  { id: 'daily', name: '每日试炼', desc: '每天固定十题，考验真功夫', flags: { daily: 10 } },
  { id: 'radio', name: '深夜电台', desc: '暖光夜读，题目轻声朗读', flags: { tts: 1, radio: 1 } },
  { id: 'objection', name: '逆转裁判', desc: '答错可提一次异议改判', flags: { objection: 1 } },
  { id: 'tower', name: '题海塔防', desc: '答题击杀，守住基地', use: 'tower' },
  { id: 'hunger', name: '饥饿游戏', desc: '安全圈不断收缩', flags: { hunger: 12 } },
  { id: 'tetris', name: '俄罗斯方块', desc: '别让正确答案落地', use: 'tetris' },
  { id: 'dice', name: '命运骰子', desc: '骰出加速、加倍或混乱', flags: { dice: 1 } }
];

/* ============================================================
   Egg 通用引擎
   ============================================================ */
class Egg {
  constructor(def, cfg) {
    this.def = def; this.flags = def.flags || {};
    this.ids = cfg.ids.slice();
    this.origIds = this.ids.slice();
    this.pos = 0;
    this.chosen = []; this.locked = false;
    this.coins = 100; this.lives = this.flags.lives || 0;
    this.score = 0; this.level = 1;
    this.turn = 0; this.dualScore = [0, 0];
    this.r = 0; this.w = 0;
    this.startTs = Date.now(); this.qStart = Date.now();
    this.timers = [];
    this.objectionUsed = false;
    this.reveals = 0; this.ttsPlays = 0;
    this.diceTimer = 0;
    if (this.flags.daily) {
      const seed = hashDate(Store.todayStr());
      this.ids = seededShuffle(this.ids, seed).slice(0, this.flags.daily);
    }
  }
  start() {
    if (!this.ids.length) { mount(h('<div class="empty"><p>题目不足</p></div>')); return; }
    this.root = h('<div class="egg-run"></div>');
    mount(this.root);
    this.render();
  }
  destroy() { this.timers.forEach(t => { clearInterval(t); clearTimeout(t); }); speechStop(); }
  curId() { return this.ids[this.pos]; }
  later(fn, ms) { const t = setTimeout(() => fn(), ms); this.timers.push(t); }

  render() {
    const id = this.curId(), q = Store.Q(id);
    this.qStart = Date.now();
    this.objectionUsed = false; this.reveals = 0; this.ttsPlays = 0; this.diceTimer = 0;

    /* 头部 */
    const pills = [];
    if (this.flags.wager || this.flags.blind) pills.push('<span class="coin-pill">' + this.coins + '</span>');
    if (this.flags.lives) pills.push('<span class="chip">生命 ' + this.lives + '</span>');
    if (this.flags.dual) pills.push('<span class="chip" id="turn-lab">玩家 ' + (this.turn + 1) + ' 进攻</span>');
    if (this.flags.levels) pills.push('<span class="chip">第 ' + this.level + ' 阶</span>');
    if (this.flags.daily) pills.push('<span class="chip">' + Store.todayStr() + '</span>');

    const head = h('<div class="quiz-head"><button class="icon-btn" data-a="exit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h9M17 9l3 3-3 3M20 12H9"/></svg></button>' +
      '<div class="qh-progress"><div class="flex jcb aic"><span class="qh-count">' + esc(this.def.name) + ' · ' + (this.pos + 1) + (this.flags.endless ? '' : '/' + this.ids.length) + '</span>' +
      '<span class="chip-row" style="gap:7px">' + pills.join('') + '</span></div>' +
      '<div class="mini-track"><div class="mini-fill" style="width:' + (this.flags.endless ? 40 : this.pos / this.ids.length * 100) + '%"></div></div></div>' +
      '<span id="timer-slot" style="width:52px"></span></div>');
    head.querySelector('[data-a=exit]').onclick = () => location.hash = '#/egg';

    /* 题目卡 */
    const card = h('<div class="card q-card mt12"><div class="q-meta"><span class="badge">' + Store.typeName(q.type) + '</span>' +
      '<span class="badge glass">' + Store.deptName(q.dept) + '</span>' +
      (this.flags.tts ? '<button class="chip" data-a="speak" style="margin-left:auto">朗读题目 (2)</button>' : '') + '</div>' +
      '<div id="q-text-slot"><div class="q-text">' + esc(q.q) + '</div></div>' +
      '<div class="q-body"></div><div id="ef-slot"></div></div>');

    const speakBtn = card.querySelector('[data-a=speak]');
    if (speakBtn) speakBtn.onclick = () => this.speak(q, speakBtn);

    this.root.innerHTML = '';
    this.root.append(head, card);
    this.headEl = head; this.cardEl = card;
    this.bodyEl = card.querySelector('.q-body');
    this.efEl = card.querySelector('#ef-slot');

    /* 盲盒：题目先藏起 */
    if (this.flags.blind) {
      const slot = card.querySelector('#q-text-slot');
      slot.innerHTML = '<button class="btn btn-block" data-a="rq">盲盒中：点击揭开题目（-8 分）</button>';
      slot.querySelector('button').onclick = () => {
        this.reveals++;
        slot.innerHTML = '<div class="q-text">' + esc(q.q) + '</div>';
      };
    }

    this.paintOptions(q);

    /* 五十选一 */
    if (this.flags.fifty) this.applyFifty(q);

    /* 押注 */
    if (this.flags.wager) this.wagerUI(q);

    /* 骰子 */
    if (this.flags.dice) this.rollDice(q);

    /* 计时器类 */
    if (this.flags.shrink) this.startShrink(q);
    if (this.flags.hunger) this.startTimer(this.flags.hunger, q, true);
    if (this.flags.timestop) this.startTimestop(q);

    /* 电台 / 听写自动朗读 */
    if (this.flags.radio) this.later(() => this.speak(q, speakBtn), 500);

    /* 无计时器模式的下一题按钮 */
    if (!this.flags.shrink && !this.flags.hunger && !this.flags.timestop && this.diceTimer <= 0) {
      const nav = h('<div class="quiz-actions"><div class="spacer"></div><button class="btn btn-primary" data-a="next" disabled>下一题</button></div>');
      this.nextBtn = nav.querySelector('[data-a=next]');
      this.nextBtn.onclick = () => this.goNext();
      this.root.appendChild(nav);
    }
  }

  paintOptions(q) {
    const b = this.bodyEl;
    q.opts.forEach((t, i) => {
      const L = String.fromCharCode(65 + i);
      let o;
      if (this.flags.blind) {
        o = h('<div class="opt" style="padding:0"><button class="btn btn-block" data-l="' + L + '" style="min-height:50px;border-radius:var(--r-m)">选项 ' + L + '（点击揭开 -8 分）</button></div>');
        const btn = o.querySelector('button');
        btn.onclick = () => {
          if (btn.dataset.open) this.pick(q, L, o);
          else {
            this.reveals++;
            btn.dataset.open = '1';
            btn.innerHTML = '<span class="letter">' + L + '</span><span class="ot" style="text-align:left">' + esc(t) + '</span>';
            btn.style.display = 'flex'; btn.style.gap = '13px'; btn.style.alignItems = 'flex-start';
            btn.classList.add('opt'); btn.style.background = 'var(--surface)';
          }
        };
      } else {
        o = h('<button class="opt" data-l="' + L + '"><span class="letter">' + L + '</span><span class="ot">' + esc(t) + '</span></button>');
        o.onclick = () => this.pick(q, L, o);
      }
      b.appendChild(o);
    });
    if (q.type === 2) {
      this.multi = [];
      const c = h('<div class="mt8"><button class="btn btn-primary btn-block" data-a="mc">确认提交</button></div>');
      c.querySelector('button').onclick = () => this.commit(this.multi.slice(), q);
      b.appendChild(c);
    }
  }
  pick(q, L, o) {
    if (this.locked) return;
    if (q.type === 2) {
      o.classList.toggle('selected');
      const i = this.multi.indexOf(L);
      if (i >= 0) this.multi.splice(i, 1); else this.multi.push(L);
    } else this.commit([L], q);
  }

  applyFifty(q) {
    if (q.type === 1) return;
    const wrong = q.opts.map((_, i) => String.fromCharCode(65 + i)).filter(L => q.ans.indexOf(L) < 0);
    const kill = shuffle(wrong).slice(0, q.type === 2 ? 1 : 2);
    this.bodyEl.querySelectorAll('.opt').forEach(o => { if (kill.indexOf(o.dataset.l) >= 0) o.classList.add('dim'); });
  }

  /* ---------- 押注 ---------- */
  wagerUI(q) {
    const row = h('<div class="chip-row mt8"><span class="muted small">下注：</span><button class="chip on" data-v="10">10</button><button class="chip" data-v="25">25</button><button class="chip" data-v="50">50%</button></div>');
    this.wager = 10;
    row.querySelectorAll('button').forEach(b => b.onclick = () => {
      row.querySelectorAll('button').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      this.wager = b.dataset.v === '50%' ? Math.round(this.coins * .5) : +b.dataset.v;
    });
    this.bodyEl.before(row);
  }

  /* ---------- 骰子 ---------- */
  rollDice(q) {
    const r = 1 + Math.floor(Math.random() * 6);
    const effects = {
      1: ['急速六秒', 6], 2: ['宽裕十秒', 10], 3: ['答案错位', 'shuffle'],
      4: ['双倍金币', 'double'], 5: ['平安无事', 0], 6: ['命运重骰', 'reroll']
    };
    let [lab, eff] = effects[r];
    if (eff === 'reroll') {
      const r2 = 1 + Math.floor(Math.random() * 5);
      [lab, eff] = [['急速', 6], ['宽裕', 10], ['错位', 'shuffle'], ['双倍', 'double'], ['平安', 0]][r2 - 1];
    }
    this.diceEffect = eff;
    toast('骰子 ' + r + ' · ' + lab);
    if (eff === 'shuffle') {
      const nodes = Array.from(this.bodyEl.querySelectorAll('.opt'));
      nodes.forEach(n => n.remove());
      shuffle(nodes).forEach(n => {
        this.bodyEl.insertBefore(n, this.bodyEl.querySelector('[data-a=mc]') ? this.bodyEl.lastElementChild : null);
      });
    }
    if (typeof eff === 'number' && eff > 0) { this.diceTimer = eff; this.startTimer(eff, q); }
  }

  /* ---------- 计时器 ---------- */
  makeTimerSlot(sec) {
    const slot = this.headEl.querySelector('#timer-slot');
    slot.innerHTML = '<div class="timer-ring">' +
      '<svg width="52" height="52"><circle cx="26" cy="26" r="22" fill="none" stroke="var(--surface-2)" stroke-width="4"/>' +
      '<circle data-fg cx="26" cy="26" r="22" fill="none" stroke="var(--accent)" stroke-width="4" stroke-linecap="round"' +
      ' stroke-dasharray="138.2" transform="rotate(-90 26 26)"/></svg><b>' + sec + '</b></div>';
    this.tRing = slot.querySelector('[data-fg]');
    this.tLab = slot.querySelector('b');
  }
  startTimer(sec, q, hunger) {
    let left = sec;
    this.makeTimerSlot(sec);
    if (hunger) this.tRing.setAttribute('stroke', 'var(--bad)');
    const iv = setInterval(() => {
      left -= .1;
      this.tRing.setAttribute('stroke-dashoffset', 138.2 * (1 - Math.max(0, left / sec)));
      this.tLab.textContent = Math.ceil(Math.max(0, left));
      if (left <= 0) {
        clearInterval(iv);
        if (!this.locked) {
          this.commit([], q, true);
          this.later(() => this.goNext(), 1300);
        }
      }
    }, 100);
    this.timers.push(iv);
  }
  startShrink(q) {
    const [start, step, min] = this.flags.shrink;
    const sec = Math.max(min, start - this.pos * step);
    this.startTimer(sec, q);
  }
  startTimestop(q) {
    let left = this.flags.timestop;
    this.makeTimerSlot(left);
    const iv = setInterval(() => {
      if (this._paused) return;
      left -= .1;
      this.tRing.setAttribute('stroke-dashoffset', 138.2 * (1 - Math.max(0, left / this.flags.timestop)));
      this.tLab.textContent = Math.ceil(Math.max(0, left));
      if (left <= 0) { clearInterval(iv); if (!this.locked) { this.commit([], q, true); this.later(() => this.goNext(), 1300); } }
    }, 100);
    this.timers.push(iv);
    const stopBtn = h('<button class="btn btn-block mt8" data-a="hold" style="min-height:54px">按住：时间静止</button>');
    const b = stopBtn;
    const down = e => { e.preventDefault(); this._paused = true; b.classList.add('btn-primary'); };
    const up = () => { this._paused = false; b.classList.remove('btn-primary'); };
    b.addEventListener('pointerdown', down);
    b.addEventListener('pointerup', up);
    b.addEventListener('pointerleave', up);
    b.addEventListener('pointercancel', up);
    this.root.appendChild(stopBtn);
  }

  /* ---------- 朗读 ---------- */
  speak(q, btn) {
    if (this.ttsPlays >= 2) { toast('重听次数用完'); return; }
    this.ttsPlays++;
    if (btn) btn.textContent = '朗读题目 (' + (2 - this.ttsPlays) + ')';
    speechSay(q.q);
  }

  /* ---------- 判定 ---------- */
  commit(letters, q, timeout) {
    if (this.locked) return;
    this.locked = true;
    const id = this.curId();
    const ok = sameSet(letters, q.ans);
    const ms = Date.now() - this.qStart;
    Store.answer(id, ok, ms);
    FX.play(ok ? 'ok' : 'bad');
    this.lockVisuals(q, letters);
    FX.burst(window.innerWidth / 2, window.innerHeight * .35, ok);

    if (ok) this.r++; else this.w++;
    if (this.flags.wager) {
      const w = Math.min(this.wager, this.coins);
      this.coins += ok ? w : -w;
    }
    if (this.flags.blind && ok) this.coins += Math.max(0, 40 - this.reveals * 8);
    if (this.diceEffect === 'double') this.coins += ok ? 20 : 0;
    if (this.flags.dual) {
      if (ok) this.dualScore[this.turn]++;
      this.turn = 1 - this.turn;
    }
    if (this.flags.lives && !ok) this.lives--;

    this.showFeedback(q, ok, letters, timeout);
    if (this.nextBtn) this.nextBtn.disabled = false;

    /* 计时器模式自动前进 */
    if (this.flags.shrink || this.flags.hunger || this.flags.timestop || this.diceTimer) {
      this.later(() => this.goNext(), ok ? 900 : 1700);
    }
  }

  lockVisuals(q, chosen) {
    this.bodyEl.querySelectorAll('.opt').forEach(o => {
      o.style.pointerEvents = 'none';
      const L = o.dataset.l;
      if (!L) return;
      if (q.ans.indexOf(L) >= 0) o.classList.add('correct');
      if (chosen.indexOf(L) >= 0 && q.ans.indexOf(L) < 0) o.classList.add('wrong');
    });
    // 盲盒已揭开的按钮
    this.bodyEl.querySelectorAll('button[data-l]').forEach(o => o.style.pointerEvents = 'none');
  }

  showFeedback(q, ok, chosen, timeout) {
    let extra = '';
    if (this.flags.dual) extra = ' · 玩家 ' + this.dualScore[0] + ':' + this.dualScore[1];
    if (this.flags.wager) extra += ' · 金币 ' + this.coins;
    if (this.flags.blind) extra += ' · 揭开 ' + this.reveals + ' 处';
    const node = h('<div class="feedback ' + (ok ? 'good' : 'bad') + ' mt12"><b>' +
      (timeout ? '时间到 · ' : '') + (ok ? '正确' : '错误') + '</b><p>答案 ' + q.ans.join('') + extra + '</p>' +
      (!ok && this.flags.objection && !this.objectionUsed ? '<button class="btn btn-sm mt8" data-a="objection">异议！申请改判</button>' : '') + '</div>');
    const ob = node.querySelector('[data-a=objection]');
    if (ob) ob.onclick = () => {
      this.objectionUsed = true;
      node.remove();
      this.locked = false;
      this.bodyEl.querySelectorAll('.opt').forEach(o => {
        o.style.pointerEvents = '';
        o.classList.remove('correct', 'wrong');
      });
      toast('改判机会只有一次');
    };
    this.efEl.appendChild(node);
  }

  goNext() {
    /* 双人胜负 */
    if (this.flags.dual && (this.dualScore[0] >= this.flags.dual || this.dualScore[1] >= this.flags.dual)) {
      this.finish(); return;
    }
    /* 生命 */
    if (this.flags.lives && this.lives <= 0) { this.finish(); return; }
    /* 阶梯 */
    if (this.flags.levels && (this.pos + 1) % 5 === 0) { this.level++; toast('登上第 ' + this.level + ' 阶'); }

    this.pos++;
    if (this.pos >= this.ids.length) {
      if (this.flags.endless) {
        this.ids = shuffle(this.origIds); this.pos = 0;
      } else { this.finish(); return; }
    }
    this.chosen = []; this.locked = false; this.multi = [];
    this.render();
  }

  finish() {
    const sec = ((Date.now() - this.startTs) / 1000) | 0;
    const total = this.r + this.w, acc = total ? this.r / total : 0;
    let title = '挑战完成';
    if (this.flags.lives && this.lives <= 0) title = '生命耗尽';
    if (this.flags.dual) title = '玩家 ' + (this.dualScore[0] > this.dualScore[1] ? '一' : '二') + ' 获胜';
    const stats = [
      [Math.round(acc * 100) + '%', '正确率'],
      ['' + (this.flags.dual ? Math.max(...this.dualScore) : this.score || this.coins), this.flags.dual ? '最高分' : (this.flags.wager || this.flags.blind ? '金币' : '得分')],
      [fmtTime(sec), '用时']
    ];
    const el = h('<div class="card center" style="max-width:540px;margin:14px auto"><h2>' + esc(title) + '</h2>' +
      '<div class="ring-wrap mt24">' + ringSVG(acc, 160, 13) + '<div class="ring-center"><b>' + Math.round(acc * 100) + '%</b><span>正确率</span></div></div>' +
      '<div class="grid g3 mt24">' + stats.map(s => '<div class="kpi-card center"><b>' + s[0] + '</b><span>' + s[1] + '</span></div>').join('') + '</div>' +
      '<div class="mt24"><a class="btn btn-primary" href="#/egg">返回彩蛋</a></div></div>');
    mount(el);
    if (acc >= .8) celebrate();
  }
}

/* ---------- TTS ---------- */
function speechSay(txt) {
  if (!('speechSynthesis' in window)) { toast('当前设备不支持语音朗读'); return; }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(txt);
  u.lang = 'zh-CN'; u.rate = .95; u.pitch = 1;
  const vs = window.speechSynthesis.getVoices().filter(v => v.lang.indexOf('zh') === 0);
  if (vs.length) u.voice = vs[0];
  window.speechSynthesis.speak(u);
}
function speechStop() { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); }

/* ---------- 种子随机（每日试炼） ---------- */
function hashDate(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return h;
}
function seededShuffle(arr, seed) {
  const a = arr.slice();
  let s = seed;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---------- 启动入口 ---------- */
function startEgg(id, cfg) {
  const def = EGGS.find(e => e.id === id);
  if (!def) return;
  Quiz.stop();
  if (def.use) {
    switch (def.use) {
      case 'battle': new Games.Battle({ ids: cfg.ids, flavor: 'boss', title: '王者对战' }).start(); break;
      case 'danmaku': new Games.Danmaku({ ids: cfg.ids }).start(); break;
      case 'board': new Games.BoardGame({ ids: cfg.ids }).start(); break;
      case 'mine': new Games.MineSweep({ ids: cfg.ids }).start(); break;
      case 'tower': new Games.Tower({ ids: cfg.ids }).start(); break;
      case 'tetris': new Games.Falling({ ids: cfg.ids, flavor: 'tetris' }).start(); break;
    }
  } else new Egg(def, cfg).start();
}

window.Eggs = { EGGS, startEgg };
})();
