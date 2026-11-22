// Takes the real screenshots used by the guide (guide/src/img/). Needs a running server (node server.js with PORT=4000):
//   node guide/src/capture.js en   |   node guide/src/capture.js ar
// It plays a short scripted game (bots, coins, a bomb) and captures phone / admin / big-screen pages with headless Chrome.
const R = require('path').join(__dirname, '..', '..') + '/';
const { io } = require(R + 'node_modules/socket.io-client');
const WebSocket = require(R + 'node_modules/ws');
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const LANG = process.argv[2] === 'ar' ? 'ar' : 'en';
const BASE = process.env.BASE || 'http://localhost:4080';
const NS = BASE.replace(/^http/, 'http');
const OUT = R + 'guide/src/img/'; fs.mkdirSync(OUT, { recursive: true });
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const emit = (s, ev, d) => new Promise((r) => s.emit(ev, d, r));
const coins = require(R + 'data/coins.json'), bombs = require(R + 'data/bombs.json');

class Page {
  constructor(ws) { this.ws = ws; this.id = 0; this.cb = {}; ws.on('message', (m) => { m = JSON.parse(m); if (m.id && this.cb[m.id]) { this.cb[m.id](m); delete this.cb[m.id]; } }); }
  send(method, params = {}) { return new Promise((r) => { const id = ++this.id; this.cb[id] = (m) => r(m.result || m); this.ws.send(JSON.stringify({ id, method, params })); }); }
  async eval(expr) { const r = await this.send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); return r.result && r.result.value; }
  async goto(url, wait = 1800) { await this.send('Page.navigate', { url }); await sleep(wait); }
  async view(w, h, mobile) { await this.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 2, mobile: !!mobile }); await this.send('Emulation.setTouchEmulationEnabled', { enabled: !!mobile }); }
  async shot(name, clip) {
    const r = await this.send('Page.captureScreenshot', { format: 'png', ...(clip ? { clip: { ...clip, scale: 1 }, captureBeyondViewport: true } : {}) });
    fs.writeFileSync(OUT + LANG + '-' + name + '.png', Buffer.from(r.data, 'base64'));
    console.log('shot', name);
  }
  async rect(sel) { return this.eval(`(()=>{const e=document.querySelector(${JSON.stringify(sel)});if(!e)return null;const r=e.getBoundingClientRect();return {x:r.left+scrollX,y:r.top+scrollY,width:r.width,height:r.height}})()`); }
  async fullShot(name, w) { const h = await this.eval('Math.ceil(document.documentElement.scrollHeight)'); await this.view(w, h, false); await sleep(400); await this.shot(name); }
}

async function coinShots(A) {
  await A.goto(BASE + '/coins', 1500); await A.view(1100, 800, false); await sleep(300);
  const c0 = await A.rect('.page:nth-child(1)'), c10 = await A.rect('.page:nth-child(10)');
  await A.shot('coins', { x: c0.x - 6, y: c0.y - 6, width: 1100 - (c0.x - 6) * 2, height: c10.y + c10.height - c0.y + 12 });
  const b0 = await A.rect('.page.bomb:nth-last-child(4)'), b3 = await A.rect('.page.bomb:last-child');
  await A.shot('bombs', { x: b0.x - 6, y: b0.y - 6, width: b3.x + b3.width - b0.x + 12, height: b0.height + 12 });
}

