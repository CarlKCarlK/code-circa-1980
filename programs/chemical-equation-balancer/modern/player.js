// Browser version: the Rust port of the 1981 algorithm, compiled to WebAssembly.
// Follows the shared player contract used by Castles (see app/site/main.js).
import init, {balance_json} from '../rust/pkg/chemistry_balancer.js';

const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// Problems for the side panel: [label, equation].
export const problems = [
  {group:'Starters', items:[['Water','H2 + O2 = H2.O'],['Rust','FE + O2 = FE2.O3'],['Ammonia','N2 + H2 = N.H3']]},
  {group:'Combustion', items:[['Propane','C3.H8 + O2 = C.O2 + H2.O'],['Methane','C.H4 + O2 = C.O2 + H2.O'],['Glucose','C6.H12.O6 + O2 = C.O2 + H2.O']]},
  {group:'Harder', items:[['Permanganate','K.MN.O4 + H.CL = K.CL + MN.CL2 + H2.O + CL2'],['Copper in nitric acid','CU + H.N.O3 = CU(N.O3)2 + N.O + H2.O'],['Borax','NA2.B4.O7 + H2.O + H2.S.O4 = NA2.S.O4 + H3.B.O3'],['Phosphate','CA(O.H)2 + H3.P.O4 = CA3(P.O4)2 + H2.O']]},
  {group:'Ions (@ is charge)', items:[['Iron and permanganate','MN.O4@-1 + FE@2 + H@ = MN@2 + FE@3 + H2.O']]},
  {group:'Cannot be balanced', items:[['Alchemy','H2 = O2'],['Ambiguous','H2 + O2 = H2.O + H2.O2'],['Wrong side','H2.O + H2 = H2.O2']]},
];
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
  host.setAttribute('aria-label', `${title}. Type an equation or choose a problem.`);
  const problemList = document.createElement('section');
  problemList.className = 'balancer-problems';
  problemList.innerHTML = `<h3>Problems</h3>${problems.map(p => `<details ${p.group === 'Starters' || p.group === 'Harder' ? 'open' : ''}><summary>${escape(p.group)}</summary><div>${p.items.map(([label, eq]) => `<button type="button" data-equation="${escape(eq)}">${escape(label)}</button>`).join('')}</div></details>`).join('')}<p class="small">A problem fills in the equation. Press Balance to solve it, or edit it first.</p>`;
  dock.append(problemList);

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
  problemList.onclick = event => {
    const button = event.target.closest('button[data-equation]');
    if (button && !paused) { choose(button.dataset.equation); input.focus({preventScroll:true}); }
  };
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
