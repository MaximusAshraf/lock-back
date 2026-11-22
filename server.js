const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const selfsigned = require('selfsigned');
const express = require('express');
const { Server } = require('socket.io');
const qrcode = require('qrcode-terminal');
const { lanAddresses, getShareInfo, getAdminLinks } = require('./share');
const coinList = require('./coins');
const bombList = require('./bombs');
const auth = require('./auth');
const { createRoom } = require('./room');

const PORT = Number(process.env.PORT) || 3000;            // http: what phones use (the camera is gone, so no certificate is needed)
const HTTP_PORT = Number(process.env.HTTP_PORT) || PORT + 80; // plain http: players, admin and the big screen
const GAMES = Math.max(1, Math.min(9, parseInt(process.env.GAMES, 10) || 3)); // how many games run side by side

const app = express();
const server = http.createServer(app);
const io = new Server(server, { pingInterval: 10000, pingTimeout: 25000 });

// each game lives on its own socket namespace (/g1, /g2, ...) so nothing is shared between them
const rooms = [];
for (let id = 1; id <= GAMES; id++) rooms.push(createRoom(id, io.of(`/g${id}`)));

const page = (name) => (req, res) => res.sendFile(path.join(__dirname, 'public', name));
const validGame = (req, res, next) => {
  const id = Number(req.params.id);
  return Number.isInteger(id) && id >= 1 && id <= GAMES ? next() : res.status(404).send('No such game');
};

// pictures are cached by the browsers for a day, so phones do not download them from the laptop again on every visit
// (pages and scripts stay un-cached: the browser just asks if they changed)
const IMAGE = /\.(png|jpe?g|webp|gif|svg|ico)$/i;
app.use(express.static(path.join(__dirname, 'public'), { index: false, setHeaders: (res, file) => { if (IMAGE.test(file)) res.setHeader('Cache-Control', 'public, max-age=86400'); } }));
app.get('/api/whoami', (req, res) => res.json({ admin: auth.isAdminReq(req), local: auth.isLocalReq(req) }));
app.get('/api/admin-link', auth.requireLocal, async (req, res) => res.json(await getAdminLinks(HTTP_PORT, auth.getKey())));
app.post('/api/admin-link/rotate', auth.requireLocal, async (req, res) => {
  auth.rotate();
  await Promise.all(rooms.map((r) => r.dropAdmins()));
  res.json({ ok: true });
});
app.get('/api/coins', auth.requirePage, (req, res) => {
  const coins = coinList.codes.map((code, i) => ({ n: i + 1, code, tier: coinList.tierOf(i).tier, points: coinList.tierOf(i).points, seconds: coinList.tierOf(i).cooldownMs / 1000 }));
  const bombs = bombList.codes.map((code, i) => ({ code, bomb: i }));
  res.json([...coins, ...bombs]);
});
app.get('/coins', auth.requirePage, page('coins.html'));      // printable coin sheets (one coin per A4 page)
app.get('/api/games', (req, res) => res.json(rooms.map((r) => r.summary())));
app.get('/api/share', async (req, res) => {
  const game = Number(req.query.game);
  res.json(await getShareInfo(HTTP_PORT, game >= 1 && game <= GAMES ? game : null));
});
app.get(['/', '/join'], page('hub.html'));                    // pick a game
app.get('/admin', auth.requirePage, page('master.html'));                       // control all games from one board
app.get('/screen', page('scoreboard.html'));                 // fun scoreboard of all games for a projector (scores only)
app.get('/g/:id/join', validGame, page('join.html'));        // players of game N
app.get('/g/:id/screen', validGame, page('screen.html'));    // big-screen view of game N (scores, view only)
app.get('/g/:id/admin', validGame, auth.requirePage, page('admin.html'));      // admin board of game N
app.get('/g/:id/sim', validGame, auth.requirePage, page('simulator.html'));     // simulator: phone frames of both teams playing by themselves, to check changes
app.get('/g/:id/test', validGame, auth.requirePage, page('testboard.html'));   // test board: all player / coin / bomb numbers of game N on one screen      // admin board of game N

// self-signed certificate (phones ask once "continue anyway"); regenerated when the laptop's IP changes
async function loadCert() {
  const file = path.join(require('./paths').DATA_DIR, 'cert.json');
  const ips = lanAddresses();
  try {
    const c = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (ips.every((ip) => c.ips.includes(ip)) && Date.now() < c.expires) return c;
  } catch { /* first run */ }
  const altNames = [{ type: 2, value: 'localhost' }, { type: 7, ip: '127.0.0.1' }, ...ips.map((ip) => ({ type: 7, ip }))];
  const pems = await selfsigned.generate([{ name: 'commonName', value: 'lock-back' }], {
    days: 365, keySize: 2048, extensions: [{ name: 'subjectAltName', altNames }],
  });
  const c = { ips, key: pems.private, cert: pems.cert, expires: Date.now() + 360 * 864e5 };
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(c));
  return c;
}

const printInfo = (proto, port) => {
  const ips = lanAddresses();
  console.log(`Lock Back running ${GAMES} games:`);
  console.log(`  control all games: http://localhost:${HTTP_PORT}/admin   (admin pages open only on this laptop)`);
  console.log(`  pick a game:       http://localhost:${HTTP_PORT}/`);
  console.log(`  big screen:        http://localhost:${HTTP_PORT}/screen   (scores of all games)`);
  console.log(`  print coins:        http://localhost:${HTTP_PORT}/coins   (${coinList.total} coins + ${bombList.total} bombs)`);
  for (let id = 1; id <= GAMES; id++) {
    console.log(`  game ${id}:   admin http://localhost:${HTTP_PORT}/g/${id}/admin   players ${proto}://localhost:${port}/g/${id}/join`);
  }
  if (!ips.length) return console.log('  (no network connection found - players on other devices cannot join)');
  console.log(`  admin link for ANOTHER device (secret, new on every start): ${proto}://${ips[0]}:${port}/admin?key=${auth.getKey()}`);
  console.log('');
  for (let id = 1; id <= GAMES; id++) console.log(`  share game ${id}: ${proto}://${ips[0]}:${port}/g/${id}/join`);
  console.log(`\nScan to pick a game (${ips[0]}):`);
  qrcode.generate(`${proto}://${ips[0]}:${port}/join`, { small: true });
};

if (!process.env.HTTPS) {   // default: plain http, so phones open the game with no security warning
  server.listen(HTTP_PORT, () => printInfo('http', HTTP_PORT));
  const second = http.createServer(app);   // the old players' port keeps working too
  io.attach(second);
  second.listen(PORT);
} else {   // HTTPS=1: also serve https with a self-signed certificate (phones must accept the warning)
  loadCert().then((cert) => {
    const httpsServer = https.createServer({ key: cert.key, cert: cert.cert }, app);
    io.attach(httpsServer);
    server.listen(HTTP_PORT);
    httpsServer.listen(PORT, () => printInfo('https', PORT));
  }).catch((e) => {
    console.log(`(https is off: ${e.message}) - falling back to http`);
    server.listen(PORT, () => printInfo('http', PORT));
  });
}
