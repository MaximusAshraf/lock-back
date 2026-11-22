// Builds the two guide pages (player + admin) as HTML for one language, next to the screenshots in ./img.
//   node guide/src/build.js        -> guide-en.html and guide-ar.html (then render.js makes the PNGs and PDFs)
const fs = require('fs');
const path = require('path');

const T = {
  en: {
    dir: 'ltr', admin: 'Lock Back — Admin guide', adminSub: 'Run up to 3 games from one screen', adminOpen: 'Open on the laptop: http://localhost:3080/admin',
    p_title: 'Lock Back — How to play', p_sub: 'Lock the other team. Free your own team.', before: 'Before the round',
    s1: 'Join the Wi-Fi', s2: 'Scan the QR code of your game (or open its link)', s3: 'Type your <b>4-digit number</b> (it decides your team) and your name', s4: 'Tap <b>Ready</b>',
    c1: 'Type your number and tap Ready', c2: 'Round on: coins and locks show up as messages', c3: 'A bomb is armed against your team!', c4: 'Locked: show your number to be freed', c5: 'Round result',
    score: '⭐ Score points', score1: '<b>Enemy</b> number → they are <b>locked</b>. <b>+1 point</b> (their team −1)', score2: '<b>Locked teammate</b> number → you <b>free</b> them. <b>+1 point</b>',
    watch: '⚠️ Watch out', w1: 'An enemy who is <b>already locked</b> can’t be locked again — nothing happens.', w2: 'You can’t enter the <b>same number twice in a row</b>.', w3: 'Your own number does nothing.', w4: 'When you are locked your screen turns red — <b>show your number</b> so a teammate can free you sooner.', w5: 'You can <b>come back</b> only a limited number of times per round (❤️ on your screen). With none left you are <b>out</b> until the next round.',
    coinsT: '🪙 Coins', k1: 'Printed coins are hidden around. Each has its <b>own 4-digit number</b>: type it like a player number.', k2: '<b>Gold +5</b> points (wait 30 s) · <b>Silver +3</b> (20 s) · <b>Bronze +1</b> (10 s).', k3: 'The wait is <b>per player</b>: you can take the same coin again only after it.', k4: 'Your team’s coins (gold = 5, silver = 3) are its <b>bomb balance</b>.',
    bombsT: '💣 Bombs', b1: 'Four bombs are hidden too, each with its own number. Type it to <b>arm it against the other team</b> — it costs coins (shown on your screen).', b2: 'After <b>15 s</b> it explodes and <b>locks</b> some of their players.', b3: 'A bomb against <b>your</b> team? A red alarm shows its picture: find it and type its number. Enough <b>different teammates</b> must type it in time to defuse it (+3).',
    endT: '🏆 End of the round', e1: 'The team with <b>more points wins the round</b>.', e2: 'Scores start again at 0 next round.', e3: 'Round wins are counted until the admin resets the game.', helpTip: 'Tap <b>?</b> at the top of your screen any time to read these instructions.',
    a1: 'Open the master board', a1a: 'Set the <b>round time</b> at the top (type minutes, or tap 1 / 2 / 3 / 5).', a1b: 'Press <b>▶ Start round</b> on a game. It uses the time you set.', a1c: 'The same button becomes <b>✕ Cancel start</b> during the 3-2-1, then <b>■ End round</b> while it runs.', a1d: 'Each card shows the timer, the score, 🏆 rounds won and how many players are online.',
    a2: 'Bring the players in', a2a: '📱 <b>Share / QR</b> shows a big QR code and link for that game (http — no browser warning).', a2b: '🔢 <b>Show numbers</b> (Full board) fills the screen with all numbers: <b>online</b> · <b>offline</b> · <b>free</b>.', a2c: 'Players pick a <b>free number</b> from their team. Use <b>Size → Very large</b> if it is hard to read.',
    a3: 'Watch and manage one game (Full board)', a3a: 'Scores and 🏆 round wins for both teams.', a3b: 'Players: <b>green</b> = online, <b>red</b> = offline. A <b>locked</b> player glows red with a countdown.', a3c: '<b>± buttons</b> change a team’s points. ✕ removes a player.', a3d: '<b>Activity</b> lists who locked or freed whom.', a3e: '<b>End round</b> / <b>Reset game</b>. Test bots and the “same number twice” switch are for practice only.', a3f: 'The <b>Locks and returns</b> box sets how many times each player can <b>come back</b> per round (default 3) and the <b>return time</b> in seconds. With no returns left a player is out (💀) until the next round.',
    a4: 'Coins and bombs', a4a: 'On the master board tap <b>🖨 Print coins</b>, then choose <b>Print all</b>, <b>🪙 Print coins only</b> (to play <b>without bombs</b>) or <b>💣 Print bombs only</b>. One coin or bomb per A4 page — hide them in different places.',
    a4b: 'Coin numbers and bomb numbers are 4 digits and never equal a player’s number. They stay the same until you delete the <i>data</i> folder.', a4c: 'A bomb costs about <b>1.2 coins per player</b> of the arming team, needs about <b>6%</b> of the target team (at least 2 players) to defuse and locks about <b>10%</b> of the target team. Countdown <b>15 s</b>, then the bomb rests 30 s.',
    a4d: 'The big screen shows every armed bomb with its timer and a 💥 when it explodes.',
    a5: 'Between groups of players', r1: 'Reset game', r1t: 'Removes old players, gives new numbers, sets scores and wins to 0.', r2: 'Show numbers', r2t: 'Put the new numbers on the big screen.', r3: 'Set the time', r3t: 'Then press ▶ Start round.', r4: 'See the winner', r4t: 'Scores reset each round; wins add up until the next reset.',
    t1: '💡 Laptop on a <b>cable</b> to the router', t2: '💡 One <b>5 GHz</b> router per game', t3: '💡 Give the Wi-Fi password only to the <b>current group</b>', t4: '💡 Phones: tap “stay connected” if Wi-Fi has no internet', t5: '💡 Turn off “AP / client isolation” on the router',
  },
  ar: {
    dir: 'rtl', admin: 'لوك باك — دليل المشرف', adminSub: 'شغّل حتى 3 ألعاب من شاشة واحدة', adminOpen: 'افتح على اللابتوب: http://localhost:3080/admin',
    p_title: 'لوك باك — طريقة اللعب', p_sub: 'اقفل الفريق الآخر. وحرّر فريقك.', before: 'قبل الجولة',
    s1: 'اتصل بشبكة الواي فاي', s2: 'امسح QR لعبتك (أو افتح رابطها)', s3: 'اكتب <b>رقمك المكوّن من 4 أرقام</b> (هو الذي يحدد فريقك) واسمك', s4: 'اضغط <b>Ready</b>',
    c1: 'اكتب رقمك واضغط Ready', c2: 'الجولة تعمل: العملات والقفل تظهر كرسائل', c3: 'قنبلة مفعّلة ضد فريقك!', c4: 'مقفول: أرِ رقمك لتتحرر', c5: 'نتيجة الجولة',
    score: '⭐ سجّل نقاطاً', score1: 'رقم <b>خصم</b> → يُقفل. <b>+1 نقطة</b> (وفريقه −1)', score2: 'رقم <b>زميل مقفول</b> → <b>تحرّره</b>. <b>+1 نقطة</b>',
    watch: '⚠️ انتبه', w1: 'الخصم <b>المقفول بالفعل</b> لا يمكن قفله مرة أخرى — لا يحدث شيء.', w2: 'لا يمكنك كتابة <b>نفس الرقم مرتين متتاليتين</b>.', w3: 'كتابة رقمك أنت لا تفعل شيئاً.', w4: 'عندما تُقفل تتحول الشاشة للأحمر — <b>أرِ رقمك</b> لزميل ليحرّرك أسرع.', w5: 'لكل لاعب عدد محدود من مرات <b>الرجوع</b> في الجولة (❤️ على شاشتك). وإذا انتهت <b>تخرج</b> حتى الجولة التالية.',
    coinsT: '🪙 العملات', k1: 'عملات مطبوعة مخبأة في أماكن مختلفة. لكل عملة <b>رقم من 4 أرقام</b>: اكتبه مثل رقم اللاعب.', k2: '<b>الذهبية +5</b> نقاط (انتظار 30 ث) · <b>الفضية +3</b> (20 ث) · <b>البرونزية +1</b> (10 ث).', k3: 'الانتظار <b>لكل لاعب</b>: لا تأخذ نفس العملة إلا بعد انتهائه.', k4: 'عملات فريقك (الذهبية = 5 والفضية = 3) هي <b>رصيد القنابل</b>.',
    bombsT: '💣 القنابل', b1: 'أربع قنابل مخبأة أيضاً، لكل منها رقمها. اكتبه <b>لتفعّلها ضد الفريق الآخر</b> — وتكلّف عملات (تظهر على شاشتك).', b2: 'بعد <b>15 ثانية</b> تنفجر و<b>تقفل</b> بعض لاعبيهم.', b3: 'قنبلة ضد <b>فريقك</b>؟ إنذار أحمر بصورتها: ابحثوا عنها واكتبوا رقمها. يجب أن يكتبه عدد كافٍ من <b>زملاء مختلفين</b> في الوقت لتفكيكها (+3).',
    endT: '🏆 نهاية الجولة', e1: 'الفريق صاحب <b>النقاط الأكثر يفوز بالجولة</b>.', e2: 'تبدأ النقاط من 0 في الجولة التالية.', e3: 'تُحسب الجولات الفائزة حتى يعيد المشرف ضبط اللعبة.', helpTip: 'اضغط <b>?</b> أعلى شاشتك في أي وقت لقراءة هذه التعليمات.',
    a1: 'افتح اللوحة الرئيسية', a1a: 'اضبط <b>وقت الجولة</b> بالأعلى (اكتب الدقائق أو اضغط 1 / 2 / 3 / 5).', a1b: 'اضغط <b>▶ Start round</b> على اللعبة. يستخدم الوقت الذي ضبطته.', a1c: 'يتحول الزر إلى <b>✕ Cancel start</b> أثناء العد 3-2-1 ثم <b>■ End round</b> أثناء الجولة.', a1d: 'كل بطاقة تعرض المؤقت والنتيجة و🏆 الجولات الفائزة وعدد اللاعبين المتصلين.',
    a2: 'أدخل اللاعبين', a2a: '📱 <b>Share / QR</b> يعرض QR كبيراً ورابطاً لتلك اللعبة (http — بلا تحذير في المتصفح).', a2b: '🔢 <b>Show numbers</b> (Full board) يملأ الشاشة بكل الأرقام: <b>متصل</b> · <b>غير متصل</b> · <b>متاح</b>.', a2c: 'يختار اللاعبون <b>رقماً متاحاً</b> من فريقهم. استخدم <b>Size → Very large</b> إن كان صعب القراءة.',
    a3: 'راقب وأدِر لعبة واحدة (Full board)', a3a: 'النقاط و🏆 الجولات الفائزة للفريقين.', a3b: 'اللاعبون: <b>أخضر</b> = متصل، <b>أحمر</b> = غير متصل. اللاعب <b>المقفول</b> يتوهج بالأحمر مع عدّاد.', a3c: 'أزرار <b>±</b> تغيّر نقاط الفريق. ✕ تزيل لاعباً.', a3d: '<b>Activity</b> يعرض من قفل من أو حرّر من.', a3e: '<b>End round</b> / <b>Reset game</b>. بوتات الاختبار ومفتاح «نفس الرقم مرتين» للتجربة فقط.', a3f: 'صندوق <b>Locks and returns</b> يحدد كم مرة يمكن لكل لاعب <b>الرجوع</b> في الجولة (الافتراضي 3) و<b>وقت الرجوع</b> بالثواني. وإذا انتهت مرات الرجوع يخرج اللاعب (💀) حتى الجولة التالية.',
    a4: 'العملات والقنابل', a4a: 'في اللوحة الرئيسية اضغط <b>🖨 Print coins</b> ثم اختر <b>Print all</b> أو <b>🪙 Print coins only</b> (للعب <b>بدون قنابل</b>) أو <b>💣 Print bombs only</b>. عملة أو قنبلة في كل صفحة A4 — اخفوها في أماكن مختلفة.',
    a4b: 'أرقام العملات والقنابل من 4 أرقام ولا تساوي أبداً رقم لاعب. تبقى ثابتة إلا إذا حذفت فولدر <i>data</i>.', a4c: 'القنبلة تكلّف نحو <b>1.2 عملة لكل لاعب</b> في الفريق الذي يفعّلها، وتحتاج نحو <b>6%</b> من الفريق المستهدف (لاعبَين على الأقل) لتفكيكها، وتقفل نحو <b>10%</b> منه. العدّ <b>15 ثانية</b> ثم تستريح 30 ثانية.',
    a4d: 'الشاشة الكبيرة تعرض كل قنبلة مفعّلة مع مؤقتها وتظهر 💥 عند الانفجار.',
    a5: 'بين مجموعات اللاعبين', r1: 'Reset game', r1t: 'يزيل اللاعبين القدامى ويعطي أرقاماً جديدة ويصفّر النقاط والفوز.', r2: 'Show numbers', r2t: 'ضع الأرقام الجديدة على الشاشة الكبيرة.', r3: 'اضبط الوقت', r3t: 'ثم اضغط ▶ Start round.', r4: 'شاهد الفائز', r4t: 'تُصفّر النقاط كل جولة؛ والفوز يتراكم حتى الـ reset التالي.',
    t1: '💡 اللابتوب بـ <b>كابل</b> إلى الراوتر', t2: '💡 راوتر <b>5 GHz</b> لكل لعبة', t3: '💡 أعطِ كلمة سر الواي فاي للمجموعة <b>الحالية</b> فقط', t4: '💡 الموبايلات: اضغط «ابقَ متصلاً» إن لم يكن للواي فاي إنترنت', t5: '💡 أوقف «AP / client isolation» في الراوتر',
  },
};

