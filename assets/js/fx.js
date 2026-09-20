/* ============================================================
   书桌 · fx.js — 皮肤系统 / 粒子引擎 / 音效 / 字体
   ============================================================ */
(function () {
'use strict';

/* ============================================================
   一、56 套皮肤
   ============================================================ */
const T = (id, name, group, v, fx, flags, mark) => ({ id, name, group, v, fx, flags: flags || '', mark });

const THEMES = [
  T('liquid','液态玻璃','质感',{bg:'#eef2f9',bg2:'#e3e9f6',surface:'#ffffff','surface-2':'#f1f4fb',text:'#14161f','text-2':'#4a4f63','text-3':'#8b91a5',accent:'#6d5efc','accent-2':'#26b8c8','on-accent':'#fff','bg-glow-a':'rgba(124,92,255,.28)','bg-glow-b':'rgba(57,214,200,.22)','bg-glow-c':'rgba(255,159,178,.18)'},'glassbits','glass','drop'),
  T('gba','宝可梦 GBA','游戏',{bg:'#9bbc0f',bg2:'#8bac0f',surface:'#c4cfa1','surface-2':'#8bac0f',text:'#0f380f','text-2':'#306230','text-3':'#306230',accent:'#306230','accent-2':'#0f380f','on-accent':'#9bbc0f','bg-glow-a':'rgba(48,98,48,.2)','bg-glow-b':'rgba(15,56,15,.15)','bg-glow-c':'transparent'},'pixels','pixel','pokeball'),
  T('cyber','赛博朋克','霓虹',{bg:'#0a0614',bg2:'#140826',surface:'#160d2a','surface-2':'#221238',text:'#f2eaff','text-2':'#b7a6d9','text-3':'#7d6a9e',accent:'#ff2e9a','accent-2':'#00e5ff','on-accent':'#fff','bg-glow-a':'rgba(255,46,154,.18)','bg-glow-b':'rgba(0,229,255,.14)','bg-glow-c':'rgba(131,56,236,.16)'},'neonrain','neon','bolt'),
  T('stardew','星露谷物语','游戏',{bg:'#f3d9a0',bg2:'#e6c787',surface:'#fff4d6','surface-2':'#ecd9ac',text:'#3a2c1a','text-2':'#6d5636','text-3':'#9a7d52',accent:'#4a9d3c','accent-2':'#d08c2e','on-accent':'#fff','bg-glow-a':'rgba(74,157,60,.18)','bg-glow-b':'rgba(208,140,46,.16)','bg-glow-c':'transparent'},'leaves','pixel','sprout'),
  T('shinkai','新海诚','艺术',{bg:'#d6ecff',bg2:'#c2dffc',surface:'#f7fbff','surface-2':'#e7f2fe',text:'#17324d','text-2':'#45617e','text-3':'#82a0bb',accent:'#3d8bff','accent-2':'#ffb86c','on-accent':'#fff','bg-glow-a':'rgba(80,150,255,.22)','bg-glow-b':'rgba(255,184,108,.16)','bg-glow-c':'rgba(255,170,200,.14)'},'sakura','comic','cloud'),
  T('ink','水墨丹青','国风',{bg:'#ece7dd',bg2:'#ded7c8',surface:'#f7f3ea','surface-2':'#e8e2d4',text:'#20201d','text-2':'#53514a','text-3':'#8a867a',accent:'#171713','accent-2':'#7a6a55','on-accent':'#f3eee2','bg-glow-a':'rgba(40,40,30,.1)','bg-glow-b':'rgba(122,106,85,.1)','bg-glow-c':'transparent'},'ink','ink','brush'),
  T('material','Material You','质感',{bg:'#f7f5fa',bg2:'#ece8f4',surface:'#ffffff','surface-2':'#efeaf6',text:'#1c1b20','text-2':'#4b4856','text-3':'#8a8696',accent:'#6750a4','accent-2':'#7d6bb8','on-accent':'#fff','bg-glow-a':'rgba(103,80,164,.16)','bg-glow-b':'rgba(125,107,184,.12)','bg-glow-c':'rgba(230,180,200,.1)'},'stardust','','palette'),
  T('mono','极简黑白','质感',{bg:'#ffffff',bg2:'#f3f3f3',surface:'#fafafa','surface-2':'#eeeeee',text:'#111111','text-2':'#555555','text-3':'#999999',accent:'#111111','accent-2':'#555555','on-accent':'#ffffff','bg-glow-a':'rgba(0,0,0,.05)','bg-glow-b':'transparent','bg-glow-c':'transparent'},'geometric','','circle'),
  T('luxe','暗夜黑金','质感',{bg:'#0d0c0a',bg2:'#181510',surface:'#1b1814','surface-2':'#26211a',text:'#f3ead8','text-2':'#c2b494','text-3':'#8d8068',accent:'#d4af37','accent-2':'#a8862e','on-accent':'#1a1408','bg-glow-a':'rgba(212,175,55,.15)','bg-glow-b':'rgba(168,134,46,.1)','bg-glow-c':'transparent'},'embers','luxe','crown'),
  T('sunset','日落橙光','自然',{bg:'#ffd9c0',bg2:'#ffb494',surface:'#fff7f0','surface-2':'#fdeadd',text:'#4a2410','text-2':'#7d503a','text-3':'#b08a70',accent:'#ff6b35','accent-2':'#ffb347','on-accent':'#fff','bg-glow-a':'rgba(255,107,53,.2)','bg-glow-b':'rgba(255,179,71,.18)','bg-glow-c':'rgba(255,150,120,.14)'},'embers','','sun'),
  T('abyss','深海蔚蓝','自然',{bg:'#06182f',bg2:'#08243f',surface:'#0c2747','surface-2':'#12335a',text:'#dff0ff','text-2':'#9fc4dd','text-3':'#6286a6',accent:'#2dd4ff','accent-2':'#40a9ff','on-accent':'#04222e','bg-glow-a':'rgba(45,212,255,.16)','bg-glow-b':'rgba(64,169,255,.1)','bg-glow-c':'transparent'},'bubbles','','wave'),
  T('forest','森林绿意','自然',{bg:'#e9f3e4',bg2:'#d8e9d0',surface:'#f6fbf2','surface-2':'#e5f0dd',text:'#1c2b16','text-2':'#475c3e','text-3':'#7d9272',accent:'#3e8e41','accent-2':'#7ba05b','on-accent':'#fff','bg-glow-a':'rgba(62,142,65,.18)','bg-glow-b':'rgba(123,160,91,.14)','bg-glow-c':'transparent'},'leaves','','leaf'),
  T('sakura','樱花粉','自然',{bg:'#ffeef4',bg2:'#ffddea',surface:'#fffafb','surface-2':'#fdeaf0',text:'#5d2435','text-2':'#8e5566','text-3':'#bd8d9b',accent:'#ff7aa2','accent-2':'#ffadc4','on-accent':'#fff','bg-glow-a':'rgba(255,122,162,.18)','bg-glow-b':'rgba(255,173,196,.14)','bg-glow-c':'transparent'},'petals','','flower'),
  T('lavender','薰衣草','自然',{bg:'#ece8fb',bg2:'#dcd4f6',surface:'#faf8ff','surface-2':'#ece6fa',text:'#35304f','text-2':'#655e80','text-3':'#9a93b4',accent:'#8b7cf6','accent-2':'#a292ff','on-accent':'#fff','bg-glow-a':'rgba(139,124,246,.2)','bg-glow-b':'rgba(162,146,255,.12)','bg-glow-c':'transparent'},'stardust','','sparkle'),
  T('monet','莫奈花园','艺术',{bg:'#dceee3',bg2:'#c8e3d4',surface:'#f4fbf6','surface-2':'#dff0e6',text:'#2c4a3a','text-2':'#577365','text-3':'#88a094',accent:'#5f9ea0','accent-2':'#e8a0bf','on-accent':'#fff','bg-glow-a':'rgba(95,158,160,.18)','bg-glow-b':'rgba(232,160,191,.14)','bg-glow-c':'rgba(180,220,140,.14)'},'petals','','lily'),
  T('vangogh','梵高星夜','艺术',{bg:'#0b1f4d',bg2:'#102a60',surface:'#14305f','surface-2':'#1b3d74',text:'#f0e9c8','text-2':'#c0b890','text-3':'#8b8668',accent:'#ffce3a','accent-2':'#4a90e2','on-accent':'#2a1c00','bg-glow-a':'rgba(255,206,58,.16)','bg-glow-b':'rgba(74,144,226,.18)','bg-glow-c':'rgba(120,180,255,.1)'},'stars','','star'),
  T('mucha','穆夏','艺术',{bg:'#f3e9dc',bg2:'#e8d9c4',surface:'#fbf4e9','surface-2':'#f0e3d0',text:'#4a3320','text-2':'#7a5f48','text-3':'#a88f76',accent:'#b8860b','accent-2':'#8c5a3c','on-accent':'#fff','bg-glow-a':'rgba(184,134,11,.14)','bg-glow-b':'rgba(140,90,60,.12)','bg-glow-c':'rgba(220,180,120,.12)'},'feathers','luxe','ornament'),
  T('vapor','蒸汽波','霓虹',{bg:'#2a1a3e',bg2:'#371d4f',surface:'#3a2654','surface-2':'#4a3168',text:'#ffe9f7','text-2':'#c9a8d8','text-3':'#967aa6',accent:'#ff71ce','accent-2':'#01cdfe','on-accent':'#fff','bg-glow-a':'rgba(255,113,206,.2)','bg-glow-b':'rgba(1,205,254,.14)','bg-glow-c':'rgba(177,107,255,.16)'},'vapor','','triangle'),
  T('synth','合成器浪潮','霓虹',{bg:'#0b0220',bg2:'#160833',surface:'#1a0d38','surface-2':'#261548',text:'#ffd6f5','text-2':'#c89ec0','text-3':'#8f6c88',accent:'#ff5f8f','accent-2':'#59c2ff','on-accent':'#fff','bg-glow-a':'rgba(255,95,143,.18)','bg-glow-b':'rgba(89,194,255,.12)','bg-glow-c':'rgba(255,160,60,.1)'},'synthgrid','','sun2'),
  T('gta','洛圣都','潮流',{bg:'#161616',bg2:'#1f1f1f',surface:'#232323','surface-2':'#2e2e2e',text:'#f5f5f5','text-2':'#bdbdbd','text-3':'#8a8a8a',accent:'#36e07d','accent-2':'#ff3f8f','on-accent':'#06130a','bg-glow-a':'rgba(54,224,125,.13)','bg-glow-b':'rgba(255,63,143,.12)','bg-glow-c':'rgba(255,208,0,.08)'},'stardust','','city'),
  T('terminal','黑客帝国','霓虹',{bg:'#020a05',bg2:'#05120a',surface:'#06140b','surface-2':'#0a1c12',text:'#7dff9c','text-2':'#52c872','text-3':'#3a9a55',accent:'#00ff66','accent-2':'#0affae','on-accent':'#02200c','bg-glow-a':'rgba(0,255,102,.14)','bg-glow-b':'rgba(10,255,174,.08)','bg-glow-c':'transparent'},'matrix','terminal','terminal'),
  T('cosmos','太空漫游','质感',{bg:'#05060f',bg2:'#0a0d1f',surface:'#0e1226','surface-2':'#161b36',text:'#dfe6ff','text-2':'#aab4d4','text-3':'#747f9e',accent:'#8a7bff','accent-2':'#56ccf2','on-accent':'#fff','bg-glow-a':'rgba(138,123,255,.18)','bg-glow-b':'rgba(86,204,242,.12)','bg-glow-c':'rgba(255,120,180,.08)'},'stars','','planet'),
  T('aurora','北极光','自然',{bg:'#04101c',bg2:'#08202d',surface:'#0a1f2e','surface-2':'#10303d',text:'#e6fff8','text-2':'#a8d4c8','text-3':'#6a9a90',accent:'#4ade80','accent-2':'#22d3ee','on-accent':'#042014','bg-glow-a':'rgba(74,222,128,.14)','bg-glow-b':'rgba(34,211,238,.12)','bg-glow-c':'transparent'},'aurora','aurora','aurora'),
  T('glacier','冰川','自然',{bg:'#e4f2f7',bg2:'#d2e8f1',surface:'#f4fbff','surface-2':'#e2f0f7',text:'#173848','text-2':'#4a6a78','text-3':'#82a0ae',accent:'#4aa8c9','accent-2':'#7fc8dd','on-accent':'#fff','bg-glow-a':'rgba(74,168,201,.16)','bg-glow-b':'rgba(127,200,221,.12)','bg-glow-c':'transparent'},'snow','','ice'),
  T('dune','沙漠黄昏','自然',{bg:'#f6e3c2',bg2:'#eed0a4',surface:'#fbf3e0','surface-2':'#f2e4c8',text:'#4a3415','text-2':'#7d6544','text-3':'#ab946e',accent:'#d98e35','accent-2':'#c2571a','on-accent':'#fff','bg-glow-a':'rgba(217,142,53,.18)','bg-glow-b':'rgba(194,87,26,.12)','bg-glow-c':'rgba(255,200,120,.12)'},'sand','','dune'),
  T('island','热带海岛','自然',{bg:'#d9f6ef',bg2:'#c0ecdf',surface:'#f0fffb','surface-2':'#dcf4ec',text:'#0d3b33','text-2':'#3f6b60','text-3':'#72998f',accent:'#14b88a','accent-2':'#ffb84d','on-accent':'#fff','bg-glow-a':'rgba(20,184,138,.18)','bg-glow-b':'rgba(255,184,77,.14)','bg-glow-c':'rgba(120,220,255,.12)'},'bubbles','','palm'),
  T('bluechina','青花瓷','国风',{bg:'#eef4f8',bg2:'#dde9f2',surface:'#fbfdff','surface-2':'#e8f1f7',text:'#16324d','text-2':'#445e78','text-3':'#7d93ab',accent:'#1f4e9c','accent-2':'#3a6fb0','on-accent':'#fff','bg-glow-a':'rgba(31,78,156,.14)','bg-glow-b':'rgba(58,111,176,.1)','bg-glow-c':'transparent'},'ink','','porcelain'),
  T('dunhuang','敦煌飞天','国风',{bg:'#efd9b4',bg2:'#e4c69a',surface:'#f8ecd6','surface-2':'#eedbb8',text:'#5a3210','text-2':'#8a5f38','text-3':'#b59068',accent:'#c2571a','accent-2':'#a8321f','on-accent':'#fff','bg-glow-a':'rgba(194,87,26,.18)','bg-glow-b':'rgba(168,50,31,.12)','bg-glow-c':'rgba(240,200,80,.14)'},'embers','festive','ribbon'),
  T('palace','故宫红墙','国风',{bg:'#f4e8e0',bg2:'#e8d6ca',surface:'#fbf4ee','surface-2':'#f0e0d6',text:'#3a1a14','text-2':'#6e453c','text-3':'#a07e72',accent:'#a8241c','accent-2':'#c9a25a','on-accent':'#fff','bg-glow-a':'rgba(168,36,28,.15)','bg-glow-b':'rgba(201,162,90,.12)','bg-glow-c':'transparent'},'gold','festive','pillar'),
  T('guochao','国潮仙鹤','国风',{bg:'#f1ece2',bg2:'#e2dccd',surface:'#faf6ed','surface-2':'#ece4d6',text:'#21343a','text-2':'#52666c','text-3':'#86989e',accent:'#2f6f7a','accent-2':'#c8443a','on-accent':'#fff','bg-glow-a':'rgba(47,111,122,.15)','bg-glow-b':'rgba(200,68,58,.1)','bg-glow-c':'rgba(220,200,140,.12)'},'feathers','','crane'),
  T('zen','禅意','国风',{bg:'#e8e6df',bg2:'#dbd8ce',surface:'#f5f3ec','surface-2':'#e7e4da',text:'#2b2a25','text-2':'#5a5850','text-3':'#8e8b82',accent:'#6b6657','accent-2':'#8a8578','on-accent':'#fff','bg-glow-a':'rgba(107,102,87,.12)','bg-glow-b':'transparent','bg-glow-c':'transparent'},'fog','ink','enso'),
  T('dungeon','像素地牢','游戏',{bg:'#1a1c2c',bg2:'#232640',surface:'#2a2e48','surface-2':'#373c5c',text:'#e8e8f0','text-2':'#b0b0c8','text-3':'#7c7c98',accent:'#ffcd75','accent-2':'#a040a0','on-accent':'#20202e','bg-glow-a':'rgba(255,205,117,.12)','bg-glow-b':'rgba(160,64,160,.14)','bg-glow-c':'transparent'},'pixels','pixel','sword'),
  T('ps','PlayStation','游戏',{bg:'#0a1a4d',bg2:'#0f2460',surface:'#122a6b','surface-2':'#1a3a82',text:'#e6f0ff','text-2':'#a8c4e8','text-3':'#6f8ab8',accent:'#2e6cf6','accent-2':'#9db8ff','on-accent':'#fff','bg-glow-a':'rgba(46,108,246,.22)','bg-glow-b':'rgba(157,184,255,.1)','bg-glow-c':'transparent'},'stardust','','controller'),
  T('xbox','Xbox','游戏',{bg:'#0d1a12',bg2:'#122619',surface:'#14281d','surface-2':'#1b3526',text:'#e6fff0','text-2':'#a2d4b4','text-3':'#689a78',accent:'#107c10','accent-2':'#4cb848','on-accent':'#fff','bg-glow-a':'rgba(16,124,16,.2)','bg-glow-b':'rgba(76,184,72,.12)','bg-glow-c':'transparent'},'stardust','','controller2'),
  T('switch','任天堂 Switch','游戏',{bg:'#f2f4f7',bg2:'#e3e7ed',surface:'#ffffff','surface-2':'#eceff4',text:'#2a2f3a','text-2':'#5d6674','text-3':'#97a0ae',accent:'#e60012','accent-2':'#ff8a00','on-accent':'#fff','bg-glow-a':'rgba(230,0,18,.14)','bg-glow-b':'rgba(255,138,0,.1)','bg-glow-c':'transparent'},'confetti','','controller3'),
  T('swiss','瑞士平面','艺术',{bg:'#ffffff',bg2:'#f0f0f0',surface:'#fafafa','surface-2':'#eeeeee',text:'#000000','text-2':'#555555','text-3':'#999999',accent:'#e63946','accent-2':'#1d3557','on-accent':'#fff','bg-glow-a':'rgba(230,57,70,.08)','bg-glow-b':'rgba(29,53,87,.06)','bg-glow-c':'transparent'},'geometric','','grid'),
  T('bauhaus','包豪斯','艺术',{bg:'#f2eadf',bg2:'#e6dcc8',surface:'#fbf6ec','surface-2':'#efe4d2',text:'#1d1a15','text-2':'#524c40','text-3':'#8a8374',accent:'#c62828','accent-2':'#1565c0','on-accent':'#fff','bg-glow-a':'rgba(198,40,40,.12)','bg-glow-b':'rgba(21,101,192,.1)','bg-glow-c':'rgba(245,166,35,.1)'},'geometric','','bauhaus'),
  T('memphis','孟菲斯','潮流',{bg:'#fff3e0',bg2:'#ffe4c2',surface:'#fffaf2','surface-2':'#ffedd8',text:'#2b2140','text-2':'#605070','text-3':'#9a8aa8',accent:'#ff5d8f','accent-2':'#3ec1d3','on-accent':'#fff','bg-glow-a':'rgba(255,93,143,.16)','bg-glow-b':'rgba(62,193,211,.14)','bg-glow-c':'rgba(255,200,60,.12)'},'confetti','memphis','squiggle'),
  T('acid','酸性图形','潮流',{bg:'#0f0f14',bg2:'#161620',surface:'#18181f','surface-2':'#22222c',text:'#eef0e8','text-2':'#b0b4aa','text-3':'#767c72',accent:'#c8ff00','accent-2':'#9d4edd','on-accent':'#161a00','bg-glow-a':'rgba(200,255,0,.12)','bg-glow-b':'rgba(157,78,221,.16)','bg-glow-c':'transparent'},'acid','','acid2'),
  T('y2k','Y2K 千禧','潮流',{bg:'#dcd6f2',bg2:'#c9c0e8',surface:'#f4f0ff','surface-2':'#e6dff6',text:'#3a2f5c','text-2':'#6a5f8c','text-3':'#9c92b8',accent:'#b794ff','accent-2':'#7ee8fa','on-accent':'#fff','bg-glow-a':'rgba(183,148,255,.2)','bg-glow-b':'rgba(126,232,250,.14)','bg-glow-c':'rgba(255,170,220,.12)'},'bubbles','','chrome'),
  T('klein','克莱因蓝','艺术',{bg:'#0a0a3d',bg2:'#12124f',surface:'#151552','surface-2':'#1e1e62',text:'#e8e8ff','text-2':'#b0b0dd','text-3':'#7c7cb0',accent:'#3a3ae6','accent-2':'#6c6cf0','on-accent':'#fff','bg-glow-a':'rgba(58,58,230,.22)','bg-glow-b':'rgba(108,108,240,.12)','bg-glow-c':'transparent'},'stardust','','klein'),
  T('macaron','马卡龙','潮流',{bg:'#fdeef2',bg2:'#f9dce6',surface:'#fff9fb','surface-2':'#fbe8ee',text:'#6a4a52','text-2':'#9a7680','text-3':'#c0a0aa',accent:'#f48fb1','accent-2':'#b3e5fc','on-accent':'#fff','bg-glow-a':'rgba(244,143,177,.16)','bg-glow-b':'rgba(179,229,252,.14)','bg-glow-c':'rgba(255,224,178,.1)'},'petals','','macaron'),
  T('editorial','黑金杂志','质感',{bg:'#f4f1ea',bg2:'#e9e4d8',surface:'#fbf9f4','surface-2':'#efeadd',text:'#1c1a17','text-2':'#524e46','text-3':'#8a867c',accent:'#b89b5e','accent-2':'#8c7a4e','on-accent':'#fff','bg-glow-a':'rgba(184,155,94,.12)','bg-glow-b':'transparent','bg-glow-c':'transparent'},'geometric','luxe','magazine'),
  T('parchment','古籍羊皮','质感',{bg:'#e6d9bd',bg2:'#d8c8a6',surface:'#f2e8cf','surface-2':'#e4d7ba',text:'#3a2c18','text-2':'#6b5d44','text-3':'#9c8d72',accent:'#6b4e26','accent-2':'#8c6a3a','on-accent':'#f3ead2','bg-glow-a':'rgba(107,78,38,.14)','bg-glow-b':'rgba(140,106,58,.1)','bg-glow-c':'transparent'},'fog','paper','scroll'),
  T('typewriter','打字机旧报','质感',{bg:'#e2ddd0',bg2:'#d4cebc',surface:'#ede9db','surface-2':'#dfd9c8',text:'#26231c','text-2':'#57534a','text-3':'#8a867c',accent:'#2a2620','accent-2':'#6b6458','on-accent':'#e9e4d6','bg-glow-a':'rgba(50,46,38,.12)','bg-glow-b':'transparent','bg-glow-c':'transparent'},'fog','paper','key'),
  T('halloween','万圣节','节日',{bg:'#1a1410',bg2:'#241b15',surface:'#282019','surface-2':'#342a20',text:'#f5e6d0','text-2':'#c4ac94','text-3':'#8a7464',accent:'#ff7518','accent-2':'#9acd32','on-accent':'#1a0e00','bg-glow-a':'rgba(255,117,24,.18)','bg-glow-b':'rgba(154,205,50,.1)','bg-glow-c':'rgba(120,40,160,.12)'},'embers','festive','pumpkin'),
  T('xmas','圣诞雪夜','节日',{bg:'#0c1f17',bg2:'#122a1f',surface:'#143024','surface-2':'#1c3d2e',text:'#e8f5ec','text-2':'#a8c8b4','text-3':'#6c8c7c',accent:'#d03a34','accent-2':'#2f9e44','on-accent':'#fff','bg-glow-a':'rgba(208,58,52,.14)','bg-glow-b':'rgba(47,158,68,.14)','bg-glow-c':'rgba(240,240,220,.06)'},'snow','festive','tree'),
  T('springfest','春节红金','节日',{bg:'#6e0d0d',bg2:'#8c1414',surface:'#8f1818','surface-2':'#a52424',text:'#ffe9b8','text-2':'#d8b878','text-3':'#b09060',accent:'#ffd24a','accent-2':'#ff9d3a','on-accent':'#4a0a00','bg-glow-a':'rgba(255,210,74,.18)','bg-glow-b':'rgba(255,157,58,.12)','bg-glow-c':'rgba(255,80,60,.1)'},'gold','festive','lantern'),
  T('midautumn','中秋月夜','节日',{bg:'#101a3a',bg2:'#1a2548',surface:'#18264d','surface-2':'#22335c',text:'#eef2ff','text-2':'#b4c0de','text-3':'#7c8ab0',accent:'#f2c14e','accent-2':'#8fa8d8','on-accent':'#2a1c00','bg-glow-a':'rgba(242,193,78,.16)','bg-glow-b':'rgba(143,168,216,.12)','bg-glow-c':'transparent'},'stars','festive','moon'),
  T('galaxy','银河星穹','质感',{bg:'#05030f',bg2:'#0c0820',surface:'#0f0a26','surface-2':'#191238',text:'#ece9ff','text-2':'#b4aed8','text-3':'#7a7498',accent:'#b48eff','accent-2':'#67e8f9','on-accent':'#fff','bg-glow-a':'rgba(180,142,255,.18)','bg-glow-b':'rgba(103,232,249,.1)','bg-glow-c':'rgba(255,120,200,.08)'},'galaxy','','galaxy'),
  T('boulevard','日落大道','潮流',{bg:'#ffd1a4',bg2:'#ffb884',surface:'#fff1e0','surface-2':'#fce2c8',text:'#553311','text-2':'#8a6240','text-3':'#bb9472',accent:'#ff8c42','accent-2':'#c1437e','on-accent':'#fff','bg-glow-a':'rgba(255,140,66,.2)','bg-glow-b':'rgba(193,67,126,.12)','bg-glow-c':'rgba(255,200,80,.14)'},'embers','','road'),
  T('matcha','抹茶和果子','自然',{bg:'#e9f0dc',bg2:'#d8e4c4',surface:'#f7fae9','surface-2':'#e8f0d6',text:'#2f3d20','text-2':'#5d6e4a','text-3':'#8e9e78',accent:'#7ba05b','accent-2':'#e8b4bc','on-accent':'#fff','bg-glow-a':'rgba(123,160,91,.18)','bg-glow-b':'rgba(232,180,188,.12)','bg-glow-c':'transparent'},'petals','','tea'),
  T('nautilus','海底两万里','艺术',{bg:'#041424',bg2:'#082033',surface:'#092438','surface-2':'#0e3248',text:'#d6ecf5','text-2':'#9cc0cc','text-3':'#668a98',accent:'#2bb3c0','accent-2':'#d4a24c','on-accent':'#04141c','bg-glow-a':'rgba(43,179,192,.16)','bg-glow-b':'rgba(212,162,76,.1)','bg-glow-c':'transparent'},'bubbles','','submarine'),
  T('volcano','火山熔岩','自然',{bg:'#1c0a07',bg2:'#2b100c',surface:'#2d120e','surface-2':'#3d1a14',text:'#ffe8dc','text-2':'#d4ac9c','text-3':'#9c7266',accent:'#ff5722','accent-2':'#ffc107','on-accent':'#fff','bg-glow-a':'rgba(255,87,34,.2)','bg-glow-b':'rgba(255,193,7,.1)','bg-glow-c':'rgba(200,40,20,.12)'},'embers','','volcano'),
  T('cyberlav','电子薰衣草','霓虹',{bg:'#16122b',bg2:'#201a3d',surface:'#241d40','surface-2':'#302852',text:'#ece7ff','text-2':'#b8b0d8','text-3':'#827aa0',accent:'#a78bfa','accent-2':'#f0abfc','on-accent':'#fff','bg-glow-a':'rgba(167,139,250,.2)','bg-glow-b':'rgba(240,171,252,.14)','bg-glow-c':'transparent'},'neonrain','neon','sparkle2'),
  T('dawn','破晓晨光','自然',{bg:'#fdeedf',bg2:'#f8ddc2',surface:'#fffaf3','surface-2':'#fbeedd',text:'#4d3a22','text-2':'#7d6850','text-3':'#b0a08c',accent:'#f2994a','accent-2':'#7fb3ff','on-accent':'#fff','bg-glow-a':'rgba(242,153,74,.18)','bg-glow-b':'rgba(127,179,255,.12)','bg-glow-c':'rgba(255,200,140,.12)'},'stardust','','sunrise')
];

/* ============================================================
   二、特色图标（皮肤 mark，24×24，currentColor）
   ============================================================ */
const MARKS = {
  drop: '<path d="M12 3S6 10 6 14a6 6 0 0 0 12 0c0-4-6-11-6-11z" fill="currentColor"/>',
  pokeball: '<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M3.5 12h5.7m5.6 0h5.7" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="2.3" fill="currentColor"/>',
  bolt: '<path d="M13 2 4.5 13.5H11l-1 8.5L19.5 10H13z" fill="currentColor"/>',
  sprout: '<path d="M12 20v-7M12 13c0-4 3-6 7-6 0 4-3 6-7 6zM12 13c0-4-3-6-7-6 0 4 3 6 7 6z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  cloud: '<path d="M7 18a4 4 0 0 1-.5-8 5.2 5.2 0 0 1 10 1.2A3.6 3.6 0 0 1 17 18z" fill="currentColor" opacity=".92"/>',
  brush: '<path d="M4.5 19.5c2.6 0 3.6-1.4 5.2-3.4l7.8-7.8-2.8-2.8-7.8 7.8c-2 1.6-2.8 2.8-2.4 6.2z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
  palette: '<path d="M12 3a9 9 0 0 0 0 18c1.3 0 2-1 2-2 0-1.4-1-1.7-1-2.8 0-1 .8-1.7 1.8-1.7H17a4 4 0 0 0 4-4c0-4-4-7.5-9-7.5z" fill="currentColor" opacity=".9"/><circle cx="7.5" cy="10.5" r="1.2" fill="#fff"/><circle cx="10" cy="7.2" r="1.2" fill="#fff"/><circle cx="14.5" cy="7" r="1.2" fill="#fff"/><circle cx="17" cy="10" r="1.2" fill="#fff"/>',
  circle: '<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/>',
  crown: '<path d="4 18h16M5 18l1.5-9 4.5 4L12 5l1 8 4.5-4L19 18z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
  sun: '<circle cx="12" cy="12" r="4" fill="currentColor"/><g stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5 5l1.8 1.8M17.2 17.2 19 19M19 5l-1.8 1.8M6.8 17.2 5 19"/></g>',
  wave: '<path d="M3 8.5c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 15.5c2-2 4-2 6 0s4 2 6 0 4-2 6 0" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  leaf: '<path d="M5 19C5 10 12 5 19 5c0 9-6 14-14 14zM5 19C9 15 12 12 15 9" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  flower: '<g fill="currentColor"><circle cx="12" cy="6.5" r="2.6"/><circle cx="17.5" cy="12" r="2.6"/><circle cx="12" cy="17.5" r="2.6"/><circle cx="6.5" cy="12" r="2.6"/><circle cx="12" cy="12" r="2" fill="#fff" opacity=".85"/></g>',
  sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" fill="currentColor"/><path d="M18.5 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" fill="currentColor" opacity=".7"/>',
  lily: '<path d="M12 20c0-6-4-9-8.5-9C4 16 7 19.5 12 20zM12 20c0-6 4-9 8.5-9C20 16 17 19.5 12 20z" fill="currentColor" opacity=".85"/>',
  star: '<path d="M12 3l2.6 5.6 6 .8-4.4 4.2 1.1 6L12 17l-5.3 2.6 1.1-6L3.4 9.4l6-.8z" fill="currentColor"/>',
  ornament: '<circle cx="12" cy="12" r="3" fill="currentColor"/><g fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="9.5"/></g>',
  triangle: '<path d="M5 18 12 5l7 13z" fill="currentColor" opacity=".9"/><path d="M9 18l3-5 3 5" stroke="#fff" stroke-width="1.3"/>',
  sun2: '<circle cx="12" cy="12.5" r="5" fill="currentColor"/><g stroke="currentColor" stroke-width="1.4"><path d="M3.5 20h17M5 17.6h14M6.8 15.2h10.4"/></g>',
  city: '<g fill="currentColor"><path d="M3 20V9h4V5h5v15M13 20v-8h5v8M19 20v-5h2v5z"/></g>',
  terminal: '<rect x="3" y="4.5" width="18" height="15" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M6.5 9l3 3-3 3M11.5 15h5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  planet: '<circle cx="12" cy="12" r="6" fill="currentColor"/><ellipse cx="12" cy="12" rx="10" ry="3.4" fill="none" stroke="currentColor" stroke-width="1.4" transform="rotate(-20 12 12)"/>',
  aurora: '<path d="M4 16c4-9 7 4 10-3 2-4.5 3.5 2 6-2" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M4 20c4-7 7 3 10-2 2-3.5 3.5 1.5 6-1.5" fill="none" stroke="currentColor" stroke-width="1.4" opacity=".6" stroke-linecap="round"/>',
  ice: '<g stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M12 2.5v19M4 7l16 10M20 7 4 17"/></g>',
  dune: '<path d="M2 18c4-5 7-1 10-3s6-3 10 0v5H2z" fill="currentColor" opacity=".85"/><circle cx="17" cy="7" r="2.4" fill="currentColor"/>',
  palm: '<path d="M12 20c-1-5 0-9 2-12" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M14 8c-4-3-8-1-9 2 3 0 6 0 9-2zM14 8c2-4 6-4 9-3-2 3-5 4-9 3zM14 8c-1 4 0 7 2 9" fill="none" stroke="currentColor" stroke-width="1.5"/>',
  porcelain: '<path d="M8 3h8M9 3c-2 4-3 8-1 13a4 4 0 0 0 8 0c2-5 1-9-1-13" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8.5 11h7" stroke="currentColor" stroke-width="1.3"/>',
  ribbon: '<path d="M3 8c4 3 6-3 9 0s6 3 9 0M3 14c4 3 6-3 9 0s6 3 9 0" fill="none" stroke="currentColor" stroke-width="1.6"/>',
  pillar: '<rect x="7" y="3" width="10" height="18" rx="1" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M5 3h14M5 21h14M10 7v10M14 7v10" stroke="currentColor" stroke-width="1.4"/>',
  crane: '<path d="M3 11c4 0 6-4 9-4s5 2 9 1M3 17c4 0 6-4 9-4s5 2 9 1" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  enso: '<path d="M19.5 8A8.5 8.5 0 1 0 20 13" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>',
  sword: '<path d="M5 19l8.5-8.5M13.5 4.5l6 6-3 3-6-6z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
  controller: '<path d="M7 8h10a5 5 0 0 1 4.5 7l-1 2a2.5 2.5 0 0 1-4.4-.4L15 15H9l-1.1 1.6A2.5 2.5 0 0 1 3.5 17l-1-2A5 5 0 0 1 7 8z" fill="currentColor" opacity=".9"/><circle cx="16.5" cy="10.5" r="1" fill="#fff"/><circle cx="18" cy="12" r="1" fill="#fff"/>',
  controller2: '<path d="M7 8h10a5 5 0 0 1 4.5 7l-1 2a2.5 2.5 0 0 1-4.4-.4L15 15H9l-1.1 1.6A2.5 2.5 0 0 1 3.5 17l-1-2A5 5 0 0 1 7 8z" fill="currentColor" opacity=".9"/><path d="M8 9.8v2.4M6.8 11h2.4" stroke="#fff" stroke-width="1.2"/>',
  controller3: '<path d="M7 8h10a5 5 0 0 1 4.5 7l-1 2a2.5 2.5 0 0 1-4.4-.4L15 15H9l-1.1 1.6A2.5 2.5 0 0 1 3.5 17l-1-2A5 5 0 0 1 7 8z" fill="currentColor" opacity=".9"/><circle cx="17" cy="11" r="1.2" fill="#fff"/>',
  grid: '<g fill="currentColor"><rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/></g>',
  bauhaus: '<circle cx="9" cy="9" r="5" fill="currentColor" opacity=".85"/><path d="M14 19l6-9h-12z" fill="currentColor" opacity=".6"/>',
  squiggle: '<path d="M3 12q3-5.5 6 0t6 0t6 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  acid2: '<path d="M12 3c3 3 6 3 6 7 0 4-3 4-3 7s-6 3-6-1 3-3 3-7-3-4 0-6z" fill="currentColor"/>',
  chrome: '<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 3.5a8.5 8.5 0 0 1 0 17" fill="currentColor" opacity=".7"/>',
  klein: '<rect x="4" y="4" width="16" height="16" rx="1" fill="currentColor"/><circle cx="12" cy="12" r="4.5" fill="none" stroke="#fff" stroke-width="1.5"/>',
  macaron: '<rect x="4" y="7" width="16" height="9" rx="4.5" fill="currentColor"/><path d="M4 11.5h16" stroke="#fff" stroke-width="1.3" opacity=".7"/>',
  magazine: '<rect x="5" y="3" width="14" height="18" rx="1" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M8 7h8M8 10h8M8 13h5" stroke="currentColor" stroke-width="1.4"/>',
  scroll: '<path d="M6 4h13v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M9 8h7M9 11h7M9 14h4" stroke="currentColor" stroke-width="1.3"/>',
  key: '<circle cx="8" cy="9" r="4.5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M11.2 12.2 20 21M17 18l2-2M15 16l2-2" stroke="currentColor" stroke-width="1.7"/>',
  pumpkin: '<path d="M12 7c-1.5-1.5-3-1.5-4.5 0M4 14c0-4 3.5-7 8-7s8 3 8 7-3.5 7-8 7-8-3-8-7z" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 7v14M8 8.5C7 11 7 17 8 19.5M16 8.5c1 2.5 1 8.5 0 11" stroke="currentColor" stroke-width="1.2"/>',
  tree: '<path d="M12 3 5 12h3l-4 6h16l-4-6h3z" fill="currentColor"/><path d="M12 18v3" stroke="currentColor" stroke-width="1.8"/>',
  lantern: '<rect x="8" y="3.5" width="8" height="2" rx="1" fill="currentColor"/><ellipse cx="12" cy="11" rx="6" ry="6.5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 5v12M7 8h10M7 14h10" stroke="currentColor" stroke-width="1.2"/><path d="M12 17.5v3M10.5 20.5h3" stroke="currentColor" stroke-width="1.5"/>',
  moon: '<path d="M20 13a8 8 0 1 1-9-10 6.5 6.5 0 0 0 9 10z" fill="currentColor"/>',
  galaxy: '<circle cx="12" cy="12" r="1.6" fill="currentColor"/><g fill="none" stroke="currentColor" stroke-width="1.3" opacity=".8"><path d="M12 4c5 0 8 3.5 8 8M20 12c0 5-3 8-8 8M4 12c0-4 2.5-7 6.5-7.7M4.5 13.5C4.8 18 8 20 12 20"/></g>',
  road: '<path d="M4 20 9 4h6l5 16M10 4l2 16M14 4l-2 16" fill="none" stroke="currentColor" stroke-width="1.6"/>',
  tea: '<path d="M5 9h11v5a5 5 0 0 1-10 0V9zM16 10h2a2 2 0 0 1 0 4h-2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M8 5c-.8 1 .8 1.5 0 2.5M11.5 5c-.8 1 .8 1.5 0 2.5" stroke="currentColor" stroke-width="1.4"/>',
  submarine: '<path d="M3 14c0-2.5 4-4 9-4s9 1.5 9 4-4 4-9 4-9-1.5-9-4zM14 10V6M14 6h3" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="9" cy="14" r="1.2" fill="currentColor"/>',
  volcano: '<path d="M2 20 9 6l3 5 3-5 7 14z" fill="currentColor" opacity=".85"/><path d="M9 6c1 2 2 2 3 0M15 6c-1 2 0 3 1 1" stroke="#ffc107" stroke-width="1.4" fill="none"/>',
  sparkle2: '<path d="M12 2.5c.7 5 4.5 8.8 9.5 9.5-5 .7-8.8 4.5-9.5 9.5-.7-5-4.5-8.8-9.5-9.5 5-.7 8.8-4.5 9.5-9.5z" fill="currentColor"/>',
  sunrise: '<path d="M4 18h16M8 18a4 4 0 0 1 8 0M12 6v4M5.5 9.5l1.5 1.5M18.5 9.5 17 11" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>'
};

/* ============================================================
   三、皮肤应用
   ============================================================ */
let currentTheme = null;
function getTheme(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }

function applyTheme(id, opts) {
  opts = opts || {};
  const t = getTheme(id);
  currentTheme = t;
  const root = document.documentElement;
  for (const k in t.v) root.style.setProperty('--' + k, t.v[k]);
  document.body.className = 'flag-' + (t.flags ? t.flags + ' skin-' + t.id : 'none skin-' + t.id);
  if (!opts.skipFavicon) setFavicon(t);
  const meta = document.querySelector('meta[name=theme-color]');
  if (meta) meta.setAttribute('content', t.v.bg);
  startParticles(t.fx, t);
  return t;
}
function setFavicon(t) {
  const mark = MARKS[t.mark] || MARKS.drop;
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">' +
    '<rect width="512" height="512" rx="116" fill="' + t.v.bg + '"/>' +
    '<g transform="translate(128 128) scale(10.67)" fill="none" stroke="' + t.v.accent + '" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' +
    mark.replace(/fill="currentColor"/g, 'fill="' + t.v.accent + '"').replace(/stroke="currentColor"/g, 'stroke="' + t.v.accent + '"') +
    '</g></svg>';
  let link = document.querySelector('link[rel=icon]');
  link.href = 'data:image/svg+xml,' + encodeURIComponent(svg);
}
function markSVG(key, cls) {
  return '<svg class="' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + (MARKS[key] || MARKS.drop) + '</svg>';
}

/* ============================================================
   四、粒子引擎
   ============================================================ */
const canvas = document.getElementById('fx-canvas');
const ctx = canvas.getContext('2d');
let W = 0, H = 0, DPR = 1;
let particles = [];
let running = false;
let rafId = null;
let currentFx = null;
let themeRef = null;
let columns = [], gridT = 0, auroraT = 0;
let bursts = [];

function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth; H = window.innerHeight;
  canvas.width = W * DPR; canvas.height = H * DPR;
  canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
window.addEventListener('resize', resize);
resize();

function hexA(hex, a) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const n = parseInt(hex, 16);
  return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
}
const rand = (a, b) => a + Math.random() * (b - a);
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

function colors(t) {
  return [t.v.accent, t.v['accent-2'], t.v.text, t.v['text-3'], '#ffffff'];
}

function countFor(base) {
  const d = Store.settings().particleDensity;
  return Math.round(base * d * Math.min(W * H / 900000, 2.2));
}

function makeParticle(type, t, init) {
  const c = colors(t);
  const p = { x: rand(0, W), y: rand(0, H), s: rand(1.5, 4), vx: 0, vy: rand(.3, 1), a: rand(.35, .9), rot: rand(0, Math.PI * 2), vr: rand(-.03, .03), c: pick(c), sw: rand(.8, 1.6) };
  switch (type) {
    case 'snow': p.s = rand(1.5, 3.4); p.vy = rand(.4, 1.3); p.osc = rand(0, Math.PI * 2); break;
    case 'rain': p.vy = rand(7, 12); p.s = rand(10, 20); break;
    case 'neonrain': p.vy = rand(4, 9); p.s = rand(14, 34); p.a = rand(.4, .85); p.c = pick([t.v.accent, t.v['accent-2']]); break;
    case 'matrix': p.c = t.v.accent; p.s = rand(13, 19); p.a = 1; break;
    case 'embers': p.vy = -rand(.35, 1.2); p.s = rand(1.2, 3); p.osc = rand(0, 6.28); break;
    case 'gold': p.vy = -rand(.4, 1.1); p.s = rand(2, 4.5); break;
    case 'bubbles': p.vy = -rand(.4, 1.4); p.s = rand(2.5, 8); p.osc = rand(0, 6.28); break;
    case 'stardust': p.vy = rand(.05, .3); p.s = rand(.8, 2); p.vx = rand(-.15, .15); break;
    case 'geometric': p.vy = rand(.1, .5); p.vx = rand(-.2, .2); p.s = rand(4, 12); p.sides = pick([3, 4, 6]); break;
    case 'glassbits': p.vy = rand(.1, .4); p.vx = rand(-.2, .2); p.s = rand(8, 26); p.a = rand(.05, .16); break;
    case 'pixels': p.vy = rand(.4, 1.2); p.vx = rand(-.3, .3); p.s = rand(3, 7); break;
    case 'ink': p.vy = rand(.2, .7); p.vx = rand(-.2, .2); p.s = rand(14, 40); p.a = rand(.04, .12); p.c = t.v.text; break;
    case 'fog': p.vx = rand(.1, .5); p.s = rand(60, 140); p.a = rand(.03, .08); p.c = t.v.surface; break;
    case 'sand': p.vx = rand(1.2, 3); p.vy = rand(.1, .4); p.s = rand(.8, 2.2); p.osc = rand(0, 6.28); break;
    case 'feathers': p.vy = rand(.3, .8); p.vx = rand(.2, .7); p.s = rand(7, 14); p.osc = rand(0, 6.28); break;
    case 'confetti': p.vy = rand(1, 2.5); p.s = rand(5, 9); p.vr = rand(-.12, .12); break;
    case 'petals': case 'sakura': p.s = rand(5, 9); p.vy = rand(.5, 1.3); p.osc = rand(0, 6.28); p.vx = rand(-.4, .4); break;
    case 'leaves': p.s = rand(6, 11); p.vy = rand(.5, 1.2); p.osc = rand(0, 6.28); p.vx = rand(-.3, .5); break;
    case 'acid': p.s = rand(16, 40); p.vy = rand(.1, .4); p.vx = rand(-.2, .2); p.c = pick([t.v.accent, t.v['accent-2']]); p.a = rand(.5, .9); break;
    case 'vapor': p.s = rand(3, 9); p.vy = rand(.2, .8); p.vx = rand(-.2, .2); break;
  }
  if (init) Object.assign(p, init);
  return p;
}

const BASE_COUNT = {
  snow: 120, rain: 90, neonrain: 60, matrix: 0, embers: 70, gold: 60, bubbles: 45,
  stardust: 90, geometric: 28, glassbits: 22, pixels: 50, ink: 18, fog: 12, sand: 110,
  feathers: 26, confetti: 60, petals: 45, sakura: 45, leaves: 40, acid: 16, vapor: 40,
  stars: 0, galaxy: 0, aurora: 0, synthgrid: 0, vaporgrid: 0
};

function startParticles(type, t) {
  currentFx = type; themeRef = t;
  particles = []; columns = []; bursts = []; gridT = 0; auroraT = 0;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  running = Store.settings().particles && !reduced;
  if (!running) { ctx.clearRect(0, 0, W, H); return; }
  if (type === 'matrix') initMatrix(t);
  if (baseCount(type)) {
    const n = countFor(baseCount(type));
    for (let i = 0; i < n; i++) particles.push(makeParticle(type, t));
  }
  if (type === 'stars') initStars(t);
  if (type === 'galaxy') initGalaxy(t);
  loop();
}
function baseCount(type) { return BASE_COUNT[type] !== undefined ? BASE_COUNT[type] : 0; }

function initMatrix(t) {
  const size = 16;
  const chars = 'ｱｲｳｴｵｶｷｸｹｺ0123456789ABCDEF$#<>*+-';
  for (let x = 0; x < W; x += size) columns.push({ x, y: rand(-H, 0), sp: rand(.5, 1.4), size, chars });
}
function initStars(t) {
  const n = countFor(150);
  for (let i = 0; i < n; i++) particles.push(Object.assign(makeParticle('stardust', t), { vy: 0, tw: rand(0, 6.28), s: rand(.6, 2.2) }));
}
function initGalaxy(t) {
  const n = countFor(220);
  for (let i = 0; i < n; i++) {
    const ang = rand(0, Math.PI * 2), r = rand(20, Math.max(W, H) * .7);
    particles.push(Object.assign(makeParticle('stardust', t), { x: W / 2 + Math.cos(ang) * r, y: H / 2 + Math.sin(ang) * r * .6, ang, r, s: rand(.6, 2.4), vy: 0, spin: rand(.0006, .002) }));
  }
}

function loop() {
  if (!running) return;
  rafId = requestAnimationFrame(loop);
  ctx.clearRect(0, 0, W, H);
  const t = themeRef;

  switch (currentFx) {
    case 'matrix': drawMatrix(t); break;
    case 'stars': drawStars(t); break;
    case 'galaxy': drawGalaxy(t); break;
    case 'aurora': drawAurora(t); break;
    case 'synthgrid': drawSynthGrid(t); break;
    case 'vapor': drawVapor(t); break;
  }
  updateGeneric(t);
  drawBursts();
}

function updateGeneric(t) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.rot += p.vr || 0;
    switch (currentFx) {
      case 'snow': p.osc += .02; p.x += Math.sin(p.osc) * .6; p.y += p.vy; break;
      case 'rain': case 'neonrain': p.y += p.vy; break;
      case 'embers': case 'gold': p.osc += .03; p.x += Math.sin(p.osc) * .5; p.y += p.vy; break;
      case 'bubbles': p.osc += .02; p.x += Math.sin(p.osc) * .4; p.y += p.vy; break;
      case 'sand': p.osc += .1; p.y += p.vy + Math.sin(p.osc) * .5; p.x += p.vx; break;
      case 'fog': p.x += p.vx; break;
      case 'feathers': p.osc += .04; p.x += p.vx + Math.sin(p.osc) * .5; p.y += p.vy; break;
      case 'petals': case 'sakura': case 'leaves':
        p.osc += .03; p.x += p.vx + Math.sin(p.osc) * .8; p.y += p.vy; break;
      default: p.x += p.vx || 0; p.y += p.vy || 0;
    }

    if (p.y > H + 30) { p.y = -20; p.x = rand(0, W); }
    if (p.y < -30) { p.y = H + 20; p.x = rand(0, W); }
    if (p.x > W + 30) p.x = -20;
    if (p.x < -30) p.x = W + 20;

    drawParticle(p, currentFx);
  }
}

