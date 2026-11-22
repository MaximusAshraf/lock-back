// The printed bombs: 4 different bombs hidden around, each with its own 4-digit code (printed under its picture).
// A team arms a bomb by typing its code (the cost is paid from the team's coins) and the other team defuses it by typing
// the same code. Like a coin's code (see coins.js), a bomb code can never equal a player's number, and it never equals a coin's code. The list is saved to data/bombs.json.
const path = require('path');
const fs = require('fs');
const coinList = require('./coins');

const FILE = path.join(require('./paths').DATA_DIR, 'bombs.json');
const COUNT = 4;
const SHAPES = ['classic', 'dynamite', 'grenade', 'mine']; // picture files in public/bombs/

const isBombCode = (c) => coinList.isCoinCode(c) && !coinList.codes.includes(c); // same hard-to-remember rule as a coin's code

function generate() {
  for (;;) {
    const c = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    if (isBombCode(c)) return c;
  }
}

function load() {
  let codes = [];
  try {
    const c = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    if (Array.isArray(c) && c.length >= COUNT && c.every(isBombCode) && new Set(c).size === c.length) codes = c.slice(0, COUNT);
  } catch {}
  if (codes.length < COUNT) {
    codes = [];
    while (codes.length < COUNT) {
      const c = generate();
      if (!codes.includes(c)) codes.push(c);
    }
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify(codes, null, 2));
  }
  return codes;
}

const codes = load();
module.exports = { codes, shapes: SHAPES, indexOf: (c) => codes.indexOf(c), total: COUNT };
