// Renders guide-en.html / guide-ar.html into guide/lock-back-{player,admin}-{lang}.png and guide/lock-back-guide-{lang}.pdf
const R = require('path').join(__dirname, '..', '..') + '/';
const WebSocket = require(R + 'node_modules/ws');
const { spawn } = require('child_process');
const fs = require('fs'), os = require('os');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=9334', '--user-data-dir=' + fs.mkdtempSync(os.tmpdir() + '/lbr-'), '--no-first-run', '--hide-scrollbars', '--disable-gpu', 'about:blank'], { stdio: 'ignore' });
  for (let i = 0; i < 40; i++) { try { await fetch('http://127.0.0.1:9334/json/version'); break; } catch { await sleep(250); } }
  const t = await (await fetch('http://127.0.0.1:9334/json/new?about:blank', { method: 'PUT' })).json();
  const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise((r) => ws.on('open', r));
  let id = 0; const cb = {}; ws.on('message', (m) => { m = JSON.parse(m); if (m.id && cb[m.id]) { cb[m.id](m); delete cb[m.id]; } });
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; cb[i] = (m) => r(m.result || m); ws.send(JSON.stringify({ id: i, method, params })); });
  const ev = async (e) => (await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true })).result.value;
  await send('Page.enable');
  for (const lang of ['en', 'ar']) {
    await send('Emulation.setDeviceMetricsOverride', { width: 1000, height: 1200, deviceScaleFactor: 2, mobile: false });
    await send('Page.navigate', { url: 'file://' + __dirname + `/guide-${lang}.html` }); await sleep(2500);
    await ev('document.fonts.ready.then(()=>1)');
    const sizes = {};
    for (const s of ['player', 'admin']) {
      const r = await ev(`(()=>{const e=document.getElementById('${s}').getBoundingClientRect();return {x:e.left+scrollX,y:e.top+scrollY,w:e.width,h:e.height}})()`);
      sizes[s] = r;
      const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: r.x, y: r.y, width: r.w, height: r.h, scale: 1 } });
      fs.writeFileSync(R + `guide/lock-back-${s}-${lang}.png`, Buffer.from(shot.data, 'base64'));
    }
    // one PDF page per sheet, each exactly as tall as its sheet
    await ev(`(()=>{const st=document.createElement('style');st.textContent='@page player{size:1000px ${Math.ceil(sizes.player.h)}px;margin:0}@page admin{size:1000px ${Math.ceil(sizes.admin.h)}px;margin:0}#player{page:player;break-after:page}#admin{page:admin}body{-webkit-print-color-adjust:exact;print-color-adjust:exact}';document.head.appendChild(st)})()`);
    const pdf = await send('Page.printToPDF', { printBackground: true, preferCSSPageSize: true });
    fs.writeFileSync(R + `guide/lock-back-guide-${lang}.pdf`, Buffer.from(pdf.data, 'base64'));
    console.log(lang, JSON.stringify(sizes));
  }
  chrome.kill(); process.exit(0);
})();