function drawParticle(p, type) {
  ctx.save();
  ctx.globalAlpha = p.a;
  switch (type) {
    case 'rain':
      ctx.strokeStyle = p.c; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - 2, p.y + p.s); ctx.stroke(); break;
    case 'neonrain':
      ctx.shadowColor = p.c; ctx.shadowBlur = 8;
      ctx.strokeStyle = p.c; ctx.lineWidth = p.sw;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x, p.y + p.s); ctx.stroke(); break;
    case 'snow':
      ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, 6.28); ctx.fill(); break;
    case 'embers': case 'gold':
      ctx.shadowColor = p.c; ctx.shadowBlur = 10;
      ctx.fillStyle = p.c;
      if (type === 'gold') ctx.fillRect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s);
      else { ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, 6.28); ctx.fill(); }
      break;
    case 'bubbles':
      ctx.strokeStyle = p.c; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, 6.28); ctx.stroke();
      ctx.globalAlpha = p.a * .5;
      ctx.beginPath(); ctx.arc(p.x - p.s * .3, p.y - p.s * .3, p.s * .25, 0, 6.28); ctx.fill(); break;
    case 'stardust':
      ctx.shadowColor = p.c; ctx.shadowBlur = 6;
      ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, 6.28); ctx.fill(); break;
    case 'geometric':
      ctx.strokeStyle = p.c; ctx.lineWidth = 1.2;
      polygon(p.x, p.y, p.s, p.sides, p.rot); ctx.stroke(); break;
    case 'glassbits':
      ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, 6.28); ctx.fill();
      ctx.strokeStyle = p.c; ctx.globalAlpha = p.a * 2; ctx.stroke(); break;
    case 'pixels':
      ctx.fillStyle = p.c; ctx.fillRect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s); break;
    case 'ink':
      ctx.filter = 'blur(6px)';
      ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, 6.28); ctx.fill(); break;
    case 'fog':
      ctx.filter = 'blur(30px)';
      ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, 6.28); ctx.fill(); break;
    case 'sand':
      ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, p.s, p.s * 1.6); break;
    case 'feathers':
      ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.strokeStyle = p.c; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(0, 0, p.s, p.s * .45, 0, 0, 6.28); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-p.s, 0); ctx.lineTo(p.s, 0); ctx.stroke(); break;
    case 'confetti':
      ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); break;
    case 'petals': case 'sakura':
      ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.fillStyle = p.c;
      ctx.beginPath(); ctx.ellipse(0, 0, p.s, p.s * .6, 0, 0, 6.28); ctx.fill(); break;
    case 'leaves':
      ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.fillStyle = p.c;
      ctx.beginPath(); ctx.moveTo(0, -p.s); ctx.quadraticCurveTo(p.s, 0, 0, p.s); ctx.quadraticCurveTo(-p.s, 0, 0, -p.s); ctx.fill(); break;
    case 'acid':
      ctx.shadowColor = p.c; ctx.shadowBlur = 14;
      ctx.strokeStyle = p.c; ctx.lineWidth = 1.6;
      blobPath(p); ctx.stroke(); break;
    case 'vapor':
      ctx.fillStyle = p.c;
      polygon(p.x, p.y, p.s, 3, p.rot); ctx.fill(); break;
  }
  ctx.restore();
}
function polygon(x, y, r, sides, rot) {
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const a = rot + i / sides * Math.PI * 2;
    const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.closePath();
}
function blobPath(p) {
  ctx.beginPath();
  for (let i = 0; i <= 10; i++) {
    const a = i / 10 * 6.28;
    const r = p.s * (1 + .35 * Math.sin(a * 3 + p.rot));
    const x = p.x + Math.cos(a) * r, y = p.y + Math.sin(a) * r;
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.closePath();
}

function drawMatrix(t) {
  ctx.font = '15px monospace';
  for (const c of columns) {
    const ch = pick(c.chars.split(''));
    const y = c.y;
    ctx.fillStyle = hexA(t.v.accent, .9);
    ctx.fillText(ch, c.x, y);
    ctx.fillStyle = hexA(t.v.accent, .3);
    ctx.fillText(pick(c.chars.split('')), c.x, y - c.size);
    c.y += c.sp * c.size * .5;
    if (c.y > H + 40) { c.y = rand(-200, 0); c.sp = rand(.5, 1.4); }
  }
}
function drawStars(t) {
  for (const p of particles) {
    p.tw += .04;
    ctx.save();
    ctx.globalAlpha = .3 + Math.abs(Math.sin(p.tw)) * .7;
    ctx.fillStyle = p.c;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, 6.28); ctx.fill();
    ctx.restore();
  }
  if (Math.random() < .012) {
    const sx = rand(0, W * .7), sy = rand(0, H * .3), len = rand(80, 200);
    bursts.push({ type: 'shoot', x: sx, y: sy, vx: rand(6, 10), vy: rand(2, 4), life: 1, len });
  }
  for (const b of bursts) if (b.type === 'shoot') {
    ctx.strokeStyle = hexA('#ffffff', b.life); ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x - b.len, b.y - b.len * .35); ctx.stroke();
    b.x += b.vx; b.y += b.vy; b.life -= .02;
  }
  bursts = bursts.filter(b => b.life > 0);
}
function drawGalaxy(t) {
  for (const p of particles) {
    p.ang += p.spin;
    p.x = W / 2 + Math.cos(p.ang) * p.r;
    p.y = H / 2 + Math.sin(p.ang) * p.r * .6;
    ctx.save();
    ctx.globalAlpha = p.a;
    ctx.fillStyle = p.c;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, 6.28); ctx.fill();
    ctx.restore();
  }
}
function drawAurora(t) {
  auroraT += .004;
  for (let band = 0; band < 3; band++) {
    const col = [t.v.accent, t.v['accent-2'], '#a78bfa'][band];
    const grad = ctx.createLinearGradient(0, 0, 0, H * .8);
    grad.addColorStop(0, hexA(col, .02));
    grad.addColorStop(.4, hexA(col, .22));
    grad.addColorStop(1, hexA(col, 0));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 12) {
      const y = H * .45 + Math.sin(x * .006 + auroraT * 2 + band * 2) * H * .16 + band * H * .08;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
  }
  for (let i = 0; i < 40; i++) {
    if (!drawAurora.stars) drawAurora.stars = Array.from({ length: 40 }, () => ({ x: rand(0, W), y: rand(0, H * .6), s: rand(.5, 1.6) }));
    const s = drawAurora.stars[i];
    ctx.fillStyle = hexA('#ffffff', .6);
    ctx.beginPath(); ctx.arc(s.x, s.y, s.s, 0, 6.28); ctx.fill();
  }
}
function drawSynthGrid(t) {
  gridT += 1.2;
  const hor = H * .55;
  const sunG = ctx.createLinearGradient(0, hor - 150, 0, hor);
  sunG.addColorStop(0, t.v.accent); sunG.addColorStop(1, t.v['accent-2']);
  ctx.fillStyle = sunG;
  ctx.beginPath(); ctx.arc(W / 2, hor, 120, Math.PI, 0); ctx.fill();
  ctx.fillStyle = t.v.bg;
  for (let i = 0; i < 5; i++) ctx.fillRect(W / 2 - 120, hor - 90 + i * 22, 240, 8);
  ctx.strokeStyle = hexA(t.v['accent-2'], .7); ctx.lineWidth = 1.4;
  for (let i = 0; i < 18; i++) {
    const p = i / 17;
    ctx.beginPath();
    ctx.moveTo(W / 2, hor);
    ctx.lineTo(W * p, H);
    ctx.stroke();
  }
  for (let i = 0; i < 16; i++) {
    const y = hor + ((i * 26 + gridT) % (H - hor));
    const a = 1 - y / H;
    ctx.strokeStyle = hexA(t.v.accent, a);
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
}
function drawVapor(t) {
  // 远景棋盘地面
  ctx.save();
  ctx.strokeStyle = hexA(t.v['accent-2'], .35);
  for (let i = 0; i < 10; i++) {
    const y = H * .6 + i * i * 4 + (gridT % 20);
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  ctx.restore();
  gridT += .4;
}

/* ---------- 作答反馈爆发 ---------- */
function burst(x, y, good, t) {
  if (!Store.settings().particles) return;
  const col = good ? (Store.settings ? '#34d399' : '#34d399') : '#ff5d6c';
  for (let i = 0; i < 26; i++) {
    const a = rand(0, 6.28), sp = rand(2, 8);
    bursts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 2, life: 1, s: rand(2, 5), c: good ? pick(['#34d399', '#a3e635', '#facc15']) : pick(['#ff5d6c', '#fb7185']) });
  }
}
function drawBursts() {
  for (let i = bursts.length - 1; i >= 0; i--) {
    const b = bursts[i];
    if (b.type === 'shoot') continue;
    b.x += b.vx; b.y += b.vy; b.vy += .25; b.life -= .025;
    ctx.save();
    ctx.globalAlpha = Math.max(b.life, 0);
    ctx.fillStyle = b.c;
    ctx.beginPath(); ctx.arc(b.x, b.y, b.s, 0, 6.28); ctx.fill();
    ctx.restore();
    if (b.life <= 0) bursts.splice(i, 1);
  }
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) { if (rafId) cancelAnimationFrame(rafId); }
  else if (running && currentFx) loop();
});

