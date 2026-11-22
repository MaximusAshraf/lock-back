// Tiny always-on supervisor: starts the game server and lets a button (re)start it if it dies.
const http = require('http');
const path = require('path');
const { spawn } = require('child_process');
const { getShareInfo } = require('./share');

const GAMES = Math.max(1, Math.min(9, parseInt(process.env.GAMES, 10) || 3));
const LAUNCHER_PORT = process.env.LAUNCHER_PORT || 3001;
let child = null;

const running = () => child !== null;

function startGame() {
  if (running()) return false;
  // (in the standalone build pkg makes process.execPath run server.js from inside the bundle, like node would)
  child = spawn(process.execPath, [path.join(__dirname, 'server.js')], { stdio: 'inherit', env: process.env });
  const proc = child;
  proc.on('exit', (code) => {
    if (child === proc) child = null;
    console.log(`[launcher] game server exited (${code})`);
  });
  return true;
}

const page = `<!doctype html><html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Lock Back launcher</title>
<body style="font-family:system-ui;background:#10141c;color:#eef2f8;text-align:center;padding:40px">
<h1>🔒 Lock Back launcher / مشغّل لوك باك</h1><p id="s">…</p>
<button id="b" style="padding:12px 24px;font-size:1.1rem;border:0;border-radius:8px;background:#22c55e;font-weight:700;cursor:pointer">Start server / تشغيل السيرفر</button>
<p><a style="color:#8ab4ff" href="/go-admin">Open admin / فتح لوحة المشرف</a></p>
<hr style="border:0;border-top:1px solid #27324a;margin:24px auto;max-width:520px">
<h2>Invite players / دعوة اللاعبين</h2>
<div id="share" style="display:flex;flex-wrap:wrap;gap:16px;justify-content:center"></div>
<script>
const s=document.getElementById('s');
async function refresh(){const r=await (await fetch('/status')).json();s.textContent=r.running?'Game server is running / السيرفر يعمل':'Game server is stopped / السيرفر متوقف';}
document.getElementById('b').onclick=async()=>{await fetch('/start',{method:'POST'});setTimeout(refresh,800);};
refresh();setInterval(refresh,2000);
(async()=>{
  const games=await (await fetch('/api/share')).json(); const box=document.getElementById('share');
  if(!games.length||!games[0].items.length){box.textContent='No network connection / لا يوجد اتصال بالشبكة';return;}
  games.forEach(g=>g.items.slice(0,1).forEach(i=>{const d=document.createElement('div');d.style.cssText='background:#161d2b;border-radius:12px;padding:14px;width:260px';
    d.innerHTML='<h3 style="margin:0 0 8px">Game / لعبة '+g.game+'</h3><div style="background:#fff;border-radius:8px;padding:6px">'+i.svg+'</div><p dir="ltr" style="font-family:monospace;word-break:break-all">'+i.join+'</p>';
    const b=document.createElement('button');b.textContent='Copy / نسخ';b.style.cssText='padding:8px 16px;border:0;border-radius:8px;font-weight:700;cursor:pointer';
    b.onclick=async()=>{try{await navigator.clipboard.writeText(i.join);b.textContent='✓'}catch{b.textContent=i.join}};d.appendChild(b);box.appendChild(d);}));
})();
</script>`;

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  if (req.url === '/status') {
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ running: running() }));
  }
  if (req.url === '/api/share') {
    res.setHeader('Content-Type', 'application/json');
    return Promise.all(Array.from({ length: GAMES }, async (_, k) => ({ game: k + 1, items: await getShareInfo(process.env.HTTP_PORT || (Number(process.env.PORT) || 3000) + 80, k + 1) })))
      .then((g) => res.end(JSON.stringify(g)));
  }
  if (req.url === '/start' && req.method === 'POST') {
    const started = startGame();
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ started, running: true }));
  }
  if (req.url === '/go-admin') {
    const host = (req.headers.host || 'localhost').split(':')[0];
    res.writeHead(302, { Location: `http://${host}:${process.env.HTTP_PORT || (Number(process.env.PORT) || 3000) + 80}/` });
    return res.end();
  }
  res.setHeader('Content-Type', 'text/html');
  res.end(page);
}).listen(LAUNCHER_PORT, () => {
  console.log(`[launcher] http://localhost:${LAUNCHER_PORT}`);
  startGame();
  if (process.pkg) { // double-clicked program: open the admin board by itself
    const url = `http://localhost:${process.env.HTTP_PORT || (Number(process.env.PORT) || 3000) + 80}/admin`;
    const cmd = process.platform === 'win32' ? ['cmd', ['/c', 'start', '', url]] : [process.platform === 'darwin' ? 'open' : 'xdg-open', [url]];
    setTimeout(() => spawn(cmd[0], cmd[1], { stdio: 'ignore', detached: true }).unref(), 3000);
  }
});

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => { if (running()) child.kill(); process.exit(0); });
}