(async () => {
  const profile = fs.mkdtempSync(os.tmpdir() + '/lbchrome-');
  const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=9333', '--user-data-dir=' + profile, '--no-first-run', '--hide-scrollbars', '--disable-gpu', '--lang=' + LANG, 'about:blank'], { stdio: 'ignore' });
  let list; for (let i = 0; i < 40; i++) { try { list = await (await fetch('http://127.0.0.1:9333/json/list')).json(); break; } catch { await sleep(250); } }
  const newPage = async () => { const t = await (await fetch('http://127.0.0.1:9333/json/new?about:blank', { method: 'PUT' })).json(); const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise((r) => ws.on('open', r)); const p = new Page(ws); await p.send('Page.enable'); await p.send('Runtime.enable'); await p.goto(BASE + '/api/whoami', 300); await p.eval(`localStorage.setItem('lb_lang','${LANG}')`); return p; };

  if (process.env.ONLY_COINS) { const A = await newPage(); await coinShots(A); chrome.kill(); process.exit(0); }
  // ---- game setup: 3 games, bots in all of them, rounds running in 1 and 2
  const adm = {};
  for (const g of [1, 2, 3]) { adm[g] = io(`${NS}/g${g}`); await new Promise((r) => adm[g].on('connect', r)); await emit(adm[g], 'admin:hello', {}); adm[g].emit('admin:reset', {}); await sleep(300); }
  for (const g of [1, 2, 3]) { adm[g].emit('admin:addBots', { team: 'A', count: g === 3 ? 4 : 8 }); adm[g].emit('admin:addBots', { team: 'B', count: g === 3 ? 4 : 8 }); adm[g].emit('admin:botsPlay', true); }
  adm[1].emit('admin:start', { minutes: 3 }); adm[2].emit('admin:start', { minutes: 2 });
  await sleep(11000);

  // ---- admin pages
  const A = await newPage(); await A.view(1280, 800, false);
  await A.goto(BASE + '/admin', 2500);
  await A.eval(`document.querySelector('#g1 details.nums summary').click(); 0`); await sleep(500);
  await A.fullShot('master', 1280);
  await A.view(1280, 800, false);
  await A.eval(`document.querySelector('[data-act=share][data-id="1"]').click(); 0`); await sleep(1500);
  const sr = await A.rect('#shareModal .box'); if (sr) await A.shot('share', { x: sr.x - 10, y: sr.y - 10, width: sr.width + 20, height: sr.height + 20 });
  await A.goto(BASE + '/g/1/admin', 2500);
  await A.fullShot('board', 1280);
  await A.view(1280, 900, false);
  await A.eval(`document.getElementById('numsBtn').click(); 0`); await sleep(1200);
  await A.shot('nums');
  await coinShots(A);

  // ---- scripted round in game 1 for the phone shots (bots stop shooting so the story is predictable)
  adm[1].emit('admin:botsPlay', false); adm[1].emit('admin:end'); await sleep(500);
  const st = await emit(adm[1], 'admin:hello', {});
  const free = (tm) => st.numbers[tm].filter((p) => !st.taken.includes(p));
  const botsB = st.taken.filter((p) => st.numbers.B.includes(p));
  const saraPin = free('A')[0], bobPin = free('B')[0];
  const P = await newPage(); await P.view(390, 844, true);
  await P.goto(BASE + '/g/1/join', 1500);
  await P.eval(`[...${JSON.stringify(saraPin.slice(0, 2))}].forEach(press); document.getElementById('name').value='${LANG === 'ar' ? 'سارة' : 'Sara'}'; 0`); await sleep(300);
  await P.shot('p-join');
  await P.eval(`bufs.join=''; ${JSON.stringify(saraPin)}.split('').forEach(press); document.getElementById('name').value='${LANG === 'ar' ? 'سارة' : 'Sara'}'; document.getElementById('joinBtn').click(); 0`); await sleep(1500);
  adm[1].emit('admin:start', { minutes: 5 }); await sleep(4500);
  const type = async (n) => { await P.eval(`${JSON.stringify(n)}.split('').forEach(press); 0`); await sleep(600); };
  await type(coins[0]); await type(coins[1]); await type(botsB[0]); await type(coins[7]);
  await sleep(500); await P.shot('p-run');

  const bob = io(`${NS}/g1`); await new Promise((r) => bob.on('connect', r)); await emit(bob, 'join', { pin: bobPin, name: 'Bob' });
  for (const c of [coins[0], coins[1], coins[2], coins[3]]) await emit(bob, 'guess', { number: c });
  const S = await newPage(); await S.view(1280, 720, false); await S.goto(BASE + '/g/1/screen', 1500);
  await emit(bob, 'guess', { number: bombs[3] }); await sleep(1200);
  await P.shot('p-bomb'); await S.shot('screen');
  await emit(bob, 'guess', { number: saraPin }); await sleep(900);
  await P.shot('p-lock');
  adm[1].emit('admin:points', { team: 'A', delta: 12 }); await sleep(10500);
  adm[1].emit('admin:end'); await sleep(1200);
  await P.shot('p-result');

  // ---- clean up
  adm[1].emit('admin:removeBots'); for (const g of [1, 2, 3]) adm[g].emit('admin:end');
  await sleep(300); chrome.kill(); process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
