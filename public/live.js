// Keeps a page in step with the server after it was in the background, went offline or was frozen.
// `resync(res)` receives the server's fresh state whenever a check succeeds.
function keepAlive(socket, resync) {
  let busy = false;
  function check() {
    if (document.hidden || busy) return;
    if (!socket.connected) { socket.connect(); return; }
    busy = true;
    // If the connection is silently dead (common after the OS froze the tab) the ack never comes: reconnect.
    socket.timeout(3000).emit('sync', null, (err, res) => {
      busy = false;
      if (err) { socket.disconnect(); socket.connect(); return; }
      resync(res);
    });
  }
  document.addEventListener('visibilitychange', check);
  window.addEventListener('pageshow', check);
  window.addEventListener('focus', check);
  window.addEventListener('online', check);
  setInterval(check, 8000);
  return check;
}

// Reset popup shared by the admin pages: asks whether to also block players, then calls done(block) (not called on Cancel).
function askReset(done) {
  const box = document.createElement('div');
  box.style.cssText = 'position:fixed;inset:0;background:rgba(5,8,14,.8);display:flex;align-items:center;justify-content:center;z-index:99;padding:16px';
  const btn = (txt, bg, fg) => `<button style="padding:12px 16px;border:0;border-radius:10px;font-weight:700;font-size:1rem;cursor:pointer;background:${bg};color:${fg}">${txt}</button>`;
  box.innerHTML = `<div style="background:#1b2230;color:#eef2f8;border-radius:16px;padding:22px;max-width:420px;width:100%;font-family:system-ui,sans-serif">
    <h2 style="margin:0 0 8px">${t('resetAskTitle')}</h2>
    <p style="margin:0 0 6px;color:#8b97ab">${t('confirmReset')}</p>
    <p style="margin:0 0 16px;font-weight:700">${t('resetAskBody')}</p>
    <div style="display:grid;gap:8px">${btn(t('resetAndBlock'), '#ef4444', '#fff')}${btn(t('resetOnly'), '#34405a', '#eef2f8')}${btn(t('cancel'), 'transparent', '#8b97ab')}</div></div>`;
  const b = box.querySelectorAll('button');
  const close = () => box.remove();
  b[0].onclick = () => { close(); done(true); };
  b[1].onclick = () => { close(); done(false); };
  b[2].onclick = close;
  box.onclick = (e) => { if (e.target === box) close(); };
  document.body.appendChild(box);
}

// Share dialog: with several network addresses, show ONE QR and let the admin choose which address.
// The choice is remembered; by default a home-router style 192.168.x.x address is preferred.
function shareIndex(data) {
  let pref = ''; try { pref = localStorage.getItem('lb_shareIp') || ''; } catch {}
  let i = data.findIndex((s) => s.ip === pref);
  if (i < 0) i = data.findIndex((s) => s.ip.startsWith('192.168.'));
  return i < 0 ? 0 : i;
}
function shareChoose(ip) { try { localStorage.setItem('lb_shareIp', ip); } catch {} }
function shareTabs(data, idx, fn) {
  if (data.length < 2) return '';
  return `<div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-bottom:12px;direction:ltr">${data.map((s, i) =>
    `<button onclick="${fn}(${i})" style="padding:6px 12px;border:0;border-radius:99px;font-weight:700;cursor:pointer;font-family:ui-monospace,monospace;background:${i === idx ? '#22c55e' : '#34405a'};color:${i === idx ? '#04210f' : '#eef2f8'}">${s.ip}</button>`).join('')}</div>`;
}