const CSS = `
*{box-sizing:border-box} body{margin:0;background:#0b0f17;color:#eef2f8;font-family:-apple-system,"SF Pro Text","Segoe UI","Geeza Pro","Arial",sans-serif;line-height:1.45}
.sheet{width:1000px;padding:34px 30px 38px;background:radial-gradient(120% 40% at 50% 0%,#1a2540 0%,#0b0f17 70%)}
h1{margin:0;font-size:46px;font-weight:900} .sub{color:#8b97ab;font-size:22px;margin:4px 0 0} .top{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;flex-wrap:wrap;margin-bottom:18px}
.url{font:600 18px ui-monospace,Menlo,monospace;background:#161d2b;border-radius:10px;padding:10px 16px;direction:ltr;color:#cbd5e1}
h2.cap{margin:16px 0 10px;color:#8b97ab;font-size:26px}
.steps{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.step{background:#161d2b;border-radius:16px;padding:14px;display:flex;gap:10px;align-items:flex-start;font-size:18px}
.num{flex:none;width:34px;height:34px;border-radius:50%;background:#2563eb;color:#fff;font-weight:900;display:flex;align-items:center;justify-content:center}
.num.g{background:#16a34a}
.phones{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin:18px 0}
.ph{text-align:center;font-size:16px;font-weight:700} .ph .num{margin:0 auto 8px} .ph img{width:100%;border-radius:20px;border:3px solid #1d2a44;display:block;margin-bottom:8px}
.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:14px} .cards.two{grid-template-columns:repeat(2,1fr)}
.card{background:#161d2b;border-radius:18px;border-top:6px solid var(--c,#22c55e);padding:14px 18px 16px}
.card h3{margin:0 0 6px;font-size:26px} .card ul{margin:0;padding-inline-start:20px;font-size:17.5px} .card li{margin:6px 0}
.box{background:#161d2b;border-radius:20px;padding:20px 22px;margin-top:16px}
.box h2{margin:0 0 12px;font-size:30px;display:flex;align-items:center;gap:12px}
.cols{display:grid;grid-template-columns:1.25fr 1fr;gap:20px;align-items:start} .cols.rev{grid-template-columns:1fr 1.25fr}
.box ul{margin:0;padding-inline-start:22px;font-size:19px} .box li{margin:8px 0}
.shot{width:100%;border-radius:12px;border:1px solid #27324a;display:block} .row{display:flex;gap:12px;align-items:flex-start}
.tips{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px} .tip{background:#161d2b;border-radius:99px;padding:10px 18px;font-size:17px}
.mini4{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.mini{background:#0e1420;border-radius:14px;padding:14px;text-align:center}.mini b{display:block;font-size:21px;margin-bottom:6px}.mini span{font-size:16px;color:#aab4c6}
.pics{display:flex;gap:14px;justify-content:center;margin-top:12px}.pics img{height:78px;width:auto}
.help{margin-top:14px;background:#1b2740;border-radius:14px;padding:12px 18px;font-size:19px;text-align:center}
.on{color:#4ade80;font-weight:800}.off{color:#f87171;font-weight:800}.fr{color:#fff;font-weight:800}
@page{margin:0}`;

