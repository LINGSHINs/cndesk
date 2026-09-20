/* ============================================================
   书桌 · app.js — 路由 / 首页 / 模式 / 统计 / 错题 / 设置
   ============================================================ */
(function () {
'use strict';
const { h, mount, esc, shuffle, fmtTime, ringSVG, toast, sheet, modal } = UI;

/* ============================================================
   图标库（线性，克制使用）
   ============================================================ */
const IC = p => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>';
const ICONS = {
  home: IC('<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/>'),
  book: IC('<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20"/>'),
  chart: IC('<path d="M4 20V4"/><path d="M4 20h16"/><path d="M8 16v-5M12 16V8M16 16v-9"/>'),
  me: IC('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>'),
  order: IC('<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>'),
  dept: IC('<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h6"/>'),
  brain: IC('<path d="M9.5 3.5a3 3 0 0 0-3 3 3 3 0 0 0-1 5.8c.2 2 1.6 3.4 4 3.4V5c0-.8-.7-1.5 0-1.5z"/><path d="M14.5 3.5a3 3 0 0 1 3 3 3 3 0 0 1 1 5.8c-.2 2-1.6 3.4-4 3.4"/>'),
  loop: IC('<path d="M4 10a8 8 0 0 1 13.5-3L20 9"/><path d="M20 4v5h-5"/><path d="M20 14a8 8 0 0 1-13.5 3L4 15"/><path d="M4 20v-5h5"/>'),
  grid2: IC('<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>'),
  shuffle: IC('<path d="M16 3h5v5"/><path d="M4 20 21 3"/><path d="M21 16v5h-5"/><path d="M15 15l6 6"/><path d="M4 4l5 5"/>'),
  bolt2: IC('<path d="M13 2 4.5 13.5H11l-1 8.5L19.5 10H13z"/>'),
  exam: IC('<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 9h6M9 13h6M9 17h3"/><path d="M15.5 14.5l1.2 1.2 2.3-2.6"/>'),
  book2: IC('<path d="M12 6.5C10 4.5 5.5 4.5 3 5.5v13c2.5-1 7-1 9 1 2-2 6.5-2 9-1v-13c-2.5-1-7-1-9 1z"/>'),
  card2: IC('<rect x="3" y="6" width="14" height="14" rx="2"/><path d="M7 3h14v14"/>'),
  sword2: IC('<path d="M14.5 4.5 20 3l-1.5 5.5L9 18l-3-3z"/><path d="m6 15 3 3"/><path d="M3 21l4-4"/>'),
  egg2: IC('<path d="M12 3c4 5 6 8.5 6 12a6 6 0 0 1-12 0c0-3.5 2-7 6-12z"/><path d="M9 14c.5 1 1.5 1.5 3 1.5"/>'),
  wrong: IC('<circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6M9 9l6 6"/>'),
  star: IC('<path d="m12 3 2.6 5.6 6 .8-4.4 4.2 1.1 6L12 17l-5.3 2.6 1.1-6L3.4 9.4l6-.8z"/>'),
  gear: IC('<circle cx="12" cy="12" r="3.2"/><path d="M19 12a7 7 0 0 0-.1-1.3l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2.2-1.3L16.2 2H7.8l-.4 2.6a7 7 0 0 0-2.2 1.3l-2.3-1-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .9.1 1.3l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2.2 1.3l.4 2.6h8.4l.4-2.6a7 7 0 0 0 2.2-1.3l2.3 1 2-3.4-2-1.5c.1-.4.1-.9.1-1.3z"/>'),
  fire: IC('<path d="M12 22a7 7 0 0 0 7-7c0-5-5-7-7-12-1 3-4 5-4 9-2-1-3-2.5-3-4-1.5 2-2 4-2 6a7 7 0 0 0 9 8z"/>'),
  clock: IC('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>'),
  target: IC('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>'),
  chevron: IC('<path d="m9 6 6 6-6 6"/>'),
  back: IC('<path d="M15 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h9M17 9l3 3-3 3M20 12H9"/>')
};

/* ============================================================
   模式定义
   ============================================================ */
const MODES = [
  { id: 'seq', name: '顺序刷题', icon: 'order', desc: '按题库原序逐题推进，稳扎稳打' },
  { id: 'dept', name: '按部门刷题', icon: 'dept', desc: '锁定部门题库，集中火力' },
  { id: 'srs', name: '遗忘曲线', icon: 'brain', desc: '只刷今天该复习的题，科学对抗遗忘' },
  { id: 'loop', name: '循环模式', icon: 'loop', desc: '错题按遗忘曲线轮回，掌握才消失' },
  { id: 'select', name: '选题模式', icon: 'grid2', desc: '答题卡展开，点题号自由跳转' },
  { id: 'shuffle', name: '乱序模式', icon: 'shuffle', desc: '打散题序，消除位置记忆' },
  { id: 'quick', name: '快答模式', icon: 'bolt2', desc: '倒计时回显答案，自动跳下一题' },
  { id: 'exam', name: '组卷刷题', icon: 'exam', desc: '智能组卷、限时交卷、评分复盘' },
  { id: 'memorize', name: '背题模式', icon: 'book2', desc: '先看题再显答案，认识 / 模糊 / 不认识' },
  { id: 'flash', name: '闪卡记忆', icon: 'card2', desc: '翻面卡片，碎片时间过一遍' },
  { id: 'game', name: '游戏记忆', icon: 'sword2', desc: '打怪 / 掉落，边玩边记' },
  { id: 'egg', name: '彩蛋实验室', icon: 'egg2', desc: '二十种天马行空的玩法' }
];

/* ============================================================
   应用框架：侧栏 / Tab / 顶栏
   ============================================================ */
const NAV = [
  { group: '导航', items: [
    { hash: '#/', name: '首页', icon: 'home' },
    { hash: '#/hub', name: '刷题中心', icon: 'book' },
    { hash: '#/stats', name: '学习统计', icon: 'chart' } ] },
  { group: '记忆', items: [
    { hash: '#/wrong', name: '错题集', icon: 'wrong' },
    { hash: '#/fav', name: '收藏题', icon: 'star' },
    { hash: '#/egg', name: '彩蛋实验室', icon: 'egg2' } ] },
  { group: '偏好', items: [
    { hash: '#/settings', name: '皮肤与设置', icon: 'gear' } ] }
];

function renderChrome() {
  const sb = document.getElementById('sidebar');
  sb.innerHTML = '<div class="side-logo"><span class="logo-mark">' + logoSVG() + '</span><div><b>书桌</b><span>DESK · STUDY</span></div></div>';
  NAV.forEach(g => {
    sb.appendChild(h('<div class="side-group">' + g.group + '</div>'));
    g.items.forEach(it => {
      const n = h('<a class="side-item" href="' + it.hash + '">' + ICONS[it.icon] + it.name + '</a>');
      n.dataset.hash = it.hash;
      sb.appendChild(n);
    });
  });

  const tb = document.getElementById('tabbar');
  [['#/', '首页', 'home'], ['#/hub', '刷题', 'book'], ['#/stats', '统计', 'chart'], ['#/me', '我的', 'me']].forEach(x => {
    const n = h('<a class="tab-item" href="' + x[0] + '">' + ICONS[x[2]] + x[1] + '</a>');
    n.dataset.hash = x[0];
    tb.appendChild(n);
  });
}
function logoSVG() {
  return '<svg viewBox="0 0 48 48"><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--accent)"/><stop offset="1" stop-color="var(--accent-2)"/></linearGradient></defs><rect x="2" y="2" width="44" height="44" rx="12" fill="url(#lg)"/><path d="M24 15c-3-2.5-8-2.5-11-1v14c3-1.5 8-1.5 11 1 3-2.5 8-2.5 11-1V14c-3-1.5-8-1.5-11 1z" fill="#fff"/></svg>';
}

function setTopbar(title, sub) {
  const el = document.getElementById('topbar');
  el.innerHTML = '<div><div class="tb-title">' + esc(title) + '</div>' + (sub ? '<div class="tb-sub">' + esc(sub) + '</div>' : '') + '</div><div class="spacer"></div>';
}
function setActiveNav(hash) {
  document.querySelectorAll('.side-item').forEach(n => {
    let on = n.dataset.hash === hash;
    if (n.dataset.hash === '#/hub' && hash.indexOf('#/mode/') === 0) on = true;
    n.classList.toggle('active', on);
  });
  document.querySelectorAll('.tab-item').forEach(n => {
    const map = { '#/wrong': '#/me', '#/fav': '#/me', '#/egg': '#/me', '#/settings': '#/me', '#/me': '#/me' };
    const base = map[hash] || (hash.indexOf('#/mode/') === 0 ? '#/hub' : hash);
    n.classList.toggle('active', n.dataset.hash === base);
  });
}

/* ============================================================
   筛选器（部门 / 题型 / 范围）
   ============================================================ */
function filterKit(extra) {
  const s = Store.settings();
  const node = h('<div></div>');
  const state = { depts: [], types: [] };

  const deptRow = h('<div class="card"><label class="small" style="font-weight:650;color:var(--text-2)">选择部门</label><div class="chip-row mt8"></div></div>');
  const dg = deptRow.querySelector('.chip-row');
  const allD = h('<button class="chip on">全部</button>');
  dg.appendChild(allD);
  QBANK.d.forEach((d, i) => dg.appendChild(h('<button class="chip">' + esc(d) + '</button>')));
  dg.querySelectorAll('button').forEach((b, i) => b.onclick = () => {
    if (i === 0) {
      state.depts = [];
      dg.querySelectorAll('button').forEach((x, j) => x.classList.toggle('on', j === 0));
    } else {
      allD.classList.remove('on');
      b.classList.toggle('on');
      state.depts = [];
      dg.querySelectorAll('button').forEach((x, j) => { if (j && x.classList.contains('on')) state.depts.push(j - 1); });
      if (!state.depts.length) allD.classList.add('on');
    }
    refresh();
  });

  const typeRow = h('<div class="card mt12"><label class="small" style="font-weight:650;color:var(--text-2)">题型</label><div class="chip-row mt8"></div></div>');
  const tg = typeRow.querySelector('.chip-row');
  const allT = h('<button class="chip on">全部</button>');
  tg.appendChild(allT);
  QBANK.t.forEach(t => tg.appendChild(h('<button class="chip">' + t + '</button>')));
  tg.querySelectorAll('button').forEach((b, i) => b.onclick = () => {
    if (i === 0) {
      state.types = [];
      tg.querySelectorAll('button').forEach((x, j) => x.classList.toggle('on', j === 0));
    } else {
      allT.classList.remove('on'); b.classList.toggle('on');
      state.types = [];
      tg.querySelectorAll('button').forEach((x, j) => { if (j && x.classList.contains('on')) state.types.push(j - 1); });
      if (!state.types.length) allT.classList.add('on');
    }
    refresh();
  });

  const rangeRow = h('<div class="card mt12"><label class="small" style="font-weight:650;color:var(--text-2)">题号范围（当前筛选池内）</label>' +
    '<div class="flex aic gap8 mt8"><input class="input" type="number" value="1" min="1" style="width:90px"><span>至</span><input class="input" type="number" style="width:90px" min="1"><div class="spacer"></div><span class="muted small" id="pool-count"></span></div>' +
    '<div class="chip-row mt12"><button class="chip" data-r="50">1-50</button><button class="chip" data-r="100">1-100</button><button class="chip" data-r="300">1-300</button><button class="chip" data-r="all">全部</button></div></div>');
  const [rA, rB] = rangeRow.querySelectorAll('input');
  rangeRow.querySelectorAll('[data-r]').forEach(b => b.onclick = () => {
    const c = pool().length;
    if (b.dataset.r === 'all') { rA.value = 1; rB.value = c; }
    else { rA.value = 1; rB.value = Math.min(c, +b.dataset.r); }
  });

  function pool() { return Store.buildPool({ depts: state.depts, types: state.types }); }
  function refresh() {
    const c = pool().length;
    rangeRow.querySelector('#pool-count').textContent = '共 ' + c + ' 题';
    if (+rB.value < +rA.value || !+rB.value) rB.value = c;
    rA.max = c; rB.max = c;
  }
  function ids() {
    const p = pool();
    let a = +rA.value || 1, b = +rB.value || p.length;
    a = Math.max(1, a); b = Math.min(p.length, b);
    if (b < a) b = a;
    return p.slice(a - 1, b);
  }

  node.append(deptRow, typeRow, rangeRow);
  if (extra) {
    const x = extra({ node, state, pool, refresh });
    if (x) node.appendChild(x);
  }
  refresh();
  return { node, ids, pool, state, refresh };
}

/* ============================================================
   首页
   ============================================================ */
function home() {
  const t = Store.totals();
  const s = Store.settings();
  const due = Store.dueCount();
  const streak = Store.dayStreak();
  const dk = Store.raw().daily;
  const goalPct = Math.min(1, dk.done / s.dailyGoal);
  const hh = new Date().getHours();
  const greet = hh < 6 ? '夜深了' : hh < 11 ? '早上好' : hh < 14 ? '中午好' : hh < 18 ? '下午好' : hh < 23 ? '晚上好' : '夜深了';

  const node = h('<div>' +
    '<div class="hero"><div class="hero-deco"></div><div class="hero-deco2"></div>' +
      '<h2>' + greet + '，欢迎回到书桌</h2><p>' + Store.todayStr() + ' · 今天待复习 ' + due + ' 题 · 已连续打卡 ' + streak + ' 天</p>' +
      '<div class="hero-stats"><div class="hs"><b>' + t.mastered + '</b><span>已掌握题目</span></div>' +
      '<div class="hs"><b>' + Math.round(t.acc * 100) + '%</b><span>总正确率</span></div>' +
      '<div class="hs"><b>' + t.wrong + '</b><span>待消灭错题</span></div></div></div>' +

    '<div class="grid g2">' +
      '<div class="card"><div class="card-h"><h3>今日目标</h3><span class="muted small">' + dk.done + ' / ' + s.dailyGoal + '</span></div>' +
        '<div class="flex aic gap12"><div class="ring-wrap">' + ringSVG(goalPct, 92, 10) + '<div class="ring-center"><b style="font-size:16px">' + Math.round(goalPct * 100) + '%</b></div></div>' +
        '<a class="btn btn-primary" href="' + (due ? '#/mode/srs' : '#/hub') + '">' + (due ? '开始复习' : '去刷题') + '</a></div></div>' +
      '<div class="card"><div class="card-h"><h3>快捷开始</h3></div><div class="chip-row">' +
        '<a class="chip" href="#/mode/loop">循环模式</a><a class="chip" href="#/mode/quick">快答</a>' +
        '<a class="chip" href="#/mode/exam">组卷</a><a class="chip" href="#/mode/flash">闪卡</a></div></div>' +
    '</div>' +

    '<div class="section-h"><h2>学习日历</h2><span>近 16 周</span></div>' +
    '<div class="card">' + heatmapHTML() + '</div>' +

    '<div class="section-h"><h2>部门进度</h2><span>掌握 / 总数</span><div class="spacer"></div><a class="muted small" href="#/stats">详情</a></div>' +
    '<div class="card">' + deptMiniBars() + '</div>' +

    '<div class="section-h"><h2>玩点不一样的</h2></div>' +
    '<div class="grid g2">' +
      '<a class="mode-tile featured" href="#/egg"><span class="mt-icon">' + ICONS.egg2 + '</span><b>彩蛋实验室</b><small>二十种天马行空的刷题玩法等你发现</small></a>' +
      '<a class="mode-tile" href="#/mode/game"><span class="mt-icon">' + ICONS.sword2 + '</span><b>游戏记忆</b><small>打怪、掉落，把知识点玩进脑子</small></a>' +
    '</div></div>');
  mount(node);
}

function heatmapHTML() {
  const today = new Date();
  const dow = today.getDay();
  let html = '<div class="heatmap">';
  for (let c = 0; c < 16; c++) {
    for (let r = 0; r < 7; r++) {
      const offset = (15 - c) * 7 + (6 - r);
      if (offset < 0) continue;
      const d = new Date(); d.setDate(d.getDate() - offset);
      const k = Store.todayStr(d);
      const day = Store.raw().days[k];
      let l = 0;
      if (day && day.a > 0) {
        const goal = Store.settings().dailyGoal;
        l = day.a >= goal ? 4 : day.a >= goal * .6 ? 3 : day.a >= goal * .3 ? 2 : 1;
      }
      html += '<i data-l="' + l + '" title="' + k + '"></i>';
    }
  }
  return html + '</div>';
}
function deptMiniBars() {
  const g = Store.byGroup('dept').slice(0, 8);
  return g.map(x => '<div class="bar-row"><div class="br-top"><b>' + esc(x.name) + '</b><span>' + x.mastered + '/' + x.total + '</span></div>' +
    '<div class="bar-track"><div class="bar-fill" style="width:' + (x.total ? x.mastered / x.total * 100 : 0) + '%"></div></div></div>').join('');
}

/* ============================================================
   刷题中心
   ============================================================ */
function hub() {
  const node = h('<div></div>');
  const groups = [['核心刷题', MODES.slice(0, 8)], ['记忆 · 游戏', MODES.slice(8)]];
  groups.forEach(g => {
    node.appendChild(h('<div class="section-h"><h2>' + g[0] + '</h2></div>'));
    const grid = h('<div class="grid g3"></div>');
    g[1].forEach(m => {
      const tile = h('<a class="mode-tile" href="#/mode/' + m.id + '"><span class="mt-icon">' + ICONS[m.icon] + '</span><b>' + m.name + '</b><small>' + m.desc + '</small>' +
        '<span class="mt-go">' + ICONS.chevron + '</span></a>');
      grid.appendChild(tile);
    });
    node.appendChild(grid);
  });
  mount(node);
}

/* ============================================================
   模式配置
   ============================================================ */
function modeScreen(id) {
  const m = MODES.find(x => x.id === id);
  if (!m) { location.hash = '#/hub'; return; }

  const wrap = h('<div></div>');
  const head = h('<div class="card flex aic gap12"><span class="mt-icon" style="width:48px;height:48px">' + ICONS[m.icon] + '</span><div><b style="font-size:18px">' + m.name + '</b><p class="muted small">' + m.desc + '</p></div></div>');
  wrap.appendChild(head);

  const launchBar = h('<button class="btn btn-primary btn-lg mt16">开始 · ' + m.name + '</button>');

  if (id === 'srs') {
    const fk = filterKit();
    wrap.appendChild(fk.node);
    launchBar.onclick = () => {
      const dueSet = new Set(fk.pool().filter(x => Store.raw().q[x] && Store.raw().q[x].d <= Date.now() && !Store.isMastered(x)));
      const ids = fk.ids().filter(x => dueSet.has(x));
      if (!ids.length) { toast('当前筛选下没有到期题目'); return; }
      Quiz.run({ title: '遗忘曲线复习', ids, exitHash: '#/mode/srs' });
    };
  } else if (id === 'exam') {
    const fk = filterKit();
    const opt = h('<div class="card mt12"><label class="small" style="font-weight:650;color:var(--text-2)">试卷设置</label>' +
      '<div class="mt8"><span class="muted small">题量</span><div class="seg mt8" data-k="count"><button class="on" data-v="20">20</button><button data-v="50">50</button><button data-v="100">100</button></div></div>' +
      '<div class="mt12"><span class="muted small">时长</span><div class="seg mt8" data-k="dur"><button class="on" data-v="0">不限</button><button data-v="30">30分</button><button data-v="60">60分</button></div></div>' +
      '<div class="mt12"><span class="muted small">题型构成</span><div class="seg mt8" data-k="mix"><button class="on" data-v="ratio">按题库比例</button><button data-v="equal">题型均等</button></div></div></div>');
    const cfg = { count: 20, dur: 0, mix: 'ratio' };
    opt.querySelectorAll('.seg').forEach(seg => {
      seg.querySelectorAll('button').forEach(b => b.onclick = () => {
        seg.querySelectorAll('button').forEach(x => x.classList.remove('on'));
        b.classList.add('on');
        cfg[seg.dataset.k] = isNaN(+b.dataset.v) ? b.dataset.v : +b.dataset.v;
      });
    });
    wrap.append(fk.node, opt);
    launchBar.onclick = () => {
      let pool = fk.pool();
      if (!pool.length) { toast('题库池为空'); return; }
      let ids;
      if (cfg.mix === 'equal') {
        const byT = [0, 1, 2].map(t => shuffle(pool.filter(x => Store.Q(x).type === t)));
        ids = [];
        const each = Math.ceil(cfg.count / 3);
        for (let i = 0; i < each; i++) byT.forEach(g => { if (g.length) ids.push(g.shift()); });
        ids = ids.slice(0, cfg.count);
      } else ids = shuffle(pool).slice(0, cfg.count);
      if (!ids.length) { toast('题目不足'); return; }
      Quiz.exam({ title: '模拟卷 ' + ids.length + ' 题', ids, duration: cfg.dur * 60 });
    };
  } else if (id === 'flash' || id === 'memorize') {
    const fk = filterKit();
    const srcRow = h('<div class="card mt12"><label class="small" style="font-weight:650;color:var(--text-2)">题目来源</label>' +
      '<div class="seg mt8"><button class="on" data-v="all">全部题目</button><button data-v="due">待复习</button><button data-v="wrong">错题集</button><button data-v="fav">收藏</button></div></div>');
    let src = 'all';
    srcRow.querySelectorAll('button').forEach(b => b.onclick = () => {
      srcRow.querySelectorAll('button').forEach(x => x.classList.remove('on'));
      b.classList.add('on'); src = b.dataset.v;
    });
    wrap.append(srcRow, fk.node);
    launchBar.onclick = () => {
      let ids;
      if (src === 'all') ids = fk.ids();
      else {
        const p = Store.buildPool({
          depts: fk.state.depts, types: fk.state.types,
          onlyDue: src === 'due', onlyWrong: src === 'wrong', onlyFav: src === 'fav'
        });
        ids = p;
      }
      if (!ids.length) { toast('没有符合条件的题'); return; }
      if (id === 'flash') new Games.Flash({ ids, title: '闪卡记忆' }).start();
      else Quiz.run({ title: '背题模式', ids, memorize: true });
    };
  } else if (id === 'game') {
    const fk = filterKit();
    const gRow = h('<div class="card mt12"><label class="small" style="font-weight:650;color:var(--text-2)">选择游戏</label>' +
      '<div class="seg mt8"><button class="on" data-v="battle">知识打怪</button><button data-v="fall">掉落大作战</button></div></div>');
    let g = 'battle';
    gRow.querySelectorAll('button').forEach(b => b.onclick = () => {
      gRow.querySelectorAll('button').forEach(x => x.classList.remove('on'));
      b.classList.add('on'); g = b.dataset.v;
    });
    wrap.append(gRow, fk.node);
    launchBar.onclick = () => {
      const ids = fk.ids();
      if (!ids.length) { toast('题目池为空'); return; }
      if (g === 'battle') new Games.Battle({ ids }).start();
      else new Games.Falling({ ids }).start();
    };
  } else if (id === 'egg') {
    location.hash = '#/egg'; return;
  } else {
    // 通用：seq / dept / select / shuffle / loop / quick
    const fk = filterKit();
    wrap.appendChild(fk.node);
    const extras = h('<div></div>');
    let quickSec = 5;
    if (id === 'quick') {
      const qRow = h('<div class="card mt12"><label class="small" style="font-weight:650;color:var(--text-2)">每题秒数（超时回显并跳下题）</label>' +
        '<div class="seg mt8"><button data-v="3">3 秒</button><button class="on" data-v="5">5 秒</button><button data-v="8">8 秒</button><button data-v="10">10 秒</button></div></div>');
      qRow.querySelectorAll('button').forEach(b => b.onclick = () => {
        qRow.querySelectorAll('button').forEach(x => x.classList.remove('on'));
        b.classList.add('on'); quickSec = +b.dataset.v;
      });
      extras.appendChild(qRow);
    }
    if (extras.children.length) wrap.appendChild(extras);
    const titles = { seq: '顺序刷题', dept: '按部门刷题', select: '选题模式', shuffle: '乱序刷题', loop: '循环模式', quick: '快答模式' };
    launchBar.textContent = '开始 · ' + titles[id];
    launchBar.onclick = () => {
      let ids = fk.ids();
      if (id === 'shuffle') ids = shuffle(ids);
      if (!ids.length) { toast('题目池为空'); return; }
      const cfg = { title: titles[id], ids, exitHash: '#/mode/' + id, onRetry: () => modeScreen(id) };
      if (id === 'select') cfg.select = true;
      if (id === 'loop') { cfg.loop = true; cfg.auto = true; }
      if (id === 'quick') cfg.quick = quickSec;
      Quiz.run(cfg);
    };
  }
  wrap.appendChild(launchBar);
  mount(wrap);
}

/* ============================================================
   彩蛋实验室
   ============================================================ */
function eggHub() {
  const node = h('<div><div class="hero"><h2>彩蛋实验室</h2><p>二十种天马行空的玩法，挑一个进去试试</p></div><div class="grid g3" id="egg-grid"></div></div>');
  const grid = node.querySelector('#egg-grid');
  Eggs.EGGS.forEach((e, i) => {
    const c = h('<a class="mode-tile" href="#/egg/' + e.id + '"><span class="mt-icon">' + ICONS.egg2 + '</span>' +
      '<b>' + String(i + 1).padStart(2, '0') + ' · ' + e.name + '</b><small>' + esc(e.desc) + '</small></a>');
    grid.appendChild(c);
  });
  mount(node);
}
function eggConfig(id) {
  const def = Eggs.EGGS.find(e => e.id === id);
  if (!def) { location.hash = '#/egg'; return; }
  const wrap = h('<div></div>');
  wrap.appendChild(h('<div class="card"><b style="font-size:18px">' + def.name + '</b><p class="muted small mt8">' + def.desc + '</p></div>'));
  const fk = filterKit();
  wrap.appendChild(fk.node);
  const btn = h('<button class="btn btn-primary btn-lg mt16">进入 · ' + def.name + '</button>');
  btn.onclick = () => {
    const ids = fk.ids();
    if (ids.length < 3) { toast('题目太少，多放一些进来'); return; }
    Eggs.startEgg(id, { ids });
  };
  wrap.appendChild(btn);
  mount(wrap);
}

/* ============================================================
   统计页
   ============================================================ */
function stats() {
  const t = Store.totals();
  const byDept = Store.byGroup('dept');
  const byType = Store.byGroup('type');
  const days14 = Store.lastDays(14);
  const maxA = Math.max(1, ...days14.map(d => d.data ? d.data.a : 0));
  const streak = Store.dayStreak();
  let studySec = 0;
  Object.values(Store.raw().days).forEach(d => studySec += d.t || 0);

  const node = h('<div>' +
    '<div class="grid g4">' +
      kpiHTML('总题量', t.total, 'book', 'var(--accent)') +
      kpiHTML('已练习', t.seen, 'target', 'var(--accent-2)') +
      kpiHTML('已掌握', t.mastered, 'star', 'var(--ok)') +
      kpiHTML('错题', t.wrong, 'wrong', 'var(--bad)') +
    '</div>' +

    '<div class="grid g2 mt16">' +
      '<div class="card center"><div class="card-h"><h3>总正确率</h3></div>' +
        '<div class="ring-wrap">' + ringSVG(t.acc, 150, 13) + '<div class="ring-center"><b>' + Math.round(t.acc * 100) + '%</b><span>' + (t.r + t.w) + ' 次作答</span></div></div>' +
        '<p class="muted small mt12">答对 ' + t.r + ' · 答错 ' + t.w + '</p></div>' +
      '<div class="card"><div class="card-h"><h3>题型雷达</h3></div>' + radarSVG(byType) +
        '<div class="flex" style="justify-content:space-around" id="rad-leg"></div></div>' +
    '</div>' +

    '<div class="section-h"><h2>近 14 日作答</h2></div>' +
    '<div class="card"><div class="flex" style="align-items:flex-end;gap:8px;height:150px">' +
      days14.map(d => {
        const a = d.data ? d.data.a : 0;
        const hgt = a / maxA * 110;
        return '<div style="flex:1;text-align:center"><div title="' + d.date + '" style="height:' + Math.max(2, hgt) + 'px;background:linear-gradient(180deg,var(--accent),var(--accent-2));border-radius:6px 6px 2px 2px"></div>' +
          '<span class="muted small" style="font-size:10px">' + d.date.slice(5) + '</span></div>';
      }).join('') + '</div></div>' +

    '<div class="section-h"><h2>部门掌握度</h2></div>' +
    '<div class="card">' + byDept.map(x => barHTML(x.name, x.mastered / (x.total || 1), x.mastered + '/' + x.total + (x.acc == null ? '' : ' · 正确率 ' + Math.round(x.acc * 100) + '%'))).join('') + '</div>' +

    '<div class="section-h"><h2>学习日历</h2></div><div class="card">' + heatmapHTML() + '</div>' +

    '<div class="grid g3 mt16">' +
      kpiHTML('连续打卡', streak + ' 天', 'fire', 'var(--warn)') +
      kpiHTML('累计学习', fmtTime(studySec / 1000), 'clock', 'var(--accent)') +
      kpiHTML('收藏题目', t.fav, 'star', 'var(--accent-2)') +
    '</div></div>');

  const leg = node.querySelector('#rad-leg');
  byType.forEach(x => {
    leg.appendChild(h('<div class="center small"><b>' + x.name + '</b><br><span class="muted">' + (x.acc == null ? '未练习' : Math.round(x.acc * 100) + '%') + '</span></div>'));
  });
  mount(node);
}
function kpiHTML(label, val, icon, col) {
  return '<div class="card kpi-card"><span class="kpi-ico" style="background:' + col + '22;color:' + col + '">' + ICONS[icon] + '</span><b>' + val + '</b><span>' + label + '</span></div>';
}
function barHTML(name, pct, right) {
  return '<div class="bar-row"><div class="br-top"><b>' + esc(name) + '</b><span>' + right + '</span></div>' +
    '<div class="bar-track"><div class="bar-fill" style="width:' + pct * 100 + '%"></div></div></div>';
}
function radarSVG(byType) {
  const cx = 130, cy = 100, R = 74;
  const angles = [-Math.PI / 2, -Math.PI / 2 + Math.PI * 2 / 3, -Math.PI / 2 + Math.PI * 4 / 3];
  let grid = '', poly = '';
  [1, .66, .33].forEach(f => {
    grid += '<polygon points="' + angles.map(a => (cx + Math.cos(a) * R * f) + ',' + (cy + Math.sin(a) * R * f)).join(' ') +
      '" fill="none" stroke="var(--border)"/>';
  });
  angles.forEach(a => {
    grid += '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + Math.cos(a) * R) + '" y2="' + (cy + Math.sin(a) * R) + '" stroke="var(--border)"/>';
  });
  poly = '<polygon points="' + byType.map((x, i) => {
    const v = x.acc == null ? 0 : x.acc;
    return (cx + Math.cos(angles[i]) * R * v) + ',' + (cy + Math.sin(angles[i]) * R * v);
  }).join(' ') + '" fill="var(--accent)" fill-opacity=".22" stroke="var(--accent)" stroke-width="2"/>';
  return '<svg viewBox="0 0 260 200" width="100%">' + grid + poly +
    byType.map((x, i) => {
      const v = x.acc == null ? 0 : x.acc;
      return '<circle cx="' + (cx + Math.cos(angles[i]) * R * v) + '" cy="' + (cy + Math.sin(angles[i]) * R * v) + '" r="3.4" fill="var(--accent)"/>';
    }).join('') + '</svg>';
}

/* ============================================================
   错题集 / 收藏
   ============================================================ */
function wrongBook() {
  const t = Store.totals();
  const ids = [];
  const raw = Store.raw().q;
  for (const k in raw) if (Store.isWrong(+k)) ids.push(+k);
  ids.sort((a, b) => raw[b].w - raw[a].w);

  const node = h('<div><div class="flex aic gap12 mb16"><span class="coin-pill" style="background:var(--bad-soft);color:var(--bad)">错题 ' + ids.length + '</span>' +
    '<div class="spacer"></div><button class="btn btn-sm" data-a="practice">练习全部</button>' +
    '<button class="btn btn-sm btn-danger" data-a="clear">清空错题</button></div><div id="w-list" class="grid"></div></div>');
  const list = node.querySelector('#w-list');
  if (!ids.length) list.appendChild(h('<div class="card empty"><p>错题集是空的，答错的题会自动收进这里</p></div>'));
  ids.forEach(id => {
    const q = Store.Q(id), r = raw[id];
    const row = h('<div class="card"><div class="flex aic gap8 mb8"><span class="badge ' + (q.type === 1 ? 'warn' : 'glass') + '">' + Store.typeName(q.type) + '</span>' +
      '<span class="muted small">' + Store.deptName(q.dept) + '</span><div class="spacer"></div>' +
      '<span class="muted small">错 ' + r.w + ' / 对 ' + r.r + '</span></div>' +
      '<div class="q-text" style="font-size:15.5px">' + esc(q.q) + '</div>' +
      '<p class="small mt8 muted">正确答案 <b style="color:var(--ok)">' + q.ans.join('') + '</b></p>' +
      '<div class="chip-row mt12"><button class="chip" data-a="go">刷这题</button>' +
      '<button class="chip" data-a="remove">移除</button></div></div>');
    row.querySelector('[data-a=go]').onclick = () => Quiz.run({ title: '错题订正', ids: [id], exitHash: '#/wrong' });
    row.querySelector('[data-a=remove]').onclick = () => { Store.removeWrong(id); row.remove(); toast('已移除'); };
    list.appendChild(row);
  });
  node.querySelector('[data-a=practice]').onclick = () => {
    if (!ids.length) return;
    Quiz.run({ title: '错题集练习', ids, exitHash: '#/wrong' });
  };
  node.querySelector('[data-a=clear]').onclick = () => {
    const m = modal('<h3>清空错题记录？</h3><p class="muted">只清除答错标记，作答历史保留</p><div class="mt16 flex gap12"><button class="btn" data-a="n">取消</button><button class="btn btn-danger" data-a="y" style="margin-left:auto">清空</button></div>');
    m.box.querySelector('[data-a=n]').onclick = m.close;
    m.box.querySelector('[data-a=y]').onclick = () => {
      ids.forEach(Store.removeWrong); m.close(); wrongBook();
    };
  };
  mount(node);
}

function favList() {
  const raw = Store.raw().q;
  const ids = Object.keys(raw).filter(k => raw[k].f).map(Number);
  const node = h('<div><div class="flex aic mb16"><span class="coin-pill">收藏 ' + ids.length + '</span><div class="spacer"></div>' +
    '<button class="btn btn-sm btn-primary" data-a="p">练习全部</button></div><div id="f-list" class="grid"></div></div>');
  const list = node.querySelector('#f-list');
  if (!ids.length) list.appendChild(h('<div class="card empty"><p>还没有收藏，答题时点“收藏本题”</p></div>'));
  ids.forEach(id => {
    const q = Store.Q(id);
    const c = h('<div class="card"><div class="flex aic gap8 mb8"><span class="badge">' + Store.typeName(q.type) + '</span>' +
      '<span class="muted small">' + Store.deptName(q.dept) + '</span><div class="spacer"></div>' +
      '<button class="chip" data-a="go">刷这题</button></div><div class="q-text" style="font-size:15.5px">' + esc(q.q) + '</div></div>');
    c.querySelector('[data-a=go]').onclick = () => Quiz.run({ title: '收藏题', ids: [id], exitHash: '#/fav' });
    list.appendChild(c);
  });
  node.querySelector('[data-a=p]').onclick = () => ids.length && Quiz.run({ title: '收藏练习', ids, exitHash: '#/fav' });
  mount(node);
}

/* ============================================================
   我的
   ============================================================ */
function me() {
  const t = Store.totals();
  const items = [
    ['#/wrong', '错题集', t.wrong + ' 题', 'wrong'],
    ['#/fav', '收藏题', t.fav + ' 题', 'star'],
    ['#/egg', '彩蛋实验室', '20 种玩法', 'egg2'],
    ['#/settings', '皮肤与设置', '56 套皮肤', 'gear']
  ];
  const node = h('<div><div class="card flex aic gap12">' + ICONS.me +
    '<div><b style="font-size:18px">我的书桌</b><p class="muted small">已掌握 ' + t.mastered + ' 题 · 正确率 ' + Math.round(t.acc * 100) + '%</p></div></div>' +
    '<div class="card mt16">' + items.map(x =>
      '<a class="list-row" href="' + x[0] + '"><span class="mt-icon" style="width:38px;height:38px">' + ICONS[x[3]] + '</span>' +
      '<b style="font-size:15px">' + x[1] + '</b><div class="spacer"></div><span class="muted small">' + x[2] + '</span>' + ICONS.chevron + '</a>').join('') + '</div></div>');
  mount(node);
}

/* ============================================================
   设置
   ============================================================ */
function settings() {
  const s = Store.settings();
  const node = h('<div></div>');

  /* 皮肤 */
  node.appendChild(h('<div class="section-h"><h2>皮肤</h2><span>56 套 · 每套配有专属粒子</span></div>'));
  const skinWrap = h('<div class="skin-grid"></div>');
  FX.THEMES.forEach(t => {
    const c = h('<button class="skin-card ' + (t.id === s.theme ? 'on' : '') + '">' +
      '<div class="skin-preview" style="background:linear-gradient(135deg,' + t.v.bg + ',' + t.v.bg2 + ')">' +
        '<span style="color:' + t.v.accent + '">' + FX.markSVG(t.mark) + '</span></div>' +
      '<span class="sk-name">' + esc(t.name) + '<span>' + t.group + '</span></span>' +
      '<span class="sk-check"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"><path d="M20 6 9 17l-5-5"/></svg></span></button>');
    c.onclick = () => {
      Store.updateSettings({ theme: t.id });
      FX.applyTheme(t.id);
      FX.applyCustom();
      skinWrap.querySelectorAll('.skin-card').forEach(x => x.classList.remove('on'));
      c.classList.add('on');
    };
    skinWrap.appendChild(c);
  });
  const skinCard = h('<div class="card"></div>');
  skinCard.appendChild(skinWrap);
  node.appendChild(skinCard);

  /* 字体 */
  node.appendChild(h('<div class="section-h"><h2>字体</h2><span>切换即时生效</span></div>'));
  const fontWrap = h('<div class="grid g2"></div>');
  FX.FONTS.forEach(f => {
    const c = h('<button class="card font-card ' + (f.id === s.font ? 'glass' : '') + '" style="' + (f.id === s.font ? 'outline:2px solid var(--accent)' : '') + '">' +
      '<span class="fc-sample" style="font-family:' + f.stack.split(',').slice(0, 1) + '">' + f.sample + '</span>' +
      '<span class="fc-name">' + f.name + '</span></button>');
    c.onclick = () => {
      Store.updateSettings({ font: f.id });
      FX.applyFont(f.id);
      fontWrap.querySelectorAll('.font-card').forEach(x => { x.style.outline = ''; });
      c.style.outline = '2px solid var(--accent)';
      toast('字体：' + f.name);
    };
    fontWrap.appendChild(c);
  });
  node.appendChild(fontWrap);

  /* 字号 */
  const sizeCard = h('<div class="card mt16"><div class="flex jcb"><b>字号</b><span class="muted small" id="size-lab">' + Math.round(s.fontSize * 100) + '%</span></div>' +
    '<input type="range" min="0.85" max="1.35" step="0.05" value="' + s.fontSize + '" class="mt8"></div>');
  bindRange(sizeCard.querySelector('input'), v => {
    Store.updateSettings({ fontSize: v });
    FX.applyFontSize(v);
    sizeCard.querySelector('#size-lab').textContent = Math.round(v * 100) + '%';
  });
  node.appendChild(sizeCard);

  /* 背景 */
  node.appendChild(h('<div class="section-h"><h2>背景与氛围</h2><span>不影响阅读是底线</span></div>'));
  const bgCard = h('<div class="card"><div class="flex gap12" style="flex-wrap:wrap">' +
    '<button class="btn" data-a="upload">上传背景图</button><button class="btn" data-a="resetbg">恢复默认</button>' +
    '<input type="file" accept="image/*" class="hide" id="bg-file"></div>' +
    sliderHTML('背景模糊', s.bgBlur, 0, 30, 1, 'px') +
    sliderHTML('阅读遮罩（越深越护眼）', s.overlay, 0, .6, .02, '') +
    sliderHTML('色相', s.hue, -180, 180, 2, 'deg') +
    sliderHTML('饱和度', s.sat, 0, 2, .02, '') +
    sliderHTML('亮度', s.bright, .5, 1.5, .02, '') +
    '<div class="row-set"><span class="rs-label"><b>强调色</b><span>留空则跟随皮肤</span></span><div class="spacer"></div>' +
    '<input type="color" value="' + (s.accent || '#6d5efc') + '" id="acc-col"><button class="chip" data-a="acc-reset">重置</button></div></div>');

  bgCard.querySelector('[data-a=upload]').onclick = () => bgCard.querySelector('#bg-file').click();
  bgCard.querySelector('#bg-file').onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, 1280 / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = img.width * scale; c.height = img.height * scale;
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        const url = c.toDataURL('image/jpeg', .82);
        Store.updateSettings({ bgImg: url });
        FX.applyCustom();
        toast('背景已更新');
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };
  bgCard.querySelector('[data-a=resetbg]').onclick = () => {
    Store.updateSettings({ bgImg: '', bgBlur: 0, overlay: 0, hue: 0, sat: 1, bright: 1, accent: '' });
    FX.applyCustom(); settings();
  };
  bgCard.querySelector('#acc-col').oninput = e => {
    Store.updateSettings({ accent: e.target.value });
    FX.applyCustom();
  };
  bgCard.querySelector('[data-a=acc-reset]').onclick = () => {
    Store.updateSettings({ accent: '' });
    document.documentElement.style.removeProperty('--accent');
    FX.applyTheme(s.theme);
  };
  // 滑块绑定
  bgCard.querySelectorAll('input[type=range]').forEach(r => {
    const key = r.dataset.k, unit = r.dataset.u || '';
    bindRange(r, v => {
      const patch = {}; patch[key] = v;
      Store.updateSettings(patch); FX.applyCustom();
      const lab = bgCard.querySelector('[data-lab="' + key + '"]');
      if (lab) lab.textContent = (+v).toFixed(r.step < .1 ? 2 : 0) + unit;
    });
  });
  node.appendChild(bgCard);

  /* 粒子 */
  const pCard = h('<div class="card mt16"><div class="row-set" style="border:0;padding:0"><span class="rs-label"><b>粒子特效</b><span>当前皮肤：' + esc(FX.current().name) + '</span></span><div class="spacer"></div>' +
    '<label class="switch"><input type="checkbox" ' + (s.particles ? 'checked' : '') + '><i></i></label></div>' +
    sliderHTML('粒子密度', s.particleDensity, .3, 2, .1, '') + '</div>');
  pCard.querySelector('.switch input').onchange = e => {
    Store.updateSettings({ particles: e.target.checked });
    FX.setParticlesEnabled(e.target.checked);
  };
  pCard.querySelectorAll('input[type=range]').forEach(r => bindRange(r, v => {
    Store.updateSettings({ particleDensity: v });
    FX.applyTheme(s.theme, { skipFavicon: true });
  }));
  node.appendChild(pCard);

  /* 音效 */
  node.appendChild(h('<div class="section-h"><h2>音效</h2><span>四种音色包 · 可分别开关</span></div>'));
  const aCard = h('<div class="card">' +
    '<div class="row-set" style="padding-top:0"><span class="rs-label"><b>音效总开关</b></span><div class="spacer"></div>' +
    '<label class="switch"><input type="checkbox" ' + (s.sound ? 'checked' : '') + '><i></i></label></div>' +
    '<div class="field mt8"><label>音色包</label><div class="seg" id="pack-seg">' +
      [['classic', '经典'], ['crystal', '水晶'], ['pixel', '像素'], ['piano', '钢琴']].map((p, i) => '<button class="' + (s.soundPack === p[0] ? 'on' : '') + '" data-v="' + p[0] + '">' + p[1] + '</button>').join('') + '</div></div>' +
    '<div class="row-set"><span class="rs-label"><b>答对音效</b></span><div class="spacer"></div>' +
    '<label class="switch"><input type="checkbox" ' + (s.soundOk ? 'checked' : '') + '><i></i></label></div>' +
    '<div class="row-set"><span class="rs-label"><b>答错音效</b></span><div class="spacer"></div>' +
    '<label class="switch"><input type="checkbox" ' + (s.soundBad ? 'checked' : '') + '><i></i></label></div>' +
    sliderHTML('音量', s.volume, 0, 1, .05, '') +
    '<div class="flex gap12 mt12"><button class="btn" data-a="tok">试听答对</button><button class="btn" data-a="tbad">试听答错</button></div></div>');
  aCard.querySelector('.switch input').onchange = e => { Store.updateSettings({ sound: e.target.checked }); };
  aCard.querySelectorAll('#pack-seg button').forEach(b => b.onclick = () => {
    aCard.querySelectorAll('#pack-seg button').forEach(x => x.classList.remove('on'));
    b.classList.add('on'); Store.updateSettings({ soundPack: b.dataset.v });
  });
  const switches = aCard.querySelectorAll('.row-set .switch input');
  switches[1].onchange = e => Store.updateSettings({ soundOk: e.target.checked });
  switches[2].onchange = e => Store.updateSettings({ soundBad: e.target.checked });
  aCard.querySelectorAll('input[type=range]').forEach(r => bindRange(r, v => Store.updateSettings({ volume: v })));
  aCard.querySelector('[data-a=tok]').onclick = () => FX.play('ok');
  aCard.querySelector('[data-a=tbad]').onclick = () => FX.play('bad');
  node.appendChild(aCard);

  /* 学习参数 */
  node.appendChild(h('<div class="section-h"><h2>学习参数</h2></div>'));
  const lCard = h('<div class="card">' +
    sliderHTML('掌握所需连对次数', s.mastery, 2, 5, 1, ' 次') +
    sliderHTML('每日目标', s.dailyGoal, 10, 200, 10, ' 题') + '</div>');
  lCard.querySelectorAll('input[type=range]').forEach(r => bindRange(r, v => {
    const patch = {}; patch[r.dataset.k] = v; Store.updateSettings(patch);
  }));
  node.appendChild(lCard);

  /* 数据 */
  node.appendChild(h('<div class="section-h"><h2>数据</h2><span>全部记录仅保存在本机</span></div>'));
  const dCard = h('<div class="card flex gap12" style="flex-wrap:wrap">' +
    '<button class="btn" data-a="exp">导出备份</button><button class="btn" data-a="imp">导入备份</button>' +
    '<input type="file" accept="application/json" class="hide" id="imp-file">' +
    '<button class="btn btn-danger" data-a="reset">重置全部数据</button></div>');
  dCard.querySelector('[data-a=exp]').onclick = () => {
    const blob = new Blob([Store.exportJSON()], { type: 'application/json' });
    const a = h('<a href="' + URL.createObjectURL(blob) + '" download="shuzhuo-backup.json"></a>');
    document.body.appendChild(a); a.click(); a.remove();
  };
  dCard.querySelector('[data-a=imp]').onclick = () => dCard.querySelector('#imp-file').click();
  dCard.querySelector('#imp-file').onchange = e => {
    const f = e.target.files[0];
    const r = new FileReader();
    r.onload = () => {
      try { Store.importJSON(r.result); FX.boot(); route(); toast('备份已导入'); }
      catch (err) { toast('导入失败：文件不匹配'); }
    };
    r.readAsText(f);
  };
  dCard.querySelector('[data-a=reset]').onclick = () => {
    const m = modal('<h3>重置全部数据？</h3><p class="muted">所有作答记录、统计与设置都会被清空</p>' +
      '<div class="mt16 flex gap12"><button class="btn" data-a="n">取消</button><button class="btn btn-danger" data-a="y" style="margin-left:auto">全部重置</button></div>');
    m.box.querySelector('[data-a=n]').onclick = m.close;
    m.box.querySelector('[data-a=y]').onclick = () => { Store.resetAll(); FX.boot(); location.hash = '#/'; };
  };
  node.appendChild(dCard);

  mount(node);
}

function sliderHTML(label, val, min, max, step, unit) {
  const key = label == '背景模糊' ? 'bgBlur' :
    label.indexOf('遮罩') >= 0 ? 'overlay' :
    label === '色相' ? 'hue' : label === '饱和度' ? 'sat' : label === '亮度' ? 'bright' :
    label.indexOf('密度') >= 0 ? 'particleDensity' : label === '音量' ? 'volume' :
    label.indexOf('连对') >= 0 ? 'mastery' : label.indexOf('目标') >= 0 ? 'dailyGoal' : 'x';
  const pct = (val - min) / (max - min) * 100;
  return '<div class="row-set"><span class="rs-label"><b>' + label + '</b></span>' +
    '<span class="muted small" data-lab="' + key + '">' + (+val).toFixed(step < 1 ? 2 : 0) + unit + '</span>' +
    '<input type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '" data-k="' + key +
    '" data-u="' + unit + '" style="width:130px;margin:0 4px" class="ml8"></div>';
}
function bindRange(r, fn) {
  const sync = () => {
    const min = +r.min, max = +r.max, v = +r.value;
    r.style.setProperty('--fill', ((v - min) / (max - min) * 100) + '%');
    fn(v);
  };
  r.addEventListener('input', sync); sync();
}

/* ============================================================
   路由
   ============================================================ */
function route() {
  Quiz.stop();
  let hash = location.hash || '#/';
  let title = '书桌', sub = '';
  if (hash === '#/') { home(); title = '书桌'; sub = Store.todayStr(); }
  else if (hash === '#/hub') { hub(); title = '刷题中心'; }
  else if (hash.indexOf('#/mode/') === 0) {
    const id = hash.split('/')[2];
    const m = MODES.find(x => x.id === id);
    modeScreen(id); title = m ? m.name : '刷题';
  }
  else if (hash === '#/stats') { stats(); title = '学习统计'; }
  else if (hash === '#/wrong') { wrongBook(); title = '错题集'; }
  else if (hash === '#/fav') { favList(); title = '收藏题'; }
  else if (hash === '#/egg') { eggHub(); title = '彩蛋实验室'; }
  else if (hash.indexOf('#/egg/') === 0) {
    const id = hash.split('/')[2];
    eggConfig(id); title = '彩蛋 · 配置';
  }
  else if (hash === '#/settings') { settings(); title = '设置'; }
  else if (hash === '#/me') { me(); title = '我的'; }
  else { location.hash = '#/'; return; }

  setTopbar(title, sub);
  setActiveNav(hash);
}
window.addEventListener('hashchange', route);

/* ---------- 启动 ---------- */
FX.boot();
renderChrome();
route();
})();
