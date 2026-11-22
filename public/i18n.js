// Tiny i18n helper shared by the player and admin pages.
const I18N = {
  en: {
    'title.join': 'Lock Back', 'title.admin': 'Lock Back – Admin',
    brand: 'Lock Back', admin: 'Lock Back — Admin',
    teamA: 'Team A', teamB: 'Team B',
    player: 'Player', round: 'Round {n}', startsIn: 'Round starts in…',
    'join.hint': 'Enter your number',  noSuchNumber: 'That number does not exist.',
    'join.name': 'Your name (optional)', 'join.ready': 'Ready', 'join.pickFirst': 'Pick a team first.',
    'ready.title': "✅ You're ready", 'ready.wait': 'Waiting for the admin to start the round…',
    locked: 'LOCKED', sec: 's', yourNumber: 'Your number:',
    // game messages
    notStarted: 'Round has not started.', 'locked.msg': 'You are locked.', enter4: 'Enter 4 digits.',
    ownNumber: "That's your own number.", repeat: "You can't enter the same number twice in a row.",
    noPlayer: 'No active player has that number.', mateNotLocked: 'Teammate is not locked.',
    freed: 'Freed {name}! +1 point', enemyAlreadyLocked: 'That player is already locked.',
    lockedEnemy: 'Locked {name}! +1 point (their team −1)', notJoined: 'Not joined.',
    pickTeam: 'Pick a team.', pin4: 'Number must be 4 digits.', wrongTeam: 'That number does not belong to {team}.',
    pinUsed: 'That number is already in use.', minutesRange: 'Minutes must be between 0.05 and 240.',
    kickedReset: 'The admin reset the game.', kickedRemoved: 'The admin removed you from the game.',
    camStart: 'Turn on camera', camInsecure: 'The camera needs the secure (https) link of the game.', coin_gold: 'Gold', coin_silver: 'Silver', coin_bronze: 'Bronze', coinGot: '{tier} coin! +{pts} points 🪙 {n}', coinAgain: 'You just collected this coin — go find another one! (again in {s}s)', bomb_0: 'Black bomb', bomb_1: 'Dynamite', bomb_2: 'Blue grenade', bomb_3: 'Green mine',
    bombArmed: '💣 {bomb} armed against the other team! (-{cost} 🪙)', bombNeedCoins: 'Not enough coins: this bomb needs {need} 🪙, your team has {have}.',
    bombCooling: 'This bomb is cooling down ({s}s).', bombNoTarget: 'The other team has no players.', bombYours: 'Your team already armed this bomb.',
    bombAlready: 'You already typed this code ({n}/{need}). A teammate must type it too!', bombProgress: 'Defusing {bomb}… {n}/{need} players', bombDefused: '✅ {bomb} defused! +{pts} points',
    bombAlarm: '🚨 {bomb} armed on you — defuse it!', bombBoom: '💥 {n} of {of} of you killed', bombBoomUs: '💥 {n} of {of} of them killed',
    bombFailed: '❌ Your {bomb} was defused by the other team', bombDefuseTxt: 'Type its code ({n}/{need})', bombOursTxt: 'explodes in', bombTagOurs: 'YOU planted it', bombTagThem: 'AGAINST you', bombInfo: '💣 Arm a bomb: {cost} 🪙 · one teammate can defuse it',
    helpTitle: 'How to play', helpClose: 'Close',
    help1: '🔒 Type the 4-digit number of a player from the OTHER team to lock them (+1 point for you, −1 for their team). Type the number of a LOCKED teammate to free them early (+1 point).',
    help2: '⚠️ An enemy who is already locked cannot be locked again (nothing happens, no penalty). You cannot enter the same number twice in a row, and your own number does nothing.',
    help3: '🔴 When you are locked your screen turns red and you are out for a few seconds — show your number to a teammate to be freed sooner. Each player can come back only a limited number of times per round (the ❤️ on your screen shows how many returns are left). With none left you are out until the next round.',
    help4: '🪙 Coins are hidden on printed sheets, each with its own 4-digit number. Type it like a player number: gold +5 points, silver +3, bronze +1. You can take the same coin again only after its wait (gold 30 s, silver 20 s, bronze 10 s).',
    help5: '🪙 The coins your team collects are its bomb balance: gold counts as 5 coins, silver as 3.',
    help6: '💣 Bombs are hidden too (4 different pictures, each with a number). Type a bomb number to arm it against the other team — it costs coins (shown on your screen) and explodes after {s} s, locking some of their players.',
    help7: '🚨 If a bomb is armed against YOUR team a red alarm shows its picture: run to find it and type its number. One teammate typing it before the time runs out defuses it (+3 points).',
    help8: '📝 The messages under the number boxes tell you what just happened.',
    help9: '💔 Killed: an enemy typed your number or a bomb hit your team. Not a bug.',
    help10: '💚 Revived: you return alone when the timer ends, or sooner if a teammate types your number.',
    help11: '💀 Out: no returns left. Wait for the next round.',
    help12: '💣 Green = you planted it (just wait). Red = planted against you (defuse it!).',
    'title.simulator': 'Lock Back – Simulator', simBtn: '🎮 Simulator', simStart: 'Start', simEnd: 'End', simPhones: 'Phones per team', simBots: '+5 bots each', simClear: 'Remove bots', simAuto: 'Auto next round', simPilot: 'Phones play', simSpeed: 'Speed', simMin: 'min',
    lockKilled: 'You were killed — show your number to a teammate to revive you, or wait for the auto-revival', bombMiniOurs: 'Ours', bombMiniThem: 'Defuse {n}/{need}',
    bombSecLbl: 'Bomb explosion time (seconds)',
   
    helpCapKill: 'Killed', helpCapOut: 'Out',
    lockWhyOut: '💀 No returns left',
   
    livesLeft: 'Returns left: {n}', outTitle: '💀 You are out', outHint: 'Out for this round — you are back in the next one', youOut: '💀 No returns left: you are out for this round', mateOut: 'That teammate is out for this round.',
    lifeSettings: 'Locks and returns', maxReturnsLbl: 'Returns per player (per round)', respawnLbl: 'Return time (seconds)', apply: 'Apply',
    lifeHint: 'A locked player comes back after the return time, up to the number of returns; after that he is out until the round ends. 0 returns = the first lock ends the round for that player.',
    unlimitedLbl: 'Unlimited returns (a locked player only waits for the return time)',
    help3u: '🔴 When you are locked your screen turns red and you are out for a few seconds — show your number to a teammate to be freed sooner. You always come back after the return time: there is no limit on returns in this game.',
    gameOver: 'GAME OVER',
    bombsLbl: 'Bombs mode', bombsOff: 'Bombs are switched off in this game.',
    youBack: '❤️ You are back in the game!',
    rulesTitle: 'Game rules', rulesHint: 'Changes apply immediately.', bombsHint: 'Players can arm and defuse bombs',
    testBoard: 'Test board', testBoardBtn: '🧪 Test board', testBoardHint: 'Joined players, coins and bombs. Click a number to copy it.', testBoardPlayers: 'Player numbers', testBoardCoins: 'Coins', testBoardBombs: 'Bombs', backAdmin: 'Back to admin', copied: 'Copied {code}',
    'title.testboard': 'Lock Back – Test board',
    scrBombArmed: '💣 {by} armed the {bomb} against {target}!', scrBombDefused: '✅ {target} defused the {bomb}!', scrBombBoom: '💥 The {bomb} exploded! {n} of {target} locked', scrCoinTaken: '{team} +{pts}',
    coinInvalid: 'That is not a coin number.',
    camErr: 'Could not open the camera. Allow it in the browser.', camHttps: 'The camera needs a secure link. Tap to open it (accept the browser warning once).', camHttpsBtn: 'Open secure page', coinTitle: 'Coins',
    printCoins: 'Print coins', testTools: 'Testing tools', 
    // admin
    connecting: 'Connecting…', disconnected: 'Disconnected', offMsg: 'Server disconnected', startServer: 'Start server',
    startingServer: 'Starting server…', serverStarting: 'Server starting — reconnecting…',
    launcherDown: 'Launcher is not running. Run "npm start" on the host machine.',
    start1: 'Start 1 min', start2: '2 min', start3: '3 min', customTitle: 'Custom minutes', startCustom: 'Start custom',
    endRound: 'End round', resetGame: 'Reset game',
    confirmEnd: 'End the current round now?', confirmReset: 'Reset scores, rounds and remove all players?',
    stLobby: 'Lobby — waiting to start', stStarting: 'Round {n} — starting…', stRunning: 'Round {n} — running',
    stFinished: 'Round {n} finished — waiting for next round',
    youLocked: '⚔️ Killed by an enemy', youBombed: '💣 Killed by a bomb', youRevivedTimer: '💚 Revived!', youRevivedMate: '💚 A teammate revived you',
    roundDone: 'Round {n} finished', upNext: 'Round {n} is next', startsInShort: 'Round {n} starts in {s}…', you: 'You', lockedTitle: 'You are locked', adminLink: 'Admin link', adminLinkTitle: 'Admin link for another device', adminLinkHint: 'Anyone who opens this link can control the games. Share it only with people you trust. “Reset key” makes every old link stop working.', resetKey: 'Reset key', keyIsReset: 'Key reset ✓', scrGo: 'GO!', scrWins: '{team} wins!', scrDraw: 'Draw!', scrSound: 'Sound', bigScreen: 'Big screen', bigGames: 'Games', sizeLbl: 'Size', sizeNormal: 'Normal', sizeLarge: 'Large', sizeXL: 'Very large', freeOnly: 'Free only', freeNum: 'Free', showNumbers: 'Show numbers', numbersPick: 'Pick a free number from your team', numTaken: 'taken', fullscreen: 'Full screen', playersWord: 'players', numbersTitle: 'Numbers — {on} online, {off} offline', copyList: 'Copy list', cancelStart: 'Cancel start', masterTitle: 'Control all games', timeLabel: 'Round time (min)', q1: '1 min', q2: '2 min', q3: '3 min', q5: '5 min', startAll: 'Start selected games', endAll: 'End all', startGame: 'Start round', endGame: 'End / cancel', fullBoard: 'Full board', confirmEndAll: 'End the round in ALL games now?', 'title.master': 'Lock Back – Control', game: 'Game {n}', hubTitle: 'Lock Back — Games', hubSub: 'Pick a game to play or to run', hubSubJoin: 'Pick the game you were invited to', hubSubAdmin: 'Pick a game to run', hubWaiting: 'Waiting to start', hubPlayers: '{n} players ({c} online)', hubJoin: 'Join as player', hubAdmin: 'Admin board', allGames: 'All games', 'title.hub': 'Lock Back', 'title.scoreboard': 'Lock Back', winsWord: 'wins', winsBarTitle: 'Rounds won (until reset)', lockedNow: 'Locked now', activity: 'Activity', evLock: '{by} locked {target}', evFree: '{by} freed {target}', evSelf: '{by} got locked by entering the locked {target}', noActivity: 'No locks yet', botsLabel: 'Test bots', botCount: 'Number of bots', addBots: 'Add to {team}', removeBots: 'Remove bots', botsPlay: 'Bots play during rounds', roundWins: 'Round wins', resultTitle: 'Round {n} result', teamWon: '{team} won the round', draw: 'Round ended in a draw', youWon: 'Your team won! 🎉', youLost: 'Your team lost this round', youDraw: 'A draw — no winner', testRepeat: 'Testing: allow the same number twice in a row', online: 'Online', offline: 'Offline', onlineN: '{n} online', offlineN: '{n} offline', lockedShort: 'Locked', share: 'Share / QR', shareTitle: 'Invite players', shareHint: 'Players on the same Wi-Fi scan the code or open the link', copy: 'Copy link', copied: 'Copied ✓', open: 'Open', shareVia: 'Share…', close: 'Close', noNetwork: 'No network connection found — players on other devices cannot join.', showTeammate: 'Show this number to a teammate to get freed',
    noPlayers: 'No players yet', bigScreen: 'Big screen', 'title.screen': 'Lock Back – Screen', scrLive: 'Live', scrWaiting: 'Waiting for the next round', scrGetReady: 'Get ready!', scrWinner: '{team} wins!', scrLockedWord: 'locked', scrNoLocks: 'Locks will show up here', numbersSummary: '{team} numbers ({n}/50 in use)',
    blocked: 'This game is closed to players right now.', kickedBlocked: 'The admin closed the game to players.',
    blockPlayers: 'Block players', allowPlayers: 'Allow players', playersBlocked: 'Players blocked',
    confirmBlock: 'Remove all players and stop anyone from joining?',
    resetAskTitle: 'Reset game', resetAskBody: 'Do you want to block users from using the server?', resetAndBlock: 'Reset and block users', resetOnly: 'Reset only (users can rejoin)', cancel: 'Cancel',
    hideNames: 'Hide names', showNames: 'Show names',
    showNumsOnScreen: 'Show numbers on big screen', hideNumsOnScreen: 'Hide numbers on big screen',
    removePlayer: 'Remove player', confirmKick: 'Remove this player?', promptPoints: 'Points to add (negative to remove):',
  },
  ar: {
    'title.join': 'لوك باك', 'title.admin': 'لوك باك – المشرف',
    brand: 'لوك باك', admin: 'لوك باك — لوحة المشرف',
    teamA: 'الفريق أ', teamB: 'الفريق ب',
    player: 'لاعب', round: 'الجولة {n}', startsIn: 'الجولة تبدأ خلال…',
    'join.hint': 'أدخل رقمك',  noSuchNumber: 'هذا الرقم غير موجود.',
    'join.name': 'اسمك (اختياري)', 'join.ready': 'جاهز', 'join.pickFirst': 'اختر فريقاً أولاً.',
    'ready.title': '✅ أنت جاهز', 'ready.wait': 'في انتظار المشرف لبدء الجولة…',
    locked: 'مقفل', sec: 'ث', yourNumber: 'رقمك:',
    notStarted: 'الجولة لم تبدأ بعد.', 'locked.msg': 'أنت مقفل.', enter4: 'أدخل 4 أرقام.',
    ownNumber: 'هذا رقمك أنت.', repeat: 'لا يمكنك إدخال نفس الرقم مرتين متتاليتين.',
    noPlayer: 'لا يوجد لاعب نشط بهذا الرقم.', mateNotLocked: 'زميلك ليس مقفلاً.',
    freed: 'حررت {name}! +1 نقطة', enemyAlreadyLocked: 'هذا اللاعب مقفل بالفعل.',
    lockedEnemy: 'قفلت {name}! +1 نقطة (فريقه −1)', notJoined: 'لم تنضم بعد.',
    pickTeam: 'اختر فريقاً.', pin4: 'يجب أن يتكون الرقم من 4 أرقام.', wrongTeam: 'هذا الرقم لا يخص {team}.',
    pinUsed: 'هذا الرقم مستخدم بالفعل.', minutesRange: 'يجب أن تكون الدقائق بين 0.05 و 240.',
    kickedReset: 'قام المشرف بإعادة ضبط اللعبة.', kickedRemoved: 'قام المشرف بإزالتك من اللعبة.',
    camStart: 'شغّل الكاميرا', camInsecure: 'الكاميرا تحتاج الرابط الآمن (https) للعبة.', coin_gold: 'ذهبية', coin_silver: 'فضية', coin_bronze: 'برونزية', coinGot: 'عملة {tier}! +{pts} نقاط 🪙 {n}', coinAgain: 'أنت جمعت هذه العملة للتو — اذهب إلى عملة أخرى! (مرة أخرى بعد {s} ث)', bomb_0: 'القنبلة السوداء', bomb_1: 'الديناميت', bomb_2: 'القنبلة الزرقاء', bomb_3: 'اللغم الأخضر',
    bombArmed: '💣 فعّلت {bomb} ضد الفريق الآخر! (-{cost} 🪙)', bombNeedCoins: 'العملات لا تكفي: هذه القنبلة تحتاج {need} 🪙 وفريقك لديه {have}.',
    bombCooling: 'هذه القنبلة تبرد ({s} ث).', bombNoTarget: 'لا يوجد لاعبون في الفريق الآخر.', bombYours: 'فريقك فعّل هذه القنبلة بالفعل.',
    bombAlready: 'كتبت هذا الكود من قبل ({n}/{need}). يجب أن يكتبه زميل آخر أيضاً!', bombProgress: 'جارٍ تفكيك {bomb}… {n}/{need} لاعبين', bombDefused: '✅ تم تفكيك {bomb}! +{pts} نقاط',
    bombAlarm: '🚨 {bomb} ضدكم — فكّكوها!', bombBoom: '💥 قُتل {n} من {of} منكم', bombBoomUs: '💥 قتلتم {n} من {of}',
    bombFailed: '❌ الفريق الآخر فكّك {bomb} الخاصة بكم', bombDefuseTxt: 'اكتبوا كودها ({n}/{need})', bombOursTxt: 'تنفجر خلال', bombTagOurs: 'أنتم زرعتموها', bombTagThem: 'ضدكم', bombInfo: '💣 تفعيل قنبلة: {cost} 🪙 · يكفي زميل واحد لتفكيكها',
    helpTitle: 'طريقة اللعب', helpClose: 'إغلاق',
    help1: '🔒 اكتب رقم لاعب من الفريق الآخر (4 أرقام) لتقفله (+1 نقطة لك و−1 لفريقه). واكتب رقم زميل مقفول لتحرّره مبكراً (+1 نقطة).',
    help2: '⚠️ الخصم المقفول بالفعل لا يمكن قفله مرة أخرى (لا يحدث شيء ولا عقوبة). ولا يمكنك كتابة نفس الرقم مرتين متتاليتين، وكتابة رقمك أنت لا تفعل شيئاً.',
    help3: '🔴 عندما تُقفل تتحول شاشتك للأحمر وتخرج لثوانٍ — أرِ زميلاً رقمك ليحرّرك أسرع. لكل لاعب عدد محدود من مرات الرجوع في الجولة (❤️ على شاشتك يوضح المتبقي). وإذا انتهت تخرج حتى الجولة التالية.',
    help4: '🪙 العملات مخبأة على أوراق مطبوعة، ولكل عملة رقم من 4 أرقام. اكتبه مثل رقم اللاعب: الذهبية +5 نقاط والفضية +3 والبرونزية +1. لا تأخذ نفس العملة مرة أخرى إلا بعد مدتها (الذهبية 30 ث والفضية 20 ث والبرونزية 10 ث).',
    help5: '🪙 العملات التي يجمعها فريقك هي رصيده للقنابل: الذهبية تساوي 5 عملات والفضية 3.',
    help6: '💣 القنابل مخبأة أيضاً (4 صور مختلفة ولكل واحدة رقم). اكتب رقم قنبلة لتفعّلها ضد الفريق الآخر — تكلّف عملات (تظهر على شاشتك) وتنفجر بعد {s} ث فتقفل بعض لاعبيهم.',
    help7: '🚨 لو فُعّلت قنبلة ضد فريقك يظهر إنذار أحمر بصورتها: اركضوا للبحث عنها واكتبوا رقمها. يكفي أن يكتبه زميل واحد قبل انتهاء الوقت لتفكيكها (+3 نقاط).',
    help8: '📝 الرسائل تحت خانات الأرقام تخبرك بما حدث للتو.',
    help9: '💔 قُتلت: خصم كتب رقمك أو قنبلة أصابت فريقك. ليس عطلاً.',
    help10: '💚 أُحييت: تعود وحدك عند انتهاء العداد، أو أبكر إذا كتب زميل رقمك.',
    help11: '💀 خرجت: لا رجوع متبقٍ. انتظر الجولة التالية.',
    help12: '💣 أخضر = أنتم زرعتموها (انتظروا). أحمر = زُرعت ضدكم (فكّكوها!).',
    'title.simulator': 'لوك باك – المحاكي', simBtn: '🎮 المحاكي', simStart: 'ابدأ', simEnd: 'إنهاء', simPhones: 'هواتف لكل فريق', simBots: '+5 بوتات لكل فريق', simClear: 'إزالة البوتات', simAuto: 'جولة تالية تلقائياً', simPilot: 'الهواتف تلعب', simSpeed: 'السرعة', simMin: 'دقيقة',
    lockKilled: 'قُتلت — اعرض رقمك لزميلك ليحييك أو انتظر الإحياء التلقائي', bombMiniOurs: 'لنا', bombMiniThem: 'فكّكوها {n}/{need}',
    bombSecLbl: 'وقت انفجار القنبلة (ثوانٍ)',
   
    helpCapKill: 'قُتلت', helpCapOut: 'خرجت',
    lockWhyOut: '💀 انتهت قلوبك',
   
    livesLeft: 'مرات الرجوع المتبقية: {n}', outTitle: '💀 خرجت من اللعبة', outHint: 'خارج هذه الجولة — ستعود في الجولة التالية', youOut: '💀 انتهت مرات الرجوع: خرجت من هذه الجولة', mateOut: 'هذا الزميل خرج من هذه الجولة.',
    lifeSettings: 'القفل والرجوع', maxReturnsLbl: 'مرات الرجوع لكل لاعب (في الجولة)', respawnLbl: 'وقت الرجوع (ثوانٍ)', apply: 'تطبيق',
    lifeHint: 'اللاعب المقفول يعود بعد وقت الرجوع، حتى عدد مرات الرجوع؛ وبعدها يخرج حتى نهاية الجولة. صفر = أول قفل يُخرج اللاعب من الجولة.',
    unlimitedLbl: 'رجوع غير محدود (اللاعب المقفول ينتظر وقت الرجوع فقط)',
    help3u: '🔴 عندما تُقفل تتحول شاشتك للأحمر وتخرج لثوانٍ — أرِ زميلاً رقمك ليحرّرك أسرع. ستعود دائماً بعد وقت الرجوع: لا يوجد حد لمرات الرجوع في هذه اللعبة.',
    gameOver: 'انتهت اللعبة',
    bombsLbl: 'وضع القنابل', bombsOff: 'القنابل مغلقة في هذه اللعبة.',
    youBack: '❤️ عدتَ إلى اللعبة!',
    rulesTitle: 'قواعد اللعبة', rulesHint: 'التغييرات تُطبَّق فوراً.', bombsHint: 'يمكن للاعبين تفعيل القنابل وتفكيكها',
    testBoard: 'شاشة التجربة', testBoardBtn: '🧪 شاشة التجربة', testBoardHint: 'اللاعبون المنضمّون والعملات والقنابل. اضغط أي رقم لنسخه.', testBoardPlayers: 'أرقام اللاعبين', testBoardCoins: 'العملات', testBoardBombs: 'القنابل', backAdmin: 'العودة للوحة المشرف', copied: 'تم نسخ {code}',
    'title.testboard': 'لوك باك – شاشة التجربة',
    scrBombArmed: '💣 {by} فعّل {bomb} ضد {target}!', scrBombDefused: '✅ {target} فكّك {bomb}!', scrBombBoom: '💥 انفجرت {bomb}! تم قفل {n} من {target}', scrCoinTaken: '{team} +{pts}',
    coinInvalid: 'هذا ليس رقم عملة.',
    camErr: 'تعذّر فتح الكاميرا. اسمح للمتصفح باستخدامها.', camHttps: 'الكاميرا تحتاج رابطاً آمناً. اضغط لفتحه (اقبل تحذير المتصفح مرة واحدة).', camHttpsBtn: 'افتح الصفحة الآمنة', coinTitle: 'العملات',
    printCoins: 'طباعة العملات', testTools: 'أدوات الاختبار', 
    connecting: 'جارٍ الاتصال…', disconnected: 'غير متصل', offMsg: 'انقطع الاتصال بالسيرفر', startServer: 'تشغيل السيرفر',
    startingServer: 'جارٍ تشغيل السيرفر…', serverStarting: 'السيرفر يعمل الآن — جارٍ إعادة الاتصال…',
    launcherDown: 'برنامج التشغيل غير مفعّل. شغّل "npm start" على جهاز السيرفر.',
    start1: 'ابدأ دقيقة', start2: 'دقيقتان', start3: '3 دقائق', customTitle: 'دقائق مخصصة', startCustom: 'ابدأ بمدة مخصصة',
    endRound: 'إنهاء الجولة', resetGame: 'إعادة ضبط اللعبة',
    confirmEnd: 'إنهاء الجولة الحالية الآن؟', confirmReset: 'إعادة ضبط النقاط والجولات وإزالة جميع اللاعبين؟',
    stLobby: 'الردهة — في انتظار البدء', stStarting: 'الجولة {n} — تبدأ الآن…', stRunning: 'الجولة {n} — جارية',
    stFinished: 'انتهت الجولة {n} — في انتظار الجولة التالية',
    youLocked: '⚔️ قتلك خصم', youBombed: '💣 قتلتك قنبلة', youRevivedTimer: '💚 أُحييت!', youRevivedMate: '💚 أحياك زميل',
    roundDone: 'انتهت الجولة {n}', upNext: 'الجولة {n} هي التالية', startsInShort: 'الجولة {n} تبدأ خلال {s}…', you: 'أنت', lockedTitle: 'أنت مقفل', adminLink: 'رابط المشرف', adminLinkTitle: 'رابط المشرف لجهاز آخر', adminLinkHint: 'أي شخص يفتح هذا الرابط يستطيع التحكم في الألعاب. شاركه فقط مع من تثق بهم. «إعادة تعيين المفتاح» توقف عمل كل الروابط القديمة.', resetKey: 'إعادة تعيين المفتاح', keyIsReset: 'تمت إعادة التعيين ✓', scrGo: 'انطلق!', scrWins: '{team} يفوز!', scrDraw: 'تعادل!', scrSound: 'الصوت', bigScreen: 'الشاشة الكبيرة', bigGames: 'الألعاب', sizeLbl: 'الحجم', sizeNormal: 'عادي', sizeLarge: 'كبير', sizeXL: 'كبير جداً', freeOnly: 'المتاح فقط', freeNum: 'متاح', showNumbers: 'عرض الأرقام', numbersPick: 'اختر رقماً متاحاً من فريقك', numTaken: 'مستخدم', fullscreen: 'ملء الشاشة', playersWord: 'لاعب', numbersTitle: 'الأرقام — {on} متصل، {off} غير متصل', copyList: 'نسخ القائمة', cancelStart: 'إلغاء البدء', masterTitle: 'التحكم في كل الألعاب', timeLabel: 'وقت الجولة (دقيقة)', q1: 'دقيقة', q2: 'دقيقتان', q3: '3 دقائق', q5: '5 دقائق', startAll: 'ابدأ الألعاب المحددة', endAll: 'إنهاء الكل', startGame: 'ابدأ الجولة', endGame: 'إنهاء / إلغاء', fullBoard: 'اللوحة الكاملة', confirmEndAll: 'إنهاء الجولة في كل الألعاب الآن؟', 'title.master': 'لوك باك – التحكم', game: 'اللعبة {n}', hubTitle: 'لوك باك — الألعاب', hubSub: 'اختر لعبة للعب أو للإدارة', hubSubJoin: 'اختر اللعبة التي دُعيت إليها', hubSubAdmin: 'اختر لعبة لإدارتها', hubWaiting: 'في انتظار البدء', hubPlayers: '{n} لاعبين ({c} متصل)', hubJoin: 'انضم كلاعب', hubAdmin: 'لوحة المشرف', allGames: 'كل الألعاب', 'title.hub': 'لوك باك', 'title.scoreboard': 'لوك باك', winsWord: 'فوز', winsBarTitle: 'الجولات الفائزة (حتى إعادة الضبط)', lockedNow: 'مقفلون الآن', activity: 'النشاط', evLock: '{by} قفل {target}', evFree: '{by} حرر {target}', evSelf: '{by} تم قفله لأنه أدخل رقم {target} المقفل', noActivity: 'لا توجد أقفال بعد', botsLabel: 'بوتات الاختبار', botCount: 'عدد البوتات', addBots: 'إضافة إلى {team}', removeBots: 'إزالة البوتات', botsPlay: 'البوتات تلعب أثناء الجولات', roundWins: 'الجولات الفائزة', resultTitle: 'نتيجة الجولة {n}', teamWon: 'فاز {team} بالجولة', draw: 'انتهت الجولة بالتعادل', youWon: 'فاز فريقك! 🎉', youLost: 'خسر فريقك هذه الجولة', youDraw: 'تعادل — لا يوجد فائز', testRepeat: 'وضع الاختبار: السماح بتكرار نفس الرقم مرتين متتاليتين', online: 'متصل', offline: 'غير متصل', onlineN: '{n} متصل', offlineN: '{n} غير متصل', lockedShort: 'مقفل', share: 'مشاركة / QR', shareTitle: 'دعوة اللاعبين', shareHint: 'اللاعبون على نفس شبكة الواي فاي يمسحون الرمز أو يفتحون الرابط', copy: 'نسخ الرابط', copied: 'تم النسخ ✓', open: 'فتح', shareVia: 'مشاركة…', close: 'إغلاق', noNetwork: 'لا يوجد اتصال بالشبكة — لا يمكن للاعبين على أجهزة أخرى الانضمام.', showTeammate: 'أظهر هذا الرقم لزميلك ليحررك',
    noPlayers: 'لا يوجد لاعبون بعد', bigScreen: 'الشاشة الكبيرة', 'title.screen': 'لوك باك – الشاشة', scrLive: 'مباشر', scrWaiting: 'في انتظار الجولة القادمة', scrGetReady: 'استعدوا!', scrWinner: 'فاز {team}!', scrLockedWord: 'مقفل', scrNoLocks: 'ستظهر عمليات القفل هنا', numbersSummary: 'أرقام {team} ({n}/50 مستخدم)',
    blocked: 'هذه اللعبة مغلقة أمام اللاعبين حالياً.', kickedBlocked: 'قام المشرف بإغلاق اللعبة أمام اللاعبين.',
    blockPlayers: 'حظر اللاعبين', allowPlayers: 'السماح للاعبين', playersBlocked: 'اللاعبون محظورون',
    confirmBlock: 'إزالة جميع اللاعبين ومنع أي شخص من الانضمام؟',
    resetAskTitle: 'إعادة ضبط اللعبة', resetAskBody: 'هل تريد منع المستخدمين من استخدام السيرفر؟', resetAndBlock: 'إعادة الضبط وحظر المستخدمين', resetOnly: 'إعادة الضبط فقط (يمكنهم الانضمام مجدداً)', cancel: 'إلغاء',
    hideNames: 'إخفاء الأسماء', showNames: 'إظهار الأسماء',
    showNumsOnScreen: 'عرض الأرقام على الشاشة الكبيرة', hideNumsOnScreen: 'إخفاء الأرقام عن الشاشة الكبيرة',
    removePlayer: 'إزالة اللاعب', confirmKick: 'إزالة هذا اللاعب؟', promptPoints: 'النقاط المراد إضافتها (سالب للخصم):',
  },
};

