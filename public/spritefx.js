// Sprite-sheet animations for the player's life: public/fx/<name>.png holds square frames side by side, left to right.
const FX_N = { lock: 4, out: 4 };
const FX_RING = { lock: '#fca5a5', out: '#e5e7eb' }; // ring colour of the plate behind each picture
// the plate is dark on purpose: red hearts and skulls vanish on the red "locked" screen without it
const FX_PLATE = 'radial-gradient(circle at 50% 35%, #334155, #0b1220 75%)';
const fxUrl = (name) => `/fx/${name}.png`;

// Plays a sheet once (or forever with loop) inside `el`, a square box; it stays on the last frame afterwards.
function fxPlay(el, name, { ms = 700, loop = false, onEnd } = {}) {
  const n = FX_N[name];
  const pos = (k) => `${k / (n - 1) * 100}% 0`;
  el.style.backgroundImage = `url(${fxUrl(name)})`;
  el.style.backgroundSize = `${n * 100}% 100%`;
  el.style.backgroundRepeat = 'no-repeat';
  el.style.backgroundPosition = pos(n - 1);
  if (!el.animate || matchMedia('(prefers-reduced-motion: reduce)').matches) { if (onEnd) setTimeout(onEnd, ms); return; }
  const frames = Array.from({ length: n }, (_, k) => ({ backgroundPosition: pos(k), offset: k / n, easing: 'steps(1, end)' }));
  frames.push({ backgroundPosition: pos(n - 1), offset: 1 });
  const a = el.animate(frames, { duration: ms, iterations: loop ? Infinity : 1, fill: 'forwards' });
  if (onEnd) a.onfinish = onEnd;
}

// A one-shot animation with a caption saying what happened: it plays, holds on the last frame for `hold` ms, then fades out.
// In the middle of the screen, or small at the bottom with `bottom` (so it does not cover what is on screen).
function fxBurst(name, { caption = '', ms = 450, hold = 450, bottom = false } = {}) {
  const ring = FX_RING[name];
  const box = document.createElement('div');
  const at = bottom ? 'bottom:2dvh;' : 'top:40%;';
  const move = bottom ? 'translate(-50%,0)' : 'translate(-50%,-50%)';
  box.style.cssText = `position:fixed;left:50%;${at}transform:${move};z-index:60;pointer-events:none;display:flex;flex-direction:column;align-items:center;gap:.5rem;width:min(86vw, 24rem);`;
  const plate = document.createElement('div');
  plate.style.cssText = `width:${bottom ? 'min(30vw, 15dvh)' : 'min(56vw, 30vh)'};aspect-ratio:1;border-radius:50%;background:${FX_PLATE};border:.4rem solid ${ring};box-shadow:0 0 2.2rem ${ring}, 0 0 0 .3rem rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;`;
  const pic = document.createElement('div');
  pic.style.cssText = 'width:82%;aspect-ratio:1;';
  plate.appendChild(pic); box.appendChild(plate);
  if (caption) {
    const cap = document.createElement('div');
    cap.textContent = caption;
    cap.style.cssText = `background:#0b1220;color:#fff;border:.2rem solid ${ring};border-radius:1rem;padding:.5rem 1rem;font-weight:800;font-size:1.1rem;line-height:1.35;text-align:center;`;
    box.appendChild(cap);
  }
  document.body.appendChild(box);
  const gone = () => box.remove();
  if (box.animate) box.animate([{ transform: move + ' scale(.6)', opacity: 0 }, { transform: move + ' scale(1)', opacity: 1 }], { duration: 150, easing: 'ease-out' });
  fxPlay(pic, name, { ms, onEnd: () => { if (box.animate) box.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: hold, fill: 'forwards' }).onfinish = gone; else setTimeout(gone, hold); } });
}

// A static picture of one frame of a sheet, for the help pop-up: the dark round plate and the frame (size it in the page's CSS).
const fxStill = (name, frame = FX_N[name] - 1) => `<span class="plate" style="--ring:${FX_RING[name]}"><i class="fxs" style="background-image:url(${fxUrl(name)});background-position:${frame / (FX_N[name] - 1) * 100}% 0"></i></span>`;
