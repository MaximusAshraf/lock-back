// Network addresses + QR codes for sharing the player link. Used by the game server and the launcher.
const os = require('os');
const QRCode = require('qrcode');

function lanAddresses() {
  const out = [];
  for (const list of Object.values(os.networkInterfaces())) {
    for (const i of list || []) if (i.family === 'IPv4' && !i.internal) out.push(i.address);
  }
  return out;
}

// game: 1..N for a specific game's player link, or null for the pick-a-game page
async function getShareInfo(port, game = null) {
  const qr = (url) => QRCode.toString(url, { type: 'svg', margin: 1, width: 320 });
  const items = await Promise.all(lanAddresses().map(async (ip) => {
    const join = `http://${ip}:${port}${game ? `/g/${game}/join` : '/join'}`;
    return { ip, label: ip, join, svg: await qr(join) };
  }));
  return items;
}

// links the admin can hand to another device: they carry the secret admin key
async function getAdminLinks(port, key) {
  return Promise.all(lanAddresses().map(async (ip) => {
    const url = `http://${ip}:${port}/admin?key=${key}`;
    return { ip, url, svg: await QRCode.toString(url, { type: 'svg', margin: 1, width: 320 }) };
  }));
}

module.exports = { lanAddresses, getShareInfo, getAdminLinks };
