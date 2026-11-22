// Big-screen effect for a collected coin: the coin drops onto the team's card spinning, lands with a shock ring and
// sparks, "+5" and "Gold coin!" pop up, and the card glows. Used by the game screen and the all-games scoreboard.
//   coinFx(cardElement, { tier: 'gold'|'silver'|'bronze', pts: 5 })
(function () {
  const COLORS = { gold: ['#fff3a3', '#fbbf24', '#f59e0b'], silver: ['#ffffff', '#cbd5e1', '#94a3b8'], bronze: ['#ffd0a0', '#e08a45', '#b4642a'] };
  const st = document.createElement('style');
  st.textContent = `.cfx { position:fixed; z-index:60; pointer-events:none; left:0; top:0; }
    .cfxCoin { border-radius:50%; background-size:cover; background-position:center; filter:drop-shadow(0 .8vh 1.4vh rgba(0,0,0,.55)); }
    .cfxRing { border-radius:50%; border:.7vh solid var(--c); }
    .cfxDot { border-radius:50%; background:var(--c); box-shadow:0 0 1.4vh var(--c); }
    .cfxTxt { text-align:center; white-space:nowrap; font-weight:900; text-shadow:0 .3vh 1.2vh rgba(0,0,0,.8); }
    .cfxTxt b { display:block; font-size:clamp(2.4rem, 11vh, 8rem); line-height:1; color:var(--c); }
    .cfxTxt span { display:inline-block; margin-top:.6vh; padding:.3vh 1.6vh; border-radius:99px; background:rgba(0,0,0,.55); color:#fff; font-size:clamp(1rem, 3.4vh, 2.4rem); }`;
  document.head.appendChild(st);

  const word = (tier) => (typeof t === 'function' ? (LANG === 'ar' ? t('coin_' + tier).replace(/^/, 'عملة ') + '!' : t('coin_' + tier) + ' coin!') : tier);
  let active = 0;

  window.coinFx = function (card, e) {
    if (!card || active >= 6 || !COLORS[e.tier]) return;
    active++;
    const [c1, c2, c3] = COLORS[e.tier], gold = e.tier === 'gold';
    const r = card.getBoundingClientRect();
    const size = Math.max(80, Math.min(r.width * 0.32, r.height * 0.5, 280)) * (gold ? 1.35 : e.tier === 'silver' ? 1.15 : 1);
    const cx = r.left + r.width / 2 + (Math.random() - .5) * r.width * 0.16, cy = r.top + r.height * 0.42;
    const make = (cls, css) => { const d = document.createElement('div'); d.className = 'cfx ' + cls; Object.assign(d.style, { '--c': c2 }, css); document.body.appendChild(d); return d; };
    const kill = (...els) => els.forEach((x) => x.remove());

    // the coin: drops in spinning, lands with a bounce, holds, then swells and fades
    const coin = make('cfxCoin', { width: size + 'px', height: size + 'px', left: cx - size / 2 + 'px', top: cy - size / 2 + 'px', backgroundImage: `url(/coins/${e.tier}.png)`, perspective: '800px', opacity: 0 });
    const total = gold ? 2800 : 2300;
    coin.animate([
      { transform: `translateY(${-(cy + size)}px) rotateY(0deg) scale(.5)`, opacity: 0 },
      { transform: 'translateY(0) rotateY(540deg) scale(1.18)', opacity: 1, offset: .34, easing: 'ease-out' },
      { transform: 'translateY(.6vh) rotateY(720deg) scale(.94)', opacity: 1, offset: .44 },
      { transform: 'translateY(0) rotateY(720deg) scale(1.06)', opacity: 1, offset: .52 },
      { transform: 'translateY(0) rotateY(720deg) scale(1)', opacity: 1, offset: .78 },
      { transform: 'translateY(-2vh) rotateY(720deg) scale(1.5)', opacity: 0 },
    ], { duration: total, easing: 'cubic-bezier(.3,.7,.4,1)' }).onfinish = () => { kill(coin); active--; };

    const landAt = total * .36;
    setTimeout(() => {
      // shock rings + sparks at the landing point
      for (let k = 0; k < (gold ? 3 : 1); k++) {
        const ring = make('cfxRing', { width: size + 'px', height: size + 'px', left: cx - size / 2 + 'px', top: cy - size / 2 + 'px', opacity: 0 });
        ring.animate([{ transform: 'scale(.7)', opacity: .9 }, { transform: `scale(${gold ? 2.8 : 2})`, opacity: 0 }],
          { duration: 800 + k * 220, delay: k * 140, easing: 'ease-out', fill: 'backwards' }).onfinish = () => kill(ring);
      }
      const n = gold ? 36 : e.tier === 'silver' ? 24 : 16;
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2 + Math.random() * .3, d = size * (.7 + Math.random() * (gold ? 1.3 : .8)), s = Math.max(6, size * (.05 + Math.random() * .05));
        const dot = make('cfxDot', { width: s + 'px', height: s + 'px', left: cx - s / 2 + 'px', top: cy - s / 2 + 'px', '--c': [c1, c2, c3][k % 3] });
        dot.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: `translate(${Math.cos(a) * d}px, ${Math.sin(a) * d + size * .25}px) scale(.1)`, opacity: 0 }],
          { duration: 900 + Math.random() * 500, easing: 'cubic-bezier(.1,.7,.4,1)' }).onfinish = () => kill(dot);
      }
      // "+5" and the coin's name
      const txt = make('cfxTxt', { left: cx + 'px', top: cy + size * .55 + 'px', opacity: 0 });
      txt.innerHTML = `<b>+${e.pts}</b><span>${word(e.tier)}</span>`;
      txt.animate([
        { transform: 'translate(-50%, 0) scale(.4)', opacity: 0 },
        { transform: 'translate(-50%, 0) scale(1.15)', opacity: 1, offset: .25 },
        { transform: 'translate(-50%, 0) scale(1)', opacity: 1, offset: .7 },
        { transform: 'translate(-50%, -4vh) scale(1)', opacity: 0 },
      ], { duration: total * .62, easing: 'ease-out' }).onfinish = () => kill(txt);
      // the team card glows
      card.animate([{ boxShadow: `0 0 0 0 ${c2}` }, { boxShadow: `0 0 7vh 1.6vh ${c2}`, offset: .25 }, { boxShadow: `0 0 0 0 transparent` }], { duration: 1300 });
    }, landAt);
  };
})();