function build(lang) {
  const t = T[lang], img = (n) => `img/${lang}-${n}.png`;
  const player = `<section class="sheet" id="player">
  <h1>🔒 ${t.p_title}</h1><p class="sub">${t.p_sub}</p>
  <h2 class="cap">${t.before}</h2>
  <div class="steps">${[t.s1, t.s2, t.s3, t.s4].map((s, i) => `<div class="step"><span class="num">${i + 1}</span><span>${s}</span></div>`).join('')}</div>
  <div class="phones">${['p-join', 'p-run', 'p-bomb', 'p-lock', 'p-result'].map((n, i) => `<div class="ph"><span class="num g">${i + 1}</span><img src="${img(n)}" alt=""><span>${[t.c1, t.c2, t.c3, t.c4, t.c5][i]}</span></div>`).join('')}</div>
  <div class="cards">
    <div class="card" style="--c:#22c55e"><h3>${t.score}</h3><ul><li>${t.score1}</li><li>${t.score2}</li></ul></div>
    <div class="card" style="--c:#ef4444"><h3>${t.watch}</h3><ul><li>${t.w1}</li><li>${t.w2}</li><li>${t.w3}</li><li>${t.w4}</li><li>${t.w5}</li></ul></div>
    <div class="card" style="--c:#f59e0b"><h3>${t.endT}</h3><ul><li>${t.e1}</li><li>${t.e2}</li><li>${t.e3}</li></ul></div>
  </div>
  <div class="cards two">
    <div class="card" style="--c:#facc15"><h3>${t.coinsT}</h3><ul><li>${t.k1}</li><li>${t.k2}</li><li>${t.k3}</li><li>${t.k4}</li></ul><div class="pics">${['gold','silver','bronze'].map((k)=>`<img src="../../public/coins/${k}.png" alt="">`).join('')}</div></div>
    <div class="card" style="--c:#fb923c"><h3>${t.bombsT}</h3><ul><li>${t.b1}</li><li>${t.b2}</li><li>${t.b3}</li></ul><div class="pics">${['classic','dynamite','grenade','mine'].map((k)=>`<img src="../../public/bombs/${k}.png" alt="">`).join('')}</div></div>
  </div>
  <div class="help">❓ ${t.helpTip}</div>
</section>`;
  const admin = `<section class="sheet" id="admin">
  <div class="top"><div><h1>🔒 ${t.admin}</h1><p class="sub">${t.adminSub}</p></div><div class="url">${t.adminOpen}</div></div>
  <div class="box"><h2><span class="num g">1</span>${t.a1}</h2><div class="cols"><img class="shot" src="${img('master')}" alt=""><ul><li>${t.a1a}</li><li>${t.a1b}</li><li>${t.a1c}</li><li>${t.a1d}</li></ul></div></div>
  <div class="box"><h2><span class="num g">2</span>${t.a2}</h2><div class="cols rev"><ul><li>${t.a2a}</li><li>${t.a2b}</li><li>${t.a2c}</li></ul><div class="row"><img class="shot" style="width:42%" src="${img('share')}" alt=""><img class="shot" style="width:58%" src="${img('nums')}" alt=""></div></div></div>
  <div class="box"><h2><span class="num g">3</span>${t.a3}</h2><div class="cols"><img class="shot" src="${img('board')}" alt=""><ul><li>${t.a3a}</li><li>${t.a3b}</li><li>${t.a3c}</li><li>${t.a3d}</li><li>${t.a3e}</li><li>${t.a3f}</li></ul></div></div>
  <div class="box"><h2><span class="num g">4</span>${t.a4}</h2>
    <img class="shot" src="${img('coins')}" alt=""><img class="shot" style="margin-top:10px" src="${img('bombs')}" alt="">
    <div class="cols" style="margin-top:14px"><ul><li>${t.a4a}</li><li>${t.a4b}</li><li>${t.a4c}</li><li>${t.a4d}</li></ul><img class="shot" src="${img('screen')}" alt=""></div></div>
  <div class="box"><h2><span class="num g">5</span>${t.a5}</h2><div class="mini4">${[['↺', t.r1, t.r1t], ['🔢', t.r2, t.r2t], ['⏱', t.r3, t.r3t], ['🏆', t.r4, t.r4t]].map(([i, a, b]) => `<div class="mini"><div style="font-size:30px">${i}</div><b>${a}</b><span>${b}</span></div>`).join('')}</div>
    <div class="tips">${[t.t1, t.t2, t.t3, t.t4, t.t5].map((x) => `<span class="tip">${x}</span>`).join('')}</div></div>
</section>`;
  return `<!doctype html><html lang="${lang}" dir="${t.dir}"><head><meta charset="utf-8"><title>Lock Back guide</title><style>${CSS}</style></head><body>${player}${admin}</body></html>`;
}
for (const l of ['en', 'ar']) fs.writeFileSync(path.join(__dirname, `guide-${l}.html`), build(l));
console.log('built');