const LangStore = {
  get() { try { return localStorage.getItem('lb_lang'); } catch { return null; } },
  set(v) { try { localStorage.setItem('lb_lang', v); } catch {} },
};
let LANG = LangStore.get() || 'ar'; // Arabic unless the person already picked English with the language button
if (!I18N[LANG]) LANG = 'en';

function t(key, params) {
  let s = I18N[LANG][key] ?? I18N.en[key] ?? key;
  if (params) for (const k in params) s = s.replace(`{${k}}`, params[k]);
  return s;
}
const teamName = (team) => t('team' + team);
const playerName = (name, pin) => name || `${t('player')} ${pin}`;

function applyLang() {
  document.documentElement.lang = LANG;
  document.documentElement.dir = LANG === 'ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-i18n]').forEach((el) => (el.textContent = t(el.dataset.i18n)));
  document.querySelectorAll('[data-i18n-ph]').forEach((el) => (el.placeholder = t(el.dataset.i18nPh)));
  document.querySelectorAll('[data-i18n-title]').forEach((el) => (el.title = t(el.dataset.i18nTitle)));
  const page = document.body.dataset.page;
  if (page) document.title = t('title.' + page);
  const btn = document.getElementById('langBtn');
  if (btn) btn.textContent = LANG === 'ar' ? 'English' : 'العربية';
}

function setLang(l) {
  LANG = l;
  LangStore.set(l);
  applyLang();
  if (typeof window.onLangChange === 'function') window.onLangChange();
}

document.addEventListener('DOMContentLoaded', () => {
  applyLang();
  const btn = document.getElementById('langBtn');
  if (btn) btn.onclick = () => setLang(LANG === 'ar' ? 'en' : 'ar');
});
