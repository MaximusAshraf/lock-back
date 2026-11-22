// One independent game: its own players, numbers, scores, timers and bots, served on its own socket namespace.
const path = require('path');
const fs = require('fs');
const auth = require('./auth');
const coinList = require('./coins');
const bombList = require('./bombs');

const DEFAULT_RETURNS = 5;      // how many times a player can come back after being locked, per round (admin can change it)
const DEFAULT_RESPAWN_MS = 7000;  // how long a locked player is out before coming back (admin can change it)
const COUNTDOWN_MS = 3000;
const TEAMS = ['A', 'B'];

// ---------- bombs: a team pays coins to arm one, the other team must defuse it before it goes off ----------
const BOMB_MS = 25000;            // time from arming to the explosion
const BOMB_COOLDOWN_MS = 10000;   // a bomb that exploded or was defused cannot be armed again for a while
const BOMB_DEFUSE_POINTS = 3;     // points the defending team gets for defusing
// everything scales with the size of the team (players that are in the game)
const bombCostFor = (n) => Math.max(5, Math.round(n * 1.2));            // coins the arming team pays (60 for 50 players)
const defuseNeedFor = () => 1; // a single player of the target team is enough to defuse a bomb
const victimsFor = (n) => Math.min(n, Math.max(1, Math.round(n * 0.1))); // players locked by an explosion (5 for 50)

// ---------- fixed number list (100 pins, 50 per team), persisted per game ----------
// ---------- fixed number list (100 pins, 50 per team), persisted ----------
// Hard to remember: 4 different digits, and not a straight run like 1234 / 4321.
function isHard(p) {
  if (!/^\d{4}$/.test(p) || new Set(p).size !== 4) return false;
  const d = [...p].map(Number);
  const step = d[1] - d[0];
  return !(Math.abs(step) === 1 && d[2] - d[1] === step && d[3] - d[2] === step);
}

function generateNumbers() {
  const set = new Set();
  while (set.size < 100) {
    const p = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    if (isHard(p)) set.add(p);
  }
  const all = [...set];
  return { A: all.slice(0, 50).sort(), B: all.slice(50).sort() };
}

function loadNumbers(file) {
  try {
    const n = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (n.A?.length === 50 && n.B?.length === 50 && [...n.A, ...n.B].every(isHard)) return n;
  } catch {}
  return saveNumbers(generateNumbers(), file);
}

function saveNumbers(n, file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(n, null, 2));
  return n;
}