/* ============================================================
   五、音效引擎（Web Audio 合成，4 套）
   ============================================================ */
let audioCtx = null;
function ac() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}
function tone(freq, t0, dur, type, vol) {
  const a = ac();
  const o = a.createOscillator(), g = a.createGain();
  o.type = type || 'sine';
  o.frequency.setValueAtTime(freq, a.currentTime + t0);
  g.gain.setValueAtTime(0, a.currentTime + t0);
  g.gain.linearRampToValueAtTime(vol, a.currentTime + t0 + .012);
  g.gain.exponentialRampToValueAtTime(.0001, a.currentTime + t0 + dur);
  o.connect(g); g.connect(a.destination);
  o.start(a.currentTime + t0); o.stop(a.currentTime + t0 + dur + .05);
}
const PACKS = {
  classic: { ok: [[523, 0, .14, 'sine'], [784, .1, .22, 'sine']], bad: [[196, 0, .28, 'sawtooth'], [160, .12, .3, 'sawtooth']], type: 'sine' },
  crystal: { ok: [[880, 0, .16, 'triangle'], [1174, .07, .18, 'triangle'], [1568, .14, .3, 'triangle']], bad: [[440, 0, .2, 'sine'], [349, .1, .24, 'sine'], [261, .2, .34, 'sine']] },
  pixel: { ok: [[659, 0, .09, 'square'], [880, .08, .16, 'square']], bad: [[220, 0, .1, 'square'], [185, .1, .1, 'square'], [155, .2, .22, 'square']] },
  piano: { ok: [[523, 0, .3, 'triangle'], [659, .02, .3, 'triangle'], [784, .04, .42, 'triangle']], bad: [[311, 0, .3, 'triangle'], [294, .12, .4, 'triangle']] }
};
function play(kind) {
  const s = Store.settings();
  if (!s.sound) return;
  if (kind === 'ok' && !s.soundOk) return;
  if (kind === 'bad' && !s.soundBad) return;
  try {
    const pack = PACKS[s.soundPack] || PACKS.classic;
    const notes = kind === 'ok' ? pack.ok : pack.bad;
    const vol = s.volume * .25;
    for (const n of notes) tone(n[0], n[1], n[2], n[3], vol);
  } catch (e) {}
}
function click() {
  const s = Store.settings();
  if (!s.sound) return;
  try { tone(1200, 0, .04, 'sine', s.volume * .06); } catch (e) {}
}

