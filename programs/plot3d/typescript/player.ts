// Browser version of 3-D Plot v03: the same drawing rules (engine.ts), with a formula
// box for line 200, the original's questions as sliders, and a choice of speed.
// Follows the shared player contract used by Castles (see app/site/main.js).
import {plot, standard, WIDTH, HEIGHT, type Settings, type Step} from './engine.ts';
import {BasicError} from './mbf.ts';
import {FormulaError} from './basic.ts';
import {formulas} from './formulas.js';

// Emulated seconds the original spends per grid point and per SET dot, fitted to
// the recorded emulator runs (parity-fixtures.json) to within about 6%.
export const POINT_SECONDS = 0.32, SET_SECONDS = 0.074;
const speeds = [{id: '1979', label: '1979 pace', factor: 1}, {id: 'fast', label: 'Fast', factor: 20}, {id: 'instant', label: 'Instant', factor: Infinity}];
const escape = (value: string) => value.replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]!));

export async function createPlayer(host: HTMLElement, _url: string, status: HTMLElement, title: string) {
  const background = '#1e4b8f', ink = '#e6e7fc';
  const canvas = document.createElement('canvas'); canvas.width = 532; canvas.height = 404;
  canvas.setAttribute('aria-label', `${title} drawing`);
  canvas.setAttribute('role', 'img');
  const wrapper = document.createElement('div'); wrapper.append(canvas); host.replaceChildren(wrapper);
  host.tabIndex = 0; host.setAttribute('role', 'group'); host.setAttribute('aria-label', `${title} TypeScript player`);
  const ctx = canvas.getContext('2d')!;
  const dock = document.getElementById('control-dock')!; host.append(dock);

  const panel = document.createElement('form');
  panel.className = 'plot3d-panel';
  // The original's questions as sliders; dragging one redraws instantly.
  const slider = (id: string, label: string, value: number, min: number, max: number, step: number) =>
    `<label>${label} <output for="plot3d-${id}">${value}</output><input id="plot3d-${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}"></label>`;
  panel.innerHTML = `<label>Surface <select id="plot3d-preset">${formulas.map((f, i) => `<option value="${i}">${escape(f.name)}</option>`).join('')}<option value="custom" hidden>Your formula</option></select></label>
    <label class="plot3d-formula">Line 200 <span class="small">(Y from X and Z, each −1 to 1; PI and E are ready)</span>
      <span class="plot3d-line"><span aria-hidden="true">200</span><input id="plot3d-formula" autocomplete="off" spellcheck="false" value="${escape(standard.formula)}"></span></label>
    <div class="plot3d-settings">${slider('tilt', 'Tilt', standard.tilt, 0, 2, 0.05)}${slider('xscale', 'X scale', standard.xScale, 0.25, 2, 0.05)}${slider('yscale', 'Y scale', standard.yScale, 0.25, 3, 0.05)}${slider('lines', 'Lines', standard.lines, 2, 25, 1)}</div>
    <div class="plot3d-speed" role="group" aria-label="Speed">${speeds.map(s => `<button type="button" data-speed="${s.id}" aria-pressed="${s.id === 'fast'}">${s.label}</button>`).join('')}</div>
    <button type="submit" class="launch">Draw</button>
    <p class="plot3d-message" role="status" aria-live="polite"></p>`;
  dock.querySelector('.essential-controls')!.after(panel);
  const $ = <T extends HTMLElement>(id: string) => panel.querySelector<T>(`#plot3d-${id}`)!;
  const formula = $<HTMLInputElement>('formula'), preset = $<HTMLSelectElement>('preset'), message = panel.querySelector<HTMLElement>('.plot3d-message')!;

  let speed = speeds[1], factor = speed.factor, steps: Generator<Step> | null = null, dots = new Uint8Array(WIDTH * HEIGHT);
  let paused = false, disposed = false, handle = 0, previous = 0, budget = 0, emulated = 0, error: string | null = null, done = false, result = '';

  function paint() {
    ctx.fillStyle = background; ctx.fillRect(0, 0, 532, 404); ctx.fillStyle = ink;
    for (let y = 0; y < HEIGHT; y++) for (let x = 0; x < WIDTH; x++) if (dots[y * WIDTH + x]) ctx.fillRect(10 + x * 4, 10 + y * 8, 4, 8);
  }
  function settings(): Settings {
    return {tilt: Number($<HTMLInputElement>('tilt').value), xScale: Number($<HTMLInputElement>('xscale').value),
      yScale: Number($<HTMLInputElement>('yscale').value), lines: Number($<HTMLInputElement>('lines').value), formula: formula.value};
  }
  const describe = (e: unknown) => e instanceof BasicError ? `${e.message} in 200` : e instanceof FormulaError ? e.message : String(e);
  function finish(text: string) {
    done = true; steps = null; result = text;
    status.textContent = text;
    canvas.setAttribute('aria-label', `${title} drawing: ${dots.reduce((n, d) => n + d, 0)} dots. ${text}`);
  }
  // Runs steps until this frame's share of emulated time is used up.
  function advance(seconds: number) {
    if (!steps) return;
    budget += seconds;
    try {
      while (budget > 0 || factor === Infinity) {
        const next = steps.next();
        if (next.done) { finish(`Done. The original takes about ${Math.round(emulated)} s for this picture.`); break; }
        const cost = next.value.kind === 'set' ? SET_SECONDS : POINT_SECONDS;
        if (next.value.kind === 'set') dots[next.value.y * WIDTH + next.value.x] = 1;
        budget -= cost; emulated += cost;
      }
    } catch (e) {
      error = describe(e); message.textContent = error; finish(`Stopped: ${error}`);
    }
    paint();
  }
  function frame(time: number) {
    handle = 0;
    if (paused || disposed || !steps) return;
    advance(previous ? Math.min(0.25, (time - previous) / 1000) * factor : 0);
    previous = time;
    if (steps) handle = requestAnimationFrame(frame);
  }
  // Draws at the chosen speed, or all at once when a slider moves.
  function draw(instant = false) {
    factor = instant ? Infinity : speed.factor;
    cancelAnimationFrame(handle); handle = 0;
    dots = new Uint8Array(WIDTH * HEIGHT); budget = 0; emulated = 0; error = null; done = false; previous = 0;
    message.textContent = '';
    try { steps = plot(settings()); steps.next(); }  // The first step compiles line 200 and reports syntax errors.
    catch (e) { steps = null; error = describe(e); message.textContent = error; finish(`Not drawn: ${error}`); paint(); return; }
    emulated = POINT_SECONDS;
    status.textContent = factor === Infinity ? 'Drawing' : `Drawing at ${speed.label.toLowerCase()}`;
    if (factor === Infinity) advance(0);
    else if (!paused) handle = requestAnimationFrame(frame);
    paint();
  }

  panel.onsubmit = event => { event.preventDefault(); draw(); };
  for (const input of panel.querySelectorAll<HTMLInputElement>('input[type=range]')) {
    input.oninput = () => { input.previousElementSibling!.textContent = input.value; draw(true); };
  }
  preset.onchange = () => { const f = formulas[Number(preset.value)]; if (f) { formula.value = f.line; draw(); } };
  formula.oninput = () => { const i = formulas.findIndex(f => f.line === formula.value.trim()); preset.value = i >= 0 ? String(i) : 'custom'; };
  for (const button of panel.querySelectorAll<HTMLButtonElement>('[data-speed]')) {
    button.onclick = () => {
      speed = speeds.find(s => s.id === button.dataset.speed)!; factor = speed.factor;
      for (const b of panel.querySelectorAll('[data-speed]')) b.setAttribute('aria-pressed', String(b === button));
      if (steps && factor === Infinity && !paused) advance(0);
    };
  }
  draw();

  return {
    press() {}, release() {},
    restart() { draw(); },
    togglePause() {
      paused = !paused; previous = 0;
      if (!paused && steps) { if (factor === Infinity) advance(0); else handle = requestAnimationFrame(frame); }
      status.textContent = paused ? 'Paused' : done ? result : 'Drawing';
      host.dispatchEvent(new CustomEvent('playerpause', {detail: paused}));
    },
    hasWork() { return false; },
    get paused() { return paused; },
    loadStartingPattern() {},
    snapshot() { return {dots: Array.from(dots), done, error, emulated, settings: settings()}; },
    diagnostics() { return {paused, done, error, speed: speed.id}; },
    dispose() { disposed = true; cancelAnimationFrame(handle); panel.remove(); },
  };
}
