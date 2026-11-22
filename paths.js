// Where the game keeps its saved files (numbers, coins, certificate).
// Normally that is ./data. In the standalone build the program sits inside a read-only bundle, so data lives in a
// "data" folder next to the program; on first run it is filled from the numbers and coins baked into the bundle,
// so every copy of the program starts with the same player numbers and the same printed coins.
const path = require('path');
const fs = require('fs');

const BUNDLED = path.join(__dirname, 'data');
const DATA_DIR = process.pkg ? path.join(path.dirname(process.execPath), 'data') : BUNDLED;

if (process.pkg) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  for (const f of fs.readdirSync(BUNDLED)) {
    if (f === 'cert.json') continue; // the certificate is made per computer (it holds that computer's IP)
    const dest = path.join(DATA_DIR, f);
    if (!fs.existsSync(dest)) fs.writeFileSync(dest, fs.readFileSync(path.join(BUNDLED, f)));
  }
}

module.exports = { DATA_DIR };