/* ============================================================
   六、字体系统
   ============================================================ */
const SYS = '-apple-system,BlinkMacSystemFont,"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif';
const FONTS = [
  { id: 'sys', name: '系统默认', sample: '温故而知新', stack: SYS },
  { id: 'hei', name: '经典黑体', sample: '业精于勤', stack: '"PingFang SC","Hiragino Sans GB","Microsoft YaHei","Heiti SC",sans-serif' },
  { id: 'song', name: '宋体书卷', sample: '学海无涯', stack: '"Songti SC","STSong","SimSun","Noto Serif CJK SC",serif' },
  { id: 'kai', name: '楷体雅致', sample: '宁静致远', stack: '"Kaiti SC","STKaiti","KaiTi","BiauKai",serif' },
  { id: 'li', name: '隶书古风', sample: '春华秋实', stack: '"LiSu","STLiti","Microsoft YaHei",serif' },
  { id: 'yuan', name: '圆润可爱', sample: '水滴石穿', stack: '"Yuanti SC","YouYuan","幼圆","PingFang SC",sans-serif' },
  { id: 'notosans', name: '思源黑体', sample: '博观约取', stack: '"Noto Sans SC",' + SYS, web: 'Noto Sans SC:400,500,700' },
  { id: 'notoserif', name: '思源宋体', sample: '厚积薄发', stack: '"Noto Serif SC","Songti SC","SimSun",serif', web: 'Noto Serif SC:400,600,700' },
  { id: 'kuai', name: '站酷快乐', sample: '乐在其中', stack: '"ZCOOL KuaiLe","Noto Sans SC",sans-serif', web: 'ZCOOL KuaiLe' },
  { id: 'xw', name: '站酷小薇', sample: '清风明月', stack: '"ZCOOL XiaoWei","Noto Serif SC",serif', web: 'ZCOOL XiaoWei' },
  { id: 'ms', name: '马善政毛笔', sample: '龙飞凤舞', stack: '"Ma Shan Zheng","KaiTi",cursive', web: 'Ma Shan Zheng' },
  { id: 'lj', name: '刘建草书', sample: '行云流水', stack: '"Liu Jian Mao Cao","KaiTi",cursive', web: 'Liu Jian Mao Cao' },
  { id: 'lc', name: '龙藏体', sample: '笔走龙蛇', stack: '"Long Cang","KaiTi",cursive', web: 'Long Cang' },
  { id: 'zm', name: '志莽行书', sample: '挥洒自如', stack: '"Zhi Mang Xing","KaiTi",cursive', web: 'Zhi Mang Xing' },
  { id: 'mono', name: '极客等宽', sample: '01010110', stack: 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace' }
];
let webLink = null;
function applyFont(id) {
  const f = FONTS.find(x => x.id === id) || FONTS[0];
  document.documentElement.style.setProperty('--font-main', f.stack);
  document.documentElement.style.setProperty('--font-display', f.stack);
  if (f.web) loadWeb(f);
  return f;
}
function loadWeb(f) {
  const fam = f.web.split(':')[0].replace(/ /g, '+');
  const href = 'https://fonts.googleapis.com/css2?family=' + fam + ':wght@400;500;700&display=swap';
  const href2 = 'https://fonts.loli.net/css2?family=' + fam + ':wght@400;500;700&display=swap';
  if (webLink) webLink.remove();
  webLink = document.createElement('link');
  webLink.rel = 'stylesheet';
  webLink.href = href;
  webLink.onerror = () => { webLink.href = href2; };
  document.head.appendChild(webLink);
}
function applyFontSize(m) {
  document.documentElement.style.fontSize = (16 * m) + 'px';
}

/* ============================================================
   七、启动
   ============================================================ */
function boot() {
  const s = Store.settings();
  applyTheme(s.theme);
  applyFont(s.font);
  applyFontSize(s.fontSize);
  applyCustom();
}
function applyCustom() {
  const s = Store.settings();
  const root = document.documentElement;
  const bg = document.getElementById('bg-layer');
  if (s.bgImg) { bg.classList.add('has-img'); root.style.setProperty('--bg-img', 'url("' + s.bgImg + '")'); }
  else { bg.classList.remove('has-img'); }
  root.style.setProperty('--bg-blur', s.bgBlur + 'px');
  root.style.setProperty('--overlay', s.overlay);
  root.style.setProperty('--hue', s.hue + 'deg');
  root.style.setProperty('--sat', s.sat);
  root.style.setProperty('--brightness', s.bright);
  if (s.accent) root.style.setProperty('--accent', s.accent);
}
function setParticlesEnabled(on) {
  const s = Store.settings();
  if (on) startParticles(currentTheme.fx, currentTheme);
  else {
    running = false; ctx.clearRect(0, 0, W, H);
  }
}

window.FX = {
  THEMES, MARKS, FONTS, PACKS,
  applyTheme, markSVG, setFavicon,
  burst, play, click,
  applyFont, applyFontSize, applyCustom, setParticlesEnabled,
  boot, current: () => currentTheme
};
})();
