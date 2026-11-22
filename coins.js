// The printed coins. Each coin has its own 4-digit number that a player types in the game. The list is saved to data/coins.json so printed sheets stay valid
// across restarts; the same coins are used by every game (each game keeps its own tally).
const path = require('path');
const fs = require('fs');

const FILE = path.join(require('./paths').DATA_DIR, 'coins.json');
// 1 gold + 4 silver + 6 bronze. A coin's tier comes from its position in the saved list.
const TIERS = [
  { tier: 'gold', count: 1, points: 5, cooldownMs: 30000 },
  { tier: 'silver', count: 4, points: 3, cooldownMs: 20000 },
  { tier: 'bronze', count: 6, points: 1, cooldownMs: 10000 },
];
const COUNT = TIERS.reduce((n, t) => n + t.count, 0);
// A coin's code is 4 digits, typed like a player's number. Player numbers always have 4 different digits (see isHard
// in room.js), so a coin code has exactly 3 different digits (one digit twice): it can never be the same as a player's
// number. To keep it hard to remember the repeated digit is never next to itself (no 2244 / 3381) and there is no run of
// three digits going up or down by one (no 4561 / 8765).
function isCoinCode(c) {
  if (!/^\d{4}$/.test(c) || new Set(c).size !== 3) return false;
  const d = [...c].map(Number);
  for (let i = 0; i < 3; i++) if (d[i] === d[i + 1]) return false;
  for (let i = 0; i < 2; i++) if (Math.abs(d[i + 1] - d[i]) === 1 && d[i + 2] - d[i + 1] === d[i + 1] - d[i]) return false;
  return true;
}

function generate() {
  for (;;) {
    const c = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    if (isCoinCode(c)) return c;
  }
}

function load() {
  let codes = [];
  try {
    const c = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    if (Array.isArray(c) && c.every(isCoinCode)) codes = c;
  } catch {}
  if (codes.length < COUNT) {
    while (codes.length < COUNT) {
      const c = generate();
      if (!codes.includes(c)) codes.push(c);
    }
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify(codes, null, 2));
  }
  return codes.slice(0, COUNT); // an older, longer list just loses its last codes
}

const codes = load();
const byCode = new Map();
let i = 0;
for (const t of TIERS) for (let k = 0; k < t.count; k++) byCode.set(codes[i++], t);

// tier info of a code: { tier, points, cooldownMs }, or undefined if it is not a coin
module.exports = { isCoinCode, codes, info: (c) => byCode.get(c), tierOf: (n) => byCode.get(codes[n]), total: codes.length };
