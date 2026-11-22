// Who may use the admin pages and admin commands?
//  - the laptop that runs the server (connections from itself), or
//  - anyone holding the secret admin key: the admin shares a link like  /admin?key=...
// The key is new on every server start and can be reset from the board. Players never get it.
const crypto = require('crypto');
const os = require('os');

let token = crypto.randomBytes(12).toString('hex');

const norm = (a) => String(a || '').replace(/^::ffff:/, '').replace(/%.*$/, '');
function ownAddresses() {
  const s = new Set(['127.0.0.1', '::1']);
  for (const list of Object.values(os.networkInterfaces())) for (const i of list || []) s.add(norm(i.address));
  return s;
}
// a connection is "the laptop" when it comes from loopback or from one of the laptop's own addresses
const isLocalAddr = (addr) => ownAddresses().has(norm(addr));

const cookieKey = (header) => { const m = /(?:^|;\s*)lbk=([^;]+)/.exec(header || ''); return m ? decodeURIComponent(m[1]) : ''; };
function validKey(k) {
  if (!k) return false;
  const a = Buffer.from(String(k)), b = Buffer.from(token);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

const isLocalReq = (req) => isLocalAddr(req.socket.remoteAddress);
const isAdminReq = (req) => isLocalReq(req) || validKey(cookieKey(req.headers.cookie));
const isAdminSocket = (socket) => isLocalAddr(socket.handshake.address) || validKey(cookieKey(socket.handshake.headers.cookie));

const FORBIDDEN = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Lock Back</title>
<body style="font-family:system-ui;background:#0b0f17;color:#eef2f8;text-align:center;padding:12vh 24px">
<h1>🔒 Admin only</h1>
<p>Open this page on the laptop that runs the game,<br>or ask the admin for the admin link.</p>
<h2 dir="rtl">للمشرف فقط</h2>
<p dir="rtl">افتح هذه الصفحة على الحاسوب الذي يشغّل اللعبة،<br>أو اطلب رابط المشرف من المسؤول.</p></body>`;

// page guard: lets the laptop or a valid key through; a valid ?key= becomes a cookie and is removed from the address bar
function requirePage(req, res, next) {
  if (req.query.key !== undefined && validKey(String(req.query.key))) {
    res.setHeader('Set-Cookie', `lbk=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=43200`);
    const u = new URL(req.originalUrl, 'http://x'); u.searchParams.delete('key');
    return res.redirect(u.pathname + u.search);
  }
  if (isAdminReq(req)) return next();
  res.status(403).type('html').send(FORBIDDEN);
}
// API guard for things only the laptop itself may do (showing / resetting the key)
function requireLocal(req, res, next) {
  if (isLocalReq(req) && (req.method === 'GET' || req.get('x-lb') === '1')) return next();
  res.status(403).json({ error: 'forbidden' });
}

module.exports = {
  getKey: () => token,
  rotate: () => (token = crypto.randomBytes(12).toString('hex')),
  isLocalAddr, isLocalReq, isAdminReq, isAdminSocket, requirePage, requireLocal,
};
