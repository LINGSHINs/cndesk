/* ============================================================
   书桌 · games.js — 闪卡 / 打怪 / 掉落 / 弹幕 / 大富翁 / 扫雷 / 塔防
   ============================================================ */
(function () {
'use strict';
const { h, mount, esc, shuffle, fmtTime, ringSVG, toast, sheet, modal } = UI;

function sameSet(a, b) {
  if (a.length !== b.length) return false;
  const x = a.slice().sort(), y = b.slice().sort();
  return x.every((v, i) => v === y[i]);
}
function record(id, chosen, ms) {
  const q = Store.Q(id);
  const ok = sameSet(chosen, q.ans);
  Store.answer(id, ok, ms);
  return { ok, q };
}
function celebrate(n) {
  n = n || 5;
  for (let i = 0; i < n; i++) setTimeout(() => FX.burst(window.innerWidth * (0.12 + i * .19), window.innerHeight * .32, true), i * 160);
}
function gameOver(node, title, stats, btnHash) {
  const el = h('<div class="card center" style="max-width:540px;margin:14px auto"><h2>' + esc(title) + '</h2>' +
    '<div class="grid g3 mt24">' + stats.map(s => '<div class="kpi-card center"><b>' + s[0] + '</b><span>' + s[1] + '</span></div>').join('') + '</div>' +
    '<div class="mt24"><a class="btn btn-primary" href="' + btnHash + '">返回</a></div></div>');
  node.innerHTML = '';
  node.appendChild(el);
}

/* ============================================================
   闪卡记忆
   cfg = { ids, title, exitHash }
   ============================================================ */
class Flash {
  constructor(cfg) { this.ids = cfg.ids; this.title = cfg.title || '闪卡'; this.exitHash = cfg.exitHash || '#/hub'; this.pos = 0; this.r = 0; this.w = 0; this.flipped = false; this.startTs = Date.now(); }
  start() {
    if (!this.ids.length) { mount(h('<div class="empty"><p>没有可用的卡片</p></div>')); return; }
    this.root = h('<div></div>');
    mount(this.root);
    this.render();
  }
  render() {
    const id = this.ids[this.pos], q = Store.Q(id);
    const head = h('<div class="quiz-head"><button class="icon-btn" data-a="exit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h9M17 9l3 3-3 3M20 12H9"/></svg></button>' +
      '<div class="qh-progress"><span class="qh-count">' + esc(this.title) + ' · ' + (this.pos + 1) + '/' + this.ids.length + '</span><div class="mini-track"><div class="mini-fill" style="width:' + (this.pos / this.ids.length * 100) + '%"></div></div></div></div>');
    head.querySelector('[data-a=exit]').onclick = () => location.hash = this.exitHash;

    const optionsHtml = q.opts.map((t, i) => {
      const L = String.fromCharCode(65 + i);
      const good = q.ans.indexOf(L) >= 0;
      return '<div class="opt locked ' + (good ? 'correct' : '') + '" style="margin-bottom:9px"><span class="letter">' + L + '</span><span class="ot">' + esc(t) + '</span></div>';
    }).join('');

    const stage = h('<div class="flash-stage"><div class="flash-card" data-a="flip">' +
      '<div class="flash-face"><div class="ff-tag">' + Store.deptName(q.dept) + ' · ' + Store.typeName(q.type) + '</div>' +
      '<div class="ff-q">' + esc(q.q) + '</div><div class="ff-hint">轻触卡片翻面看答案</div></div>' +
      '<div class="flash-face back"><div class="ff-tag">正确答案 <span class="ans-key">' + q.ans.join('') + '</span></div>' +
      '<div class="ff-ans">' + optionsHtml + '</div></div></div></div>');
    const card = stage.querySelector('.flash-card');
    card.onclick = () => { card.classList.toggle('flipped'); this.flipped = card.classList.contains('flipped'); };

    const actions = h('<div class="chip-row mt24" style="justify-content:center"><button class="chip" data-g="0">不认识</button><button class="chip" data-g="1">模糊</button><button class="chip on" data-g="2">认识</button></div>');
    actions.querySelectorAll('button').forEach(b => b.onclick = () => {
      const g = +b.dataset.g;
      Store.grade(id, g);
      if (g === 2) this.r++; else this.w++;
      FX.play(g === 2 ? 'ok' : 'bad');
      card.classList.remove('flipped');
      setTimeout(() => {
        this.pos++;
        if (this.pos >= this.ids.length) this.finish(); else this.render();
      }, 320);
    });

    this.root.innerHTML = '';
    this.root.append(head, stage, actions);
  }
  finish() {
    const total = this.r + this.w, acc = total ? this.r / total : 0;
    const sec = (Date.now() - this.startTs) / 1000;
    const node = h('<div class="card center" style="max-width:540px;margin:14px auto"><h2>闪卡完成</h2>' +
      '<div class="ring-wrap mt24">' + ringSVG(acc, 160, 13) + '<div class="ring-center"><b>' + Math.round(acc * 100) + '%</b><span>认识率</span></div></div>' +
      '<div class="grid g3 mt24"><div class="kpi-card center"><b>' + this.r + '</b><span>认识</span></div><div class="kpi-card center"><b>' + this.w + '</b><span>需复习</span></div><div class="kpi-card center"><b>' + fmtTime(sec) + '</b><span>用时</span></div></div>' +
      '<div class="mt24"><a class="btn btn-primary" href="#/hub">返回</a></div></div>');
    mount(node);
    if (acc >= .8) celebrate();
  }
}

/* ============================================================
   打怪对战（王者对战 / 普通打怪共用）
   cfg = { ids, flavor: 'battle'|'boss', title }
   ============================================================ */
class Battle {
  constructor(cfg) {
    this.ids = cfg.ids; this.flavor = cfg.flavor || 'battle';
    this.title = cfg.title || (this.flavor === 'boss' ? '王者对战' : '知识打怪');
    this.pos = 0; this.pHp = 100; this.eHp = 100; this.wave = 1;
    this.combo = 0; this.coins = 0; this.locked = false;
    this.r = 0; this.w = 0; this.startTs = Date.now();
    this.timers = [];
  }
  start() {
    if (!this.ids.length) { mount(h('<div class="empty"><p>没有题目</p></div>')); return; }
    this.root = h('<div></div>');
    mount(this.root);
    this.render();
  }
  destroy() { this.timers.forEach(clearInterval); }
  render() {
    const id = this.ids[this.pos], q = Store.Q(id);
    const top = h('<div class="card"><div class="flex aic" style="justify-content:space-between"><b>' + esc(this.title) + '</b>' +
      '<span class="coin-pill"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="9" opacity=".4"/><circle cx="12" cy="12" r="5"/></span>' + this.coins + '</span></div>' +
      '<div class="mt16"><div class="flex jcb small mb8"><span>你</span><span>' + this.pHp + '</span></div><div class="hp-bar"><div class="hp-fill player" style="width:' + this.pHp + '%"></div></div></div>' +
      '<div class="mt12"><div class="flex jcb small mb8"><span>' + (this.flavor === 'boss' ? 'BOSS' : '怪物') + ' · 第 ' + this.wave + ' 波</span><span>' + this.eHp + '</span></div><div class="hp-bar"><div class="hp-fill enemy" style="width:' + this.eHp + '%"></div></div></div>' +
      '<div class="center mt16">' + monsterSVG(this.wave) + (this.combo > 1 ? '<div class="badge mt8">连击 x' + this.combo + '</div>' : '') + '</div></div>');

    const card = h('<div class="card q-card mt16"><div class="q-meta"><span class="badge">' + Store.typeName(q.type) + '</span><span class="badge glass">' + Store.deptName(q.dept) + '</span></div>' +
      '<div class="q-text">' + esc(q.q) + '</div><div class="q-body"></div><div id="b-feedback"></div></div>');

    this.root.innerHTML = '';
    this.root.append(top, card);
    this.bodyEl = card.querySelector('.q-body');
    this.fbEl = card.querySelector('#b-feedback');
    this.paintOptions(q);
  }

  paintOptions(q) {
    const b = this.bodyEl;
    if (q.type === 1) {
      const grid = h('<div class="judge-grid"></div>');
      q.opts.forEach((t, i) => {
        const L = String.fromCharCode(65 + i);
        const btn = h('<button class="judge-btn"><b>' + esc(t) + '</b></button>');
        btn.onclick = () => this.resolve([L]);
        grid.appendChild(btn);
      });
      b.appendChild(grid);
    } else {
      q.opts.forEach((t, i) => {
        const L = String.fromCharCode(65 + i);
        const o = h('<button class="opt"><span class="letter">' + L + '</span><span class="ot">' + esc(t) + '</span></button>');
        o.onclick = () => q.type === 2 ? (o.classList.toggle('selected'), this.toggleMulti(L)) : this.resolve([L]);
        b.appendChild(o);
      });
      if (q.type === 2) {
        this.multi = [];
        b.appendChild(h('<div class="mt12"><button class="btn btn-primary btn-block" data-a="m">确认攻击</button></div>')).querySelector('[data-a=m]').onclick = () => this.resolve(this.multi.slice());
      }
    }
  }
  toggleMulti(L) {
    const i = this.multi.indexOf(L);
    if (i >= 0) this.multi.splice(i, 1); else this.multi.push(L);
  }

  resolve(chosen) {
    if (this.locked) return;
    this.locked = true;
    const id = this.ids[this.pos];
    const { ok, q } = record(id, chosen);
    const f = this.fbEl;
    if (ok) {
      this.r++; this.combo++;
      const dmg = Math.min(34, 10 + this.combo * 2);
      this.eHp -= dmg; this.coins += 10 + this.wave * 2;
      FX.play('ok');
      f.appendChild(h('<div class="feedback good"><b>造成 ' + dmg + ' 点伤害</b><p>连击 ' + this.combo + '，继续压制</p></div>'));
    } else {
      this.w++; this.combo = 0;
      const dmg = 10 + this.wave * 3;
      this.pHp -= dmg;
      FX.play('bad');
      f.appendChild(h('<div class="feedback bad"><b>受到 ' + dmg + ' 点伤害</b><p>正确答案 ' + q.ans.join('') + '</p></div>'));
      this.root.querySelector('.card').classList.add('shake');
      setTimeout(() => this.root.querySelector('.card').classList.remove('shake'), 450);
    }
    FX.burst(window.innerWidth / 2, window.innerHeight * .3, ok);
    this.lockVisuals(q, chosen);

    setTimeout(() => {
      if (this.pHp <= 0) { this.gameEnd(false); return; }
      if (this.eHp <= 0) {
        this.wave++; this.coins += 50; this.eHp = Math.min(100, 80 + this.wave * 4);
        if (this.wave > 8) { this.gameEnd(true); return; }
        toast('第 ' + this.wave + ' 波来袭');
      }
      this.pos++;
      if (this.pos >= this.ids.length) { this.gameEnd(true); return; }
      this.locked = false;
      this.render();
    }, 1100);
  }
  lockVisuals(q, chosen) {
    this.bodyEl.querySelectorAll('.opt').forEach(o => {
      o.style.pointerEvents = 'none';
      if (q.ans.indexOf(o.dataset.l) >= 0) o.classList.add('correct');
      if (chosen.indexOf(o.dataset.l) >= 0 && q.ans.indexOf(o.dataset.l) < 0) o.classList.add('wrong');
    });
    this.bodyEl.querySelectorAll('.judge-btn').forEach(o => o.style.pointerEvents = 'none');
  }
  gameEnd(win) {
    const sec = ((Date.now() - this.startTs) / 1000) | 0;
    gameOver(this.root, win ? '胜利' : '败北', [
      [this.wave - (win ? 1 : 0) + '', '波次'], [this.coins, '金币'], [fmtTime(sec), '用时']
    ], '#/hub');
    if (win) celebrate();
  }
}
function monsterSVG(wave) {
  const c = ['#a855f7', '#ec4899', '#f97316', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f43f5e'][Math.min(wave - 1, 7)];
  return '<svg width="110" height="110" viewBox="0 0 100 100"><g fill="' + c + '">' +
    '<path d="M20 45a30 30 0 0 1 60 0v18c0 6-5 9-10 7l-8-5h-24l-8 5c-5 2-10-1-10-7z"/>' +
    '<path d="M28 30l-8-14M72 30l8-14" stroke="' + c + '" stroke-width="7" stroke-linecap="round"/></g>' +
    '<circle cx="38" cy="52" r="6" fill="#fff"/><circle cx="62" cy="52" r="6" fill="#fff"/>' +
    '<circle cx="38" cy="54" r="3" fill="#111"/><circle cx="62" cy="54" r="3" fill="#111"/>' +
    '<path d="M40 68q10 8 20 0" stroke="#111" stroke-width="3" fill="none" stroke-linecap="round"/></svg>';
}

/* ============================================================
   掉落大作战 / 俄罗斯方块
   cfg = { ids, flavor: 'fall'|'tetris', title }
   ============================================================ */
class Falling {
  constructor(cfg) {
    this.ids = cfg.ids; this.flavor = cfg.flavor || 'fall';
    this.title = cfg.title || (this.flavor === 'tetris' ? '俄罗斯方块' : '掉落大作战');
    this.pos = 0; this.lives = 3; this.score = 0; this.locked = false;
    this.blocks = []; this.raf = null; this.startTs = Date.now();
  }
  start() {
    if (!this.ids.length) { mount(h('<div class="empty"><p>没有题目</p></div>')); return; }
    this.root = h('<div></div>');
    mount(this.root);
    this.render();
  }
  stopRaf() { if (this.raf) cancelAnimationFrame(this.raf); }
  render() {
    const id = this.ids[this.pos], q = Store.Q(id);
    const top = h('<div class="card"><div class="flex jcb aic"><b>' + esc(this.title) + '</b>' +
      '<span class="chip">得分 ' + this.score + ' · 生命 ' + this.lives + '</span></div>' +
      '<div class="q-text mt12" style="font-size:16px">' + esc(q.q) + '</div>' +
      '<span class="badge mt8">' + Store.typeName(q.type) + ' · 点选正确的字母方块</span></div>');
    const zone = h('<div class="falling-zone mt16"></div>');
    this.root.innerHTML = '';
    this.root.append(top, zone);
    this.zone = zone;
    this.spawn(q);
    this.tickLoop(q);
  }
  spawn(q) {
    this.blocks = [];
    const zoneW = this.zone.clientWidth;
    q.opts.forEach((t, i) => {
      const L = String.fromCharCode(65 + i);
      const el = h('<div class="fall-block">' + L + ' · ' + esc(t.slice(0, 12)) + (t.length > 12 ? '…' : '') + '</div>');
      const x = Math.random() * (zoneW - 90);
      el.style.transform = 'translate(' + x + 'px,-50px)';
      this.zone.appendChild(el);
      const b = { el, x, y: -50, v: 1.1 + Math.random() * .9 + this.pos * .06, L, state: 0 };
      el.onclick = () => {
        if (b.state || this.locked) return;
        const good = q.ans.indexOf(L) >= 0;
        if (good) {
          b.state = 1; el.classList.add('right');
          this.score += 10;
          if (q.type !== 2) this.resolve(q, true);
          else {
            const remain = this.blocks.filter(x => !x.state && q.ans.indexOf(x.L) >= 0);
            if (!remain.length) this.resolve(q, true);
          }
        } else {
          b.state = 2; el.classList.add('bad');
          this.lives--; FX.play('bad');
          this.checkLives(q);
        }
      };
      this.blocks.push(b);
    });
  }
  tickLoop(q) {
    const step = () => {
      if (!this.zone.isConnected) return;
      let bottomMiss = false;
      this.blocks.forEach(b => {
        if (b.state) return;
        b.y += b.v * 1.4;
        b.el.style.transform = 'translate(' + b.x + 'px,' + b.y + 'px)';
        if (b.y > this.zone.clientHeight - 30) {
          if (q.ans.indexOf(b.L) >= 0) bottomMiss = true;
          b.state = 3; b.el.style.opacity = .2;
        }
      });
      if (bottomMiss) {
        this.lives--; FX.play('bad');
        this.resolve(q, false);
        return;
      }
      this.raf = requestAnimationFrame(step);
    };
    this.raf = requestAnimationFrame(step);
  }
  checkLives(q) {
    const lab = this.root.querySelector('.chip');
    if (lab) lab.textContent = '得分 ' + this.score + ' · 生命 ' + this.lives;
    if (this.lives <= 0) this.end(false);
  }
  resolve(q, ok) {
    this.locked = true; this.stopRaf();
    FX.play(ok ? 'ok' : 'bad');
    Store.answer(q.id, ok);
    setTimeout(() => {
      this.pos++;
      if (this.pos >= this.ids.length) { this.end(true); return; }
      this.locked = false;
      this.render();
    }, 900);
  }
  end(win) {
    this.stopRaf();
    gameOver(this.root, win ? '通关' : '游戏结束', [['' + this.score, '得分'], ['' + this.pos, '题数'], ['' + this.lives, '剩余生命']], '#/hub');
    if (win) celebrate();
  }
}

/* ============================================================
   弹幕冲关
   ============================================================ */
class Danmaku {
  constructor(cfg) { this.ids = cfg.ids; this.pos = 0; this.lives = 3; this.score = 0; this.locked = false; this.items = []; this.raf = null; }
  start() {
    if (!this.ids.length) { mount(h('<div class="empty"><p>没有题目</p></div>')); return; }
    this.root = h('<div></div>'); mount(this.root); this.render();
  }
  stopRaf() { if (this.raf) cancelAnimationFrame(this.raf); }
  render() {
    const id = this.ids[this.pos], q = Store.Q(id);
    const top = h('<div class="card"><div class="flex jcb"><b>弹幕冲关</b><span class="chip">' + this.score + ' 分 · ' + this.lives + ' 命</span></div>' +
      '<div class="q-text mt12" style="font-size:16px">' + esc(q.q) + '</div></div>');
    const layer = h('<div class="danmaku-layer mt16"></div>');
    this.root.innerHTML = '';
    this.root.append(top, layer);
    this.layer = layer;
    this.items = [];
    const H = layer.clientHeight;
    q.opts.forEach((t, i) => {
      const L = String.fromCharCode(65 + i);
      const el = h('<div class="dm-item">' + L + ' · ' + esc(t.slice(0, 14)) + (t.length > 14 ? '…' : '') + '</div>');
      const y = Math.random() * (H - 40) + 8;
      el.style.transform = 'translate(' + (layer.clientWidth + 20) + 'px,' + y + 'px)';
      layer.appendChild(el);
      const it = { el, x: layer.clientWidth + 20, y, v: 1.6 + Math.random() * 1.5 + this.pos * .05, L, state: 0 };
      el.onclick = () => {
        if (it.state || this.locked) return;
        if (q.ans.indexOf(L) >= 0) {
          it.state = 1; el.classList.add('hit'); this.score += 10;
          if (q.type !== 2) this.resolve(q, true);
          else if (!this.items.filter(x => !x.state && q.ans.indexOf(x.L) >= 0).length) this.resolve(q, true);
        } else { it.state = 2; el.classList.add('miss'); this.lives--; this.checkEnd(); }
      };
      this.items.push(it);
    });
    this.loop(q);
  }
  loop(q) {
    const step = () => {
      if (!this.layer.isConnected) return;
      let escaped = false;
      this.items.forEach(it => {
        if (it.state) return;
        it.x -= it.v * 1.6;
        it.el.style.transform = 'translate(' + it.x + 'px,' + it.y + 'px)';
        if (it.x < -140) {
          if (q.ans.indexOf(it.L) >= 0) escaped = true;
          it.state = 3;
        }
      });
      if (escaped) { this.lives--; this.resolve(q, false); return; }
      this.raf = requestAnimationFrame(step);
    };
    this.raf = requestAnimationFrame(step);
  }
  checkEnd() {
    const lab = this.root.querySelector('.chip');
    if (lab) { /* */ }
    if (this.lives <= 0) this.end(false);
  }
  resolve(q, ok) {
    this.locked = true; this.stopRaf();
    FX.play(ok ? 'ok' : 'bad');
    Store.answer(q.id, ok);
    setTimeout(() => {
      this.pos++;
      if (this.pos >= this.ids.length) { this.end(true); return; }
      this.locked = false; this.render();
    }, 850);
  }
  end(win) {
    this.stopRaf();
    gameOver(this.root, win ? '通关' : '弹幕淹没', [['' + this.score, '得分'], ['' + this.pos, '题数']], '#/hub');
    if (win) celebrate();
  }
}

/* ============================================================
   大富翁
   ============================================================ */
class BoardGame {
  constructor(cfg) {
    this.ids = cfg.ids; this.pos = 0; this.coins = 100; this.lap = 0;
    this.idPtr = 0; this.locked = true;
    // 格子类型 0 普通答题 1 命运 2 休息 3 起点 4 终点
    this.cells = Array.from({ length: 36 }, (_, i) => {
      if (i === 0) return 3;
      if (i === 35) return 4;
      if ([5, 12, 19, 26, 31].indexOf(i) >= 0) return 1;
      if ([8, 17, 24].indexOf(i) >= 0) return 2;
      return 0;
    });
  }
  start() {
    if (!this.ids.length) { mount(h('<div class="empty"><p>没有题目</p></div>')); return; }
    this.root = h('<div></div>'); mount(this.root); this.render();
  }
  render() {
    const wrap = h('<div class="board-wrap"><div class="flex jcb" style="width:100%;max-width:440px"><b>知识大富翁</b>' +
      '<span class="coin-pill">' + this.coins + '</span></div><div class="board-grid"></div>' +
      '<button class="btn btn-primary btn-lg" data-a="dice" style="max-width:440px">掷骰子</button>' +
      '<p class="muted small">答对题获得金币，命运格子有惊喜</p></div>');
    const grid = wrap.querySelector('.board-grid');
    // 蛇形编号
    for (let i = 0; i < 36; i++) {
      const idx = Math.floor(i / 6) % 2 === 0 ? i : (Math.floor(i / 6) * 6 + (5 - i % 6));
      const t = this.cells[idx];
      const cls = idx === this.pos ? 'player' : t === 1 ? 'event' : t === 4 ? 'goal' : '';
      const txt = ['题', '运', '休', '起', '终'][t];
      const c = h('<button class="board-cell ' + cls + '">' + (idx + 1) + ' · ' + txt + '</button>');
      grid.appendChild(c);
    }
    wrap.querySelector('[data-a=dice]').onclick = () => this.roll(wrap.querySelector('[data-a=dice]'));
    this.root.innerHTML = '';
    this.root.appendChild(wrap);
  }
  roll(btn) {
    btn.disabled = true;
    const result = 1 + Math.floor(Math.random() * 6);
    toast('骰子点数 ' + result);
    let step = 0;
    const iv = setInterval(() => {
      step++;
      this.pos++;
      if (this.pos > 35) this.pos = 0;
      this.render();
      if (step >= result) {
        clearInterval(iv);
        setTimeout(() => this.land(btn), 350);
      }
    }, 220);
  }
  land(btn) {
    const t = this.cells[this.pos];
    if (t === 4) { this.finish(true); return; }
    if (t === 2) { toast('休息一下 +10'); this.coins += 10; btn.disabled = false; this.render(); return; }
    if (t === 1) {
      const lucky = Math.random() < .5;
      const v = 20 + Math.floor(Math.random() * 40);
      this.coins += lucky ? v : -v;
      toast((lucky ? '命运眷顾 +' : '命运捉弄 -') + v);
      btn.disabled = false; this.render(); return;
    }
    // 答题
    const id = this.ids[this.idPtr++ % this.ids.length];
    const q = Store.Q(id);
    this.ask(q, btn);
  }
  ask(q, btn) {
    const self = this;
    const node = h('<div><h3>' + Store.deptName(q.dept) + ' · ' + Store.typeName(q.type) + '</h3>' +
      '<div class="q-text" style="font-size:16px">' + esc(q.q) + '</div><div class="q-body mt12"></div></div>');
    const b = node.querySelector('.q-body');
    let chosen = [];
    q.opts.forEach((t, i) => {
      const L = String.fromCharCode(65 + i);
      const o = h('<button class="opt"><span class="letter">' + L + '</span><span class="ot">' + esc(t) + '</span></button>');
      o.onclick = () => {
        if (q.type === 2) {
          o.classList.toggle('selected');
          const x = chosen.indexOf(L); x >= 0 ? chosen.splice(x, 1) : chosen.push(L);
        } else { chosen = [L]; doCommit(); }
      };
      b.appendChild(o);
    });
    const s = sheet(node);
    if (q.type === 2) {
      b.appendChild(h('<div class="mt12"><button class="btn btn-primary btn-block">确认</button></div>')).querySelector('button').onclick = doCommit;
    }
    function doCommit() {
      const { ok } = record(q.id, chosen);
      s.close();
      self.coins += ok ? 30 : -10;
      toast(ok ? '答对 +30' : '答错 -10');
      btn.disabled = false;
      self.render();
    }
  }
  finish(win) {
    gameOver(this.root, '抵达终点', [['' + this.coins, '金币'], ['' + this.idPtr, '答题数']], '#/hub');
    celebrate(6);
  }
}

/* ============================================================
   扫雷
   ============================================================ */
class MineSweep {
  constructor(cfg) {
    this.ids = cfg.ids;
    this.cells = Array.from({ length: 25 }, (_, i) => ({ id: this.ids[i % this.ids.length], state: 0 }));
    this.lives = 3; this.safe = 0; this.ptr = 0;
  }
  start() {
    if (!this.ids.length) { mount(h('<div class="empty"><p>没有题目</p></div>')); return; }
    this.root = h('<div></div>'); mount(this.root); this.render();
  }
  render() {
    const wrap = h('<div class="card"><div class="flex jcb aic"><b>题海扫雷</b><span class="chip">安全 ' + this.safe + '/25 · ' + this.lives + ' 命</span></div>' +
      '<p class="muted small mt8">点开格子即答题，答错踩雷</p><div class="mine-grid mt16"></div></div>');
    const grid = wrap.querySelector('.mine-grid');
    this.cells.forEach((c, i) => {
      const cls = c.state === 1 ? 'safe' : c.state === 2 ? 'boom' : '';
      const el = h('<button class="mine-cell ' + cls + '">' + (c.state ? (c.state === 1 ? '安' : '雷') : i + 1) + '</button>');
      if (!c.state) el.onclick = () => this.open(i, el);
      grid.appendChild(el);
    });
    this.root.innerHTML = '';
    this.root.appendChild(wrap);
  }
  open(i, el) {
    el.classList.add('current');
    const c = this.cells[i], q = Store.Q(c.id);
    const node = h('<div><h3>第 ' + (i + 1) + ' 格 · ' + Store.typeName(q.type) + '</h3><div class="q-text" style="font-size:16px">' + esc(q.q) + '</div>' +
      '<div class="q-body mt12"></div></div>');
    const b = node.querySelector('.q-body');
    let chosen = [];
    q.opts.forEach((t, k) => {
      const L = String.fromCharCode(65 + k);
      const o = h('<button class="opt"><span class="letter">' + L + '</span><span class="ot">' + esc(t) + '</span></button>');
      o.onclick = () => {
        if (q.type === 2) { o.classList.toggle('selected'); const x = chosen.indexOf(L); x >= 0 ? chosen.splice(x, 1) : chosen.push(L); }
        else { chosen = [L]; done(); }
      };
      b.appendChild(o);
    });
    const s = sheet(node);
    if (q.type === 2) b.appendChild(h('<div class="mt12"><button class="btn btn-primary btn-block">确认</button></div>')).querySelector('button').onclick = done;
    const self = this;
    function done() {
      const { ok } = record(q.id, chosen);
      s.close();
      if (ok) { c.state = 1; self.safe++; FX.play('ok'); }
      else { c.state = 2; self.lives--; FX.play('bad'); }
      if (self.lives <= 0) { self.finish(false); return; }
      if (self.safe >= 25) { self.finish(true); return; }
      self.render();
    }
  }
  finish(win) {
    gameOver(this.root, win ? '全部安全' : '触雷', [['' + this.safe, '安全格'], ['' + this.lives, '剩余生命']], '#/hub');
    if (win) celebrate();
  }
}

/* ============================================================
   题海塔防
   ============================================================ */
class Tower {
  constructor(cfg) {
    this.ids = cfg.ids;
    this.monsters = [{ cell: 0 }];        // 开局即有一只来犯之敌
    this.pos = 0; this.lives = 3; this.kills = 0;
    this.answers = 0; this.locked = false;
    this.target = 12;
  }
  start() {
    if (!this.ids.length) { mount(h('<div class="empty"><p>没有题目</p></div>')); return; }
    this.root = h('<div></div>'); mount(this.root); this.render();
  }
  render() {
    const id = this.ids[this.pos % this.ids.length], q = Store.Q(id);
    const top = h('<div class="card"><div class="flex jcb"><b>题海塔防</b><span class="chip">击杀 ' + this.kills + '/' + this.target + ' · ' + this.lives + ' 城防</span></div>' +
      '<div class="td-path mt16"></div></div>');
    const path = top.querySelector('.td-path');
    for (let i = 0; i < 10; i++) {
      const c = h('<span class="td-cell ' + (i === 9 ? 'base' : '') + '">' + (i === 9 ? '家' : i) + '</span>');
      this.monsters.filter(m => m.cell === i).forEach(() => c.appendChild(h('<i class="mon"></i>')));
      path.appendChild(c);
    }
    const card = h('<div class="card q-card mt16"><div class="q-meta"><span class="badge">' + Store.typeName(q.type) + '</span><span class="badge glass">' + Store.deptName(q.dept) + '</span></div>' +
      '<div class="q-text">' + esc(q.q) + '</div><div class="q-body"></div></div>');
    this.root.innerHTML = '';
    this.root.append(top, card);
    this.bodyEl = card.querySelector('.q-body');
    this.paint(q);
  }
  paint(q) {
    const b = this.bodyEl; let chosen = [];
    if (q.type === 1) {
      const grid = h('<div class="judge-grid"></div>');
      q.opts.forEach((t, i) => {
        const L = String.fromCharCode(65 + i);
        const btn = h('<button class="judge-btn"><b>' + esc(t) + '</b></button>');
        btn.onclick = () => this.resolve([L], q);
        grid.appendChild(btn);
      });
      b.appendChild(grid);
    } else {
      q.opts.forEach((t, i) => {
        const L = String.fromCharCode(65 + i);
        const o = h('<button class="opt"><span class="letter">' + L + '</span><span class="ot">' + esc(t) + '</span></button>');
        o.onclick = () => {
          if (q.type === 2) { o.classList.toggle('selected'); const x = chosen.indexOf(L); x >= 0 ? chosen.splice(x, 1) : chosen.push(L); }
          else this.resolve([L], q);
        };
        b.appendChild(o);
      });
      if (q.type === 2) b.appendChild(h('<div class="mt12"><button class="btn btn-primary btn-block">建造攻击</button></div>')).querySelector('button').onclick = () => this.resolve(chosen.slice(), q);
    }
  }
  resolve(chosen, q) {
    if (this.locked) return;
    this.locked = true;
    const { ok } = record(q.id, chosen);
    FX.play(ok ? 'ok' : 'bad');
    if (ok && this.monsters.length) {
      // 击杀最靠近家的
      let idx = 0;
      this.monsters.forEach((m, i) => { if (m.cell > this.monsters[idx].cell) idx = i; });
      this.monsters.splice(idx, 1);
      this.kills++;
      FX.burst(window.innerWidth / 2, window.innerHeight * .2, true);
    }
    // 怪物前进
    this.monsters.forEach(m => m.cell += 2);
    const breached = this.monsters.filter(m => m.cell >= 9).length;
    if (breached) { this.lives -= breached; this.monsters = this.monsters.filter(m => m.cell < 9); }
    // 生成
    this.answers++;
    if (this.answers % 2 === 0 && this.monsters.length < 3) this.monsters.push({ cell: 0 });
    if (!this.monsters.length && this.answers === 1) this.monsters.push({ cell: 3 });

    setTimeout(() => {
      if (this.lives <= 0) { this.finish(false); return; }
      if (this.kills >= this.target) { this.finish(true); return; }
      this.pos++; this.locked = false; this.render();
    }, 700);
  }
  finish(win) {
    gameOver(this.root, win ? '城防成功' : '基地失守', [['' + this.kills, '击杀'], ['' + this.lives, '城防'], ['' + this.pos, '答题']], '#/hub');
    if (win) celebrate();
  }
}

window.Games = { Flash, Battle, Falling, Danmaku, BoardGame, MineSweep, Tower };
})();