function createRoom(id, nsp) {
  const FILE = path.join(require('./paths').DATA_DIR, `numbers-${id}.json`);

const numbers = loadNumbers(FILE);
const teamOfPin = {};
function indexNumbers() {
  for (const k of Object.keys(teamOfPin)) delete teamOfPin[k];
  TEAMS.forEach((t) => numbers[t].forEach((p) => (teamOfPin[p] = t)));
}
indexNumbers();

// ---------- game state ----------
const game = {
  phase: 'lobby', // 'lobby' | 'countdown' | 'running'
  startsAt: 0,
  duration: 0,
  bombsEnabled: true, // admin switch: the bombs mode (when off, bomb numbers do nothing and bombs are hidden from players)
  unlimitedReturns: true, // admin setting (on by default): no limit, a locked player always comes back after the return time
  maxReturns: DEFAULT_RETURNS, // admin setting: returns allowed per player per round (0 = the first lock ends the round for that player)
  bombMs: BOMB_MS, // admin setting: time from arming a bomb to its explosion (bombs armed later use the new value)
  respawnMs: DEFAULT_RESPAWN_MS, // admin setting: how long a lock lasts
  botsPlay: true, // testing: bots take shots during rounds
  botsBalance: false, // testing (simulator): the bots of the team that is ahead hold back, so both teams get locked about equally
  showNumbers: false, // big screen shows each player's number (it is the secret others guess), so it is off unless the admin turns it on
  blocked: false, // when true, players are kicked and nobody new can join this game
  allowRepeat: false, // testing switch: lets a player enter the same number twice in a row
  countdownTimer: null,
  round: 0,
  endsAt: 0,
  roundTimer: null,
  scores: { A: 0, B: 0 }, // points in the current round only
  wins: { A: 0, B: 0 }, // rounds won by each team
  coins: { A: 0, B: 0 }, // printed coins collected by each team, no limit (kept across rounds, cleared on reset)
  coinLast: new Map(), // player pin -> (coin code -> when that player last collected it)
  bombs: bombList.codes.map(() => ({ active: false, by: null, target: null, endsAt: 0, need: 0, victims: 0, defusers: new Set(), cooldownUntil: 0, timer: null })),
  feed: [], // recent lock / free events for the admin board
  lastResult: null, // { round, scores, winner } of the most recently finished round
  players: new Map(), // pin -> player
};

// A locked player is "dead": he comes back after the respawn time, but only maxReturns times per round.
// With no returns left he is out (p.out) until the round ends.
const isLocked = (p) => !!p.out || p.lockedUntil > Date.now();
// what the pages show as "locked until": an out player stays locked until the round ends
const lockedUntilOf = (p) => (p.out ? game.endsAt || Date.now() + 60000 : p.lockedUntil);
const returnsLeft = (p) => (game.unlimitedReturns ? null : Math.max(0, game.maxReturns - (p.returns || 0))); // null = unlimited

function lockPlayer(p, cause = 'player') { // cause: who killed the player, shown to them ('player' = an enemy typed their number, 'bomb')
  clearTimeout(p.lockTimer);
  p.lockCause = cause;
  if (!game.unlimitedReturns) {
    if (returnsLeft(p) <= 0) { p.out = true; p.lockedUntil = 0; return; }
    p.returns = (p.returns || 0) + 1; // losing a life: this lock uses up one return
  }
  p.lockedUntil = Date.now() + game.respawnMs;
  p.lockTimer = setTimeout(() => {
    p.lockedUntil = 0;
    broadcast();
  }, game.respawnMs);
}

function clearLocks() {
  for (const p of game.players.values()) {
    clearTimeout(p.lockTimer);
    p.lockedUntil = 0;
    p.returns = 0;
    p.out = false;
    p.lastTarget = null;
  }
}

function clearBombs() {
  for (const b of game.bombs) { clearTimeout(b.timer); Object.assign(b, { active: false, by: null, target: null, endsAt: 0, need: 0, victims: 0, defusers: new Set(), cooldownUntil: 0, timer: null }); }
}

function startRound(minutes) {
  clearTimeout(game.roundTimer);
  clearTimeout(game.countdownTimer);
  clearLocks();
  clearBombs();
  if (game.phase !== 'countdown') game.round += 1; // restarting during a countdown reuses the number
  game.phase = 'countdown';
  game.startsAt = Date.now() + COUNTDOWN_MS;
  game.duration = minutes * 60000;
  game.endsAt = 0;
  game.countdownTimer = setTimeout(() => {
    game.phase = 'running';
    game.endsAt = Date.now() + minutes * 60000;
    game.roundTimer = setTimeout(endRound, minutes * 60000);
    for (const p of game.players.values()) if (p.bot) p.nextAt = Date.now() + 1500 + Math.random() * 2500;
    broadcast();
  }, COUNTDOWN_MS);
  broadcast();
}

function endRound() {
  clearTimeout(game.roundTimer);
  clearTimeout(game.countdownTimer);
  if (game.phase === 'countdown') game.round -= 1; // cancelled before it began
  if (game.phase === 'running') {
    // the round counts: the higher score wins it, then scores start over for the next round
    const { A, B } = game.scores;
    const winner = A === B ? null : A > B ? 'A' : 'B';
    if (winner) game.wins[winner] += 1;
    game.lastResult = { round: game.round, scores: { A, B }, winner };
    game.scores = { A: 0, B: 0 };
  }
  clearLocks();
  clearBombs();
  game.phase = 'lobby';
  game.endsAt = 0;
  broadcast();
}

// Block / unblock the game for players. Blocking removes every human player at once.
function setBlocked(on) {
  game.blocked = !!on;
  if (game.blocked) {
    for (const [pin, p] of game.players) {
      if (p.bot) continue;
      clearTimeout(p.lockTimer);
      game.players.delete(pin);
      nsp.to(`pin:${pin}`).emit('kicked', 'kickedBlocked');
    }
  }
  broadcast();
}

function resetGame() {
  clearTimeout(game.roundTimer);
  clearTimeout(game.countdownTimer);
  clearLocks();
  clearBombs();
  game.phase = 'lobby';
  game.round = 0;
  game.endsAt = 0;
  game.scores = { A: 0, B: 0 };
  game.wins = { A: 0, B: 0 };
  game.coins = { A: 0, B: 0 };
  game.coinLast = new Map();
  game.lastResult = null;
  game.feed = [];
  game.allowRepeat = false;
  game.showNumbers = false;
  game.botsPlay = true;
  game.botsBalance = false;
  for (const p of game.players.values()) {
    nsp.to(`pin:${p.pin}`).emit('kicked', 'kickedReset');
  }
  game.players.clear();
  // the player numbers stay the same after a reset (they are printed / handed out in advance)
  broadcast();
}

// ---------- activity feed ----------
const brief = (p) => ({ name: p.name, pin: p.pin, team: p.team, bot: !!p.bot });
function pushEvent(type, by, target) {
  game.feed.unshift({ t: Date.now(), round: game.round, type, by: brief(by), target: brief(target) });
  game.feed.length = Math.min(game.feed.length, 30);
}

// ---------- guess logic ----------
function guess(p, target) {
  if (game.phase !== 'running') return { kind: 'info', code: 'notStarted' };
  if (isLocked(p)) return { kind: 'info', code: 'locked' };
  if (!/^\d{4}$/.test(target)) return { kind: 'info', code: 'enter4' };
  if (target === p.pin) return { kind: 'info', code: 'ownNumber' };
  if (!game.allowRepeat && target === p.lastTarget) return { kind: 'bad', code: 'repeat' };

  const prevTarget = p.lastTarget;
  p.lastTarget = target;
  const victim = game.players.get(target);
  if (!victim) return { kind: 'bad', code: 'noPlayer' };

  const sameTeam = victim.team === p.team;
  const victimLocked = isLocked(victim);

  if (sameTeam) {
    if (victim.out) return { kind: 'info', code: 'mateOut' };
    if (!victimLocked) return { kind: 'info', code: 'mateNotLocked' };
    victim.lockedUntil = 0;
    clearTimeout(victim.lockTimer);
    game.scores[p.team] += 1;
    pushEvent('free', p, victim);
    return { kind: 'good', code: 'freed', p: { name: victim.name, pin: victim.pin }, freed: victim.pin };
  }

  if (victimLocked) { // just tell them: no penalty, and it does not count as a try
    p.lastTarget = prevTarget;
    return { kind: 'info', code: 'enemyAlreadyLocked' };
  }

  lockPlayer(victim);
  game.scores[p.team] += 1;
  game.scores[victim.team] -= 1; // the locked team loses a point
  pushEvent('lock', p, victim);
  return { kind: 'good', code: 'lockedEnemy', p: { name: victim.name, pin: victim.pin }, locked: victim.pin };
}

// ---------- coins (printed, each with its own 4-digit number) ----------
const coinWait = (p, code, coin) => ((game.coinLast.get(p.pin) || new Map()).get(code) || 0) + coin.cooldownMs - Date.now();

function scanCoin(p, raw) {
  if (game.phase !== 'running') return { kind: 'info', code: 'notStarted' };
  if (isLocked(p)) return { kind: 'info', code: 'locked' };
  const code = String(raw || '').trim();
  const coin = coinList.info(code);
  if (!coin) return { kind: 'bad', code: 'coinInvalid' };
  const wait = coinWait(p, code, coin);
  if (wait > 0) return { kind: 'bad', code: 'coinAgain', p: { s: Math.ceil(wait / 1000) } };
  if (!game.coinLast.has(p.pin)) game.coinLast.set(p.pin, new Map());
  game.coinLast.get(p.pin).set(code, Date.now());
  game.coins[p.team] += coin.points; // a gold coin is worth 5 bronze coins, a silver one 3 (in the coin balance used for bombs, too)
  game.scores[p.team] += coin.points;
  return { kind: 'good', code: 'coinGot', p: { tier: coin.tier, pts: coin.points, n: game.coins[p.team] } };
}

// ---------- bombs ----------
const teamSize = (t) => { let n = 0; for (const p of game.players.values()) if (p.team === t && (p.connected || p.bot)) n += 1; return n; };
const otherTeam = (t) => (t === 'A' ? 'B' : 'A');

function explodeBomb(i) {
  const b = game.bombs[i];
  if (!b.active) return;
  const pool = [...game.players.values()].filter((q) => q.team === b.target && (q.connected || q.bot) && !isLocked(q)); // only players still standing
  for (let k = pool.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [pool[k], pool[j]] = [pool[j], pool[k]]; }
  const hit = pool.slice(0, b.victims);
  hit.forEach((q) => lockPlayer(q, 'bomb'));
  const ev = { type: 'boom', i, by: b.by, target: b.target, n: hit.length, of: pool.length };
  Object.assign(b, { active: false, timer: null, cooldownUntil: Date.now() + BOMB_COOLDOWN_MS });
  nsp.emit('bomb', ev);
  broadcast();
}

// A player typed a bomb's code. The team that is not the target arms it (paying coins); the target team defuses it
// (a different player each time, until enough have typed it).
function bombAction(p, i) {
  if (!game.bombsEnabled) return { kind: 'info', code: 'bombsOff' };
  if (game.phase !== 'running') return { kind: 'info', code: 'notStarted' };
  if (isLocked(p)) return { kind: 'info', code: 'locked' };
  const b = game.bombs[i];
  const now = Date.now();
  if (!b.active) {
    if (b.cooldownUntil > now) return { kind: 'bad', code: 'bombCooling', p: { i, s: Math.ceil((b.cooldownUntil - now) / 1000) } };
    const target = otherTeam(p.team);
    const n = teamSize(target);
    if (!n) return { kind: 'info', code: 'bombNoTarget' };
    const cost = bombCostFor(teamSize(p.team));
    if (game.coins[p.team] < cost) return { kind: 'bad', code: 'bombNeedCoins', p: { i, need: cost, have: game.coins[p.team] } };
    game.coins[p.team] -= cost;
    Object.assign(b, { active: true, by: p.team, target, endsAt: now + game.bombMs, need: defuseNeedFor(n), victims: victimsFor(n), defusers: new Set() });
    b.timer = setTimeout(() => explodeBomb(i), game.bombMs);
    nsp.emit('bomb', { type: 'armed', i, by: p.team, target });
    return { kind: 'good', code: 'bombArmed', p: { i, cost } };
  }
  if (p.team === b.by) return { kind: 'info', code: 'bombYours', p: { i } };
  if (b.defusers.has(p.pin)) return { kind: 'info', code: 'bombAlready', p: { i, n: b.defusers.size, need: b.need } };
  b.defusers.add(p.pin);
  if (b.defusers.size < b.need) return { kind: 'good', code: 'bombProgress', p: { i, n: b.defusers.size, need: b.need } };
  clearTimeout(b.timer);
  Object.assign(b, { active: false, timer: null, cooldownUntil: now + BOMB_COOLDOWN_MS });
  game.scores[p.team] += BOMB_DEFUSE_POINTS;
  nsp.emit('bomb', { type: 'defused', i, by: b.by, target: b.target, pts: BOMB_DEFUSE_POINTS });
  return { kind: 'good', code: 'bombDefused', p: { i, pts: BOMB_DEFUSE_POINTS } };
}

// ---------- test bots (added by the admin) ----------
let botSeq = 0;
function addBots(team, count) {
  const free = numbers[team].filter((pin) => !game.players.has(pin));
  for (let i = 0; i < count && free.length; i++) {
    const pin = free.splice(Math.floor(Math.random() * free.length), 1)[0];
    botSeq += 1;
    game.players.set(pin, { pin, team, name: `Bot ${botSeq}`, bot: true, joinedAt: Date.now(), lastSeen: 0,
      connected: true, socketId: null, lockedUntil: 0, lastTarget: null, lockTimer: null, nextAt: 0 });
  }
}

function removeBots() {
  for (const [pin, p] of game.players) if (p.bot) { clearTimeout(p.lockTimer); game.players.delete(pin); }
}

// Bots also play the coins and the bombs: they pick up a coin whose wait is over, arm a bomb when their team can pay for it
// and (now and then) run to defuse a bomb armed against their team. Returns true if the bot did one of these.
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const lockedShare = (t) => { let n = 0, l = 0; for (const p of game.players.values()) if (p.team === t && (p.connected || p.bot)) { n += 1; if (isLocked(p)) l += 1; } return n ? l / n : 0; };
function botCoin(p) {
  const ready = coinList.codes.filter((c) => coinWait(p, c, coinList.info(c)) <= 0);
  if (ready.length) scanCoin(p, pick(ready));
}
function botExtra(p) {
  if (game.bombsEnabled) {
    const now = Date.now();
    const against = game.bombs.flatMap((b, i) => (b.active && b.target === p.team && !b.defusers.has(p.pin) ? [i] : []));
    if (against.length && Math.random() < (game.botsBalance ? 0.01 : 0.12)) { bombAction(p, pick(against)); return true; } // the simulator lets some bombs explode
    if (Math.random() < (game.botsBalance ? 0.3 : 0.1) && game.coins[p.team] >= bombCostFor(teamSize(p.team))) { // the simulator's bots use bombs more
      const idle = game.bombs.flatMap((b, i) => (!b.active && b.cooldownUntil <= now ? [i] : []));
      if (idle.length) { bombAction(p, pick(idle)); return true; }
    }
  }
  if (Math.random() < 0.25) {
    const ready = coinList.codes.filter((c) => coinWait(p, c, coinList.info(c)) <= 0);
    if (ready.length) { scanCoin(p, pick(ready)); return true; }
  }
  return false;
}

// Every bot "thinks" for 1.5-4s, then plays a coin or a bomb, or frees a locked teammate if there is one, otherwise shoots a random enemy.
setInterval(() => {
  if (!game.botsPlay || game.phase !== 'running') return;
  const now = Date.now();
  let acted = false;
  for (const p of game.players.values()) {
    if (!p.bot || isLocked(p) || now < p.nextAt) continue;
    let lead = 0; // > 0: the other team has a bigger share of its players locked, so this team is winning
    if (game.botsBalance) lead = lockedShare(p.team === 'A' ? 'B' : 'A') - lockedShare(p.team);
    p.nextAt = now + (1500 + Math.random() * 2500) * Math.min(1.8, Math.max(0.6, 1 + lead)); // the team that is behind plays faster
    if (game.botsBalance && Math.random() < Math.min(0.85, Math.max(0, lead * 1.5))) { botCoin(p); acted = true; continue; } // ahead: collect coins instead of shooting
    if (botExtra(p)) { acted = true; continue; }
    const others = [...game.players.values()].filter((q) => q.pin !== p.pin);
    const mates = others.filter((q) => q.team === p.team && isLocked(q) && !q.out);
    const enemies = others.filter((q) => q.team !== p.team && !isLocked(q));
    const pool = mates.length ? mates : enemies.length ? enemies : others;
    if (!pool.length) continue;
    guess(p, pool[Math.floor(Math.random() * pool.length)].pin);
    acted = true;
  }
  if (acted) broadcast();
}, 500);

// ---------- state broadcast ----------
function counts() {
  const c = { A: 0, B: 0 };
  for (const p of game.players.values()) c[p.team] += 1;
  return c;
}

function base() {
  return { phase: game.phase, round: game.round, startsAt: game.startsAt, duration: game.duration, lockMs: game.respawnMs, bombMs: game.bombMs, maxReturns: game.maxReturns, unlimitedReturns: game.unlimitedReturns, bombsEnabled: game.bombsEnabled, endsAt: game.endsAt, scores: game.scores, wins: game.wins, coins: game.coins, lastResult: game.lastResult, now: Date.now(),
    bombs: !game.bombsEnabled ? [] : game.bombs.map((b, i) => (b.active ? { i, by: b.by, target: b.target, endsAt: b.endsAt, need: b.need, got: b.defusers.size } : null)).filter(Boolean),
    bombInfo: { cost: { A: bombCostFor(teamSize('A')), B: bombCostFor(teamSize('B')) }, need: { A: defuseNeedFor(teamSize('A')), B: defuseNeedFor(teamSize('B')) } } };
}

function adminState() {
  const teams = {};
  TEAMS.forEach((t) => (teams[t] = { score: game.scores[t], wins: game.wins[t], players: [] }));
  for (const p of game.players.values()) {
    teams[p.team].players.push({
      pin: p.pin,
      name: p.name,
      connected: p.connected,
      lastSeen: p.lastSeen,
      joinedAt: p.joinedAt,
      bot: !!p.bot,
      lockedUntil: lockedUntilOf(p),
      out: !!p.out,
      left: returnsLeft(p),
    });
  }
  return { ...base(), feed: game.feed, blocked: game.blocked, showNumbers: game.showNumbers, allowRepeat: game.allowRepeat, botsPlay: game.botsPlay, botsBalance: game.botsBalance, teams, numbers, taken: [...game.players.keys()] };
}

// Read-only state for the big screen: no PINs (they are the secret that lets someone play as that player)
function screenState() {
  const teams = {};
  TEAMS.forEach((t) => (teams[t] = { score: game.scores[t], wins: game.wins[t], players: [] }));
  let i = 0;
  for (const p of game.players.values()) {
    i += 1;
    teams[p.team].players.push({ name: p.name || '', n: i, ...(game.showNumbers ? { pin: p.pin } : {}), bot: !!p.bot, connected: p.connected, out: !!p.out, lockedUntil: lockedUntilOf(p) });
  }
  const strip = (x) => ({ name: x.name || '', team: x.team, bot: x.bot });
  const feed = game.feed.slice(0, 8).map((e) => ({ t: e.t, type: e.type, by: strip(e.by), target: strip(e.target) }));
  return { ...base(), showNumbers: game.showNumbers, teams, feed };
}

function playerState(p) {
  return {
    ...base(),
    counts: counts(),
    me: { pin: p.pin, name: p.name, team: p.team, lockedUntil: lockedUntilOf(p), lockCause: p.lockCause || 'player', out: !!p.out, left: returnsLeft(p), defused: game.bombs.flatMap((b, i) => (b.active && b.defusers.has(p.pin) ? [i] : [])) },
  };
}

// Send the current state to everyone. The first change goes out at once; further changes inside
// the next 100 ms are merged into one send, so a busy game never floods phones with updates.
const BATCH_MS = 100;
let batchTimer = null, batchPending = false;
function flush() {
  nsp.to('admins').emit('state', adminState());
  nsp.to('screens').emit('state', screenState());
  for (const p of game.players.values()) nsp.to(`pin:${p.pin}`).emit('state', playerState(p));
}
function broadcast() {
  if (batchTimer) { batchPending = true; return; }
  flush();
  batchTimer = setTimeout(() => {
    batchTimer = null;
    if (batchPending) { batchPending = false; broadcast(); }
  }, BATCH_MS);
}

nsp.on('connection', (socket) => {
  // ----- player -----
  socket.on('join', ({ pin, name } = {}, ack) => {
    if (game.blocked) return ack?.({ error: 'blocked' });
    pin = String(pin || '').trim();
    name = String(name || '').trim().slice(0, 20);
    if (!/^\d{4}$/.test(pin)) return ack?.({ error: 'pin4' });
    const team = teamOfPin[pin]; // the number decides the team
    if (!team) return ack?.({ error: 'noSuchNumber' });

    let p = game.players.get(pin);
    if (p && p.connected && p.socketId !== socket.id) return ack?.({ error: 'pinUsed' });
    if (!p) {
      p = { pin, team, name, joinedAt: Date.now(), lastSeen: 0, lockedUntil: 0, lastTarget: null, lockTimer: null };
      game.players.set(pin, p);
    } else if (name) {
      p.name = name;
    }
    // a connection can only be one player: release the previous one if this socket switches numbers
    const prev = game.players.get(socket.data.pin);
    if (prev && prev.pin !== pin && prev.socketId === socket.id) {
      prev.connected = false; prev.lastSeen = Date.now(); socket.leave(`pin:${prev.pin}`);
    }
    p.connected = true;
    p.socketId = socket.id;
    socket.data.pin = pin;
    socket.join(`pin:${pin}`);
    ack?.({ ok: true, team });
    broadcast();
  });

  socket.on('guess', ({ number } = {}, ack) => {
    const p = game.players.get(socket.data.pin);
    if (!p) return ack?.({ kind: 'info', code: 'notJoined' });
    number = String(number || '').trim();
    // a coin's number is typed exactly like a player's number (coin numbers never equal a player number)
    if (coinList.info(number)) {
      const result = scanCoin(p, number);
      ack?.(result);
      if (result.code === 'coinGot') {
        nsp.to('screens').emit('coin', { team: p.team, tier: result.p.tier, pts: result.p.pts }); // the big screens celebrate it
        nsp.to('admins').emit('coinTaken', { code: number, team: p.team, tier: result.p.tier, pts: result.p.pts }); // the admin test board lights up the coin
      }
      broadcast();
      return;
    }
    const bomb = bombList.indexOf(number);
    if (bomb >= 0) {
      ack?.(bombAction(p, bomb));
      broadcast();
      return;
    }
    const result = guess(p, number);
    ack?.(result);
    broadcast();
  });

  // Fresh state on demand: used by clients that were in the background or lost their connection.
  socket.on('sync', (_, ack) => {
    if (typeof ack !== 'function') return;
    if (socket.data.admin) return auth.isAdminSocket(socket) ? ack({ state: adminState() }) : ack({ forbidden: true });
    if (socket.data.screen) return ack({ state: screenState() });
    const p = game.players.get(socket.data.pin);
    if (!p) return ack({ notJoined: true });
    if (p.socketId !== socket.id) { p.socketId = socket.id; p.connected = true; socket.join(`pin:${p.pin}`); broadcast(); }
    ack({ state: playerState(p) });
  });

  // ----- big screen (view only) -----
  socket.on('screen:hello', (_, ack) => {
    socket.join('screens');
    socket.data.screen = true;
    ack?.(screenState());
    socket.emit('screen:admin', auth.isAdminSocket(socket));   // only admins get the show/hide button
  });

  // ----- admin -----
  socket.on('admin:hello', (_, ack) => {
    if (!auth.isAdminSocket(socket)) return ack?.({ error: 'forbidden' });   // only the laptop or someone with the key
    socket.join('admins');
    socket.data.admin = true;
    ack?.(adminState());
  });

  // re-checked on every command, so resetting the key cuts off old admins immediately
  const adminOnly = (fn) => (...args) => socket.data.admin && auth.isAdminSocket(socket) && fn(...args);

  socket.on('admin:start', adminOnly(({ minutes } = {}, ack) => {
    const m = Number(minutes);
    if (!Number.isFinite(m) || m < 0.05 || m > 240) return ack?.({ error: 'minutesRange' });
    startRound(m);
    ack?.({ ok: true });
  }));
  socket.on('admin:settings', adminOnly(({ maxReturns, respawnSec, unlimited, bombsEnabled, bombSec } = {}, ack) => {
    const m = Number(maxReturns), s = Number(respawnSec), bs = Number(bombSec);
    if (bombSec !== undefined && Number.isFinite(bs) && bs >= 5 && bs <= 300) game.bombMs = Math.round(bs * 1000);
    if (bombsEnabled !== undefined) {
      game.bombsEnabled = !!bombsEnabled;
      if (!game.bombsEnabled) clearBombs(); // switching bombs off defuses every armed bomb
    }
    if (unlimited !== undefined) {
      game.unlimitedReturns = !!unlimited;
      if (game.unlimitedReturns) for (const q of game.players.values()) q.out = false; // players that were out come back at once
    }
    if (maxReturns !== undefined && Number.isFinite(m) && m >= 0 && m <= 99) game.maxReturns = Math.floor(m);
    // players that ran out of returns come back if the new limit gives them some again
    for (const q of game.players.values()) if (q.out && !game.unlimitedReturns && (q.returns || 0) < game.maxReturns) { q.out = false; q.lockedUntil = 0; }
    if (respawnSec !== undefined && Number.isFinite(s) && s >= 1 && s <= 300) game.respawnMs = Math.round(s * 1000);
    broadcast();
    ack?.({ ok: true, bombSec: game.bombMs / 1000, maxReturns: game.maxReturns, unlimited: game.unlimitedReturns, respawnSec: game.respawnMs / 1000 });
  }));
  socket.on('admin:addBots', adminOnly(({ team, count } = {}) => {
    if (!TEAMS.includes(team)) return;
    addBots(team, Math.min(50, Math.max(1, parseInt(count, 10) || 1)));
    broadcast();
  }));
  socket.on('admin:removeBots', adminOnly(() => { removeBots(); broadcast(); }));
  socket.on('admin:botsPlay', adminOnly((on) => { game.botsPlay = !!on; broadcast(); }));
  socket.on('admin:botsBalance', adminOnly((on) => { game.botsBalance = !!on; broadcast(); }));
  socket.on('admin:allowRepeat', adminOnly((on) => {
    game.allowRepeat = !!on;
    broadcast();
  }));
  socket.on('admin:end', adminOnly(() => endRound()));
  socket.on('admin:points', adminOnly(({ team, delta } = {}) => {
    const d = Number(delta);
    if (!TEAMS.includes(team) || !Number.isFinite(d)) return;
    game.scores[team] += d;
    broadcast();
  }));
  socket.on('admin:kick', adminOnly(({ pin } = {}) => {
    const p = game.players.get(pin);
    if (!p) return;
    clearTimeout(p.lockTimer);
    game.players.delete(pin);
    nsp.to(`pin:${pin}`).emit('kicked', 'kickedRemoved');
    broadcast();
  }));
  socket.on('admin:showNumbers', (on) => {
    if (!auth.isAdminSocket(socket)) return;          // the big screen's own button is allowed too, but only for admins
    game.showNumbers = !!on;
    broadcast();
  });
  socket.on('admin:block', adminOnly((on) => setBlocked(on)));
  // reset the game; with { block: true } players are also locked out until the admin allows them again
  socket.on('admin:reset', adminOnly(({ block } = {}) => { resetGame(); if (block) setBlocked(true); }));

  socket.on('disconnect', () => {
    const p = game.players.get(socket.data.pin);
    if (p && p.socketId === socket.id) {
      p.connected = false;
      p.lastSeen = Date.now();
      broadcast();
    }
  });
});

  // quick overview for the hub page
  function summary() {
    let connected = 0;
    for (const p of game.players.values()) if (p.connected) connected += 1;
    return { id, blocked: game.blocked, phase: game.phase, round: game.round, players: game.players.size, connected,
      scores: game.scores, wins: game.wins, endsAt: game.endsAt, now: Date.now() };
  }

  // after the admin key is reset: remove admin sockets that no longer qualify
  async function dropAdmins() {
    for (const s of await nsp.in('admins').fetchSockets()) {
      if (!auth.isAdminSocket(s)) { s.leave('admins'); s.data.admin = false; s.emit('forbidden'); }
    }
  }

  return { id, summary, dropAdmins };
}

module.exports = { createRoom };
