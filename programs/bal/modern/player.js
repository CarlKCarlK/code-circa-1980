// Browser version: the Rust port of the 1981 algorithm, compiled to WebAssembly.
// Follows the shared player contract used by Castles (see app/site/main.js).
import init, {balance_json} from '../rust/pkg/chemistry_balancer.js';
import {problemPanel} from '../problems.js';

const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const letters = 'abcdefghijklmnopqrstuvwxyz';
// The entry box starts with a real equation, ready for Balance.
export const startingEquation = 'C3.H8 + O2 = C.O2 + H2.O';

export async function createPlayer(host, _url, status, title) {
  await init();
  const panel = document.createElement('div');
  panel.className = 'balancer';
  panel.innerHTML = `<form class="balancer-form"><label for="equation">Unbalanced equation</label><div class="balancer-entry"><input id="equation" name="equation" autocomplete="off" spellcheck="false" value="${escape(startingEquation)}"><button type="submit">Balance</button></div><p class="small">Separate elements with periods (<code>H2.O</code>), compounds with +, sides with =. Parentheses group atoms; @ marks charge.</p></form><div class="balancer-result" aria-live="polite"></div>`;
  const dock = document.getElementById('control-dock');
  host.replaceChildren(panel);
  host.append(dock);
  // One column: the problems sit under the entry and the controls form a slim bar,
  // so the About section below stays close to the first screen.
  host.classList.add('balancer-host');
  host.setAttribute('aria-label', `${title}. Type an equation or choose a problem.`);

  const form = panel.querySelector('form'), input = panel.querySelector('input'), output = panel.querySelector('.balancer-result');
  let last = null, paused = false;

  function show(result) {
    last = result;
    if (!result) { output.replaceChildren(); return; }
    if (!result.ok) {
      output.innerHTML = `<p class="balancer-error"><span class="trs80">FATAL ERROR: ${escape(result.error)}</span>${escape(result.explanation)}</p>`;
      return;
    }
    const names = result.compounds.map((_, i) => letters[i] ?? `x${i + 1}`);
    const equations = result.elements.map((element, e) => {
      const side = sign => result.matrix[e].map((n, c) => [n * sign, names[c]]).filter(([n]) => n > 0).map(([n, x]) => `${n === 1 ? '' : n}${x}`).join(' + ');
      return `<li><span>${escape(element === '@' ? 'charge' : element)}</span> ${side(1)} = ${side(-1)}</li>`;
    }).join('');
    output.innerHTML = `<p class="trs80" title="As the 1981 program printed it">${escape(result.trs80)}</p><p class="balanced">${escape(result.pretty)}</p>${result.mixed ? '<p class="small">This equation splits into independent parts, each balanced separately (the 1981 program warned “MIXED EQUATIONS”).</p>' : ''}<details class="balancer-math"><summary>The linear equations</summary><p>One unknown per compound, one equation per element:</p><ul>${equations}</ul><p>Solution: (${names.join(', ')}) = (${result.coefficients.join(', ')})</p></details>`;
  }
  function balance(text) {
    input.value = text;
    show(text.trim() ? JSON.parse(balance_json(text)) : null);
    status.textContent = last ? (last.ok ? 'Balanced by the Rust engine' : 'Cannot be balanced') : 'Type an equation';
  }
  form.onsubmit = event => { event.preventDefault(); if (!paused) balance(input.value); };
  // A problem only fills in the equation; Balance solves it.
  function choose(text) {
    input.value = text;
    show(null);
    status.textContent = 'Press Balance to solve it';
  }
  const problemList = problemPanel(text => { if (!paused) { choose(text); input.focus({preventScroll:true}); } },
    {compact:true});
  form.after(problemList);
  status.textContent = 'Rust engine ready · press Balance, edit the equation, or choose a problem';
  input.focus({preventScroll:true});

  return {
    pausable: false,
    press() {}, release() {},
    restart() { choose(''); status.textContent = 'Type an equation'; input.focus({preventScroll:true}); },
    togglePause() { paused = !paused; host.dispatchEvent(new CustomEvent('playerpause', {detail:paused})); },
    hasWork() { return false; },
    get paused() { return paused; },
    loadStartingPattern() {},
    balance, choose,
    snapshot() { return {input: input.value, result: last}; },
    diagnostics() { return {paused, input: input.value, ok: last?.ok ?? null}; },
    dispose() { problemList.remove(); },
  };
}
