// Chemical Equation Balancer instructions and controls; shared navigation remains generic.
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const key = text => `<kbd>${escape(text)}</kbd>`;
const code = text => `<code>${escape(text)}</code>`;
const isModern = version => version.implementation === 'rust';
const isII = version => version.family?.startsWith('Chemistry Balancer II');

export const tagline = 'Type an unbalanced chemical equation; the program finds the whole-number coefficients.';
export const art = {src:new URL('../../assets/balancer-equation.svg',import.meta.url).href, alt:'A balanced equation on a TRS-80 screen: (C3.H8) + 5(O2) -^ 3(C.O2) + 4(H2.O)'};
export const actionVerb = 'Run';
export const aboutOpen = true;
export const modernSummary = 'The 1981 algorithm, ported to Rust and running instantly in your browser.';
export const restartLabel = modern => modern ? 'Clear' : 'Restart';

export const quickStart = version => isModern(version)
  ? ['Choose a problem in the side panel, or type your own equation.', `Write elements with periods: ${code('C3.H8 + O2 = C.O2 + H2.O')}.`, 'Open “The linear equations” to see the algebra behind the answer.']
  : ['Click the screen so it gets your keys.', `Type ${code('C3.H8 + O2 = C.O2 + H2.O')} and press Enter.`,
     isII(version) ? 'Wait for the answer (up to a few minutes), then type Y and Enter for another.' : 'Read the answer; the program asks for the next equation.'];
export const launchHint = version => isModern(version)
  ? 'Problems in the side panel fill in an equation and balance it.'
  : 'Click the screen after launch, then type an equation and press Enter.';

export function instructions(version) {
  const history = `<section class="program-history"><h2>1979 and 1981. It was linear algebra all along.</h2><p>I wrote two generations of this program in TRS-80 BASIC. The 1979 Chemical Equation Balancer writes one equation per element and solves them with floating-point elimination, then rescales until the coefficients are whole numbers. Chemistry Balancer II (1981) is a rewrite: it does exact arithmetic with fractions and reports when an equation has only a negative solution or more than one independent answer.</p><p>I worked the method out on my own, and I resented it a bit when I later realized that what I had figured out was “just” solving a system of linear equations. Each element gives one equation, each compound one unknown, and a balanced equation is a positive solution in the null space of that matrix.</p><p>Radio Shack sold Chemistry Balancer II in its catalog.</p><p class="small">Dates come from the copyright remarks in the source.</p></section>`;
  const entry = `<section><h2>Enter an equation.</h2><ul class="tips"><li>Separate the elements in a compound with periods: ${code('H2.O')}, ${code('NA.CL')}, ${code('K.MN.O4')}. Two letters together are one element, so ${code('CO')} is cobalt and ${code('C.O')} is carbon monoxide.</li><li>Separate compounds with ${code('+')} and the two sides with ${code('=')}. Leave out coefficients.</li><li>Group with parentheses: ${code('CA(O.H)2')}. Write charge with ${code('@')}: ${code('FE@3')}, ${code('S.O4@-2')}.</li></ul><h3>Try these</h3><ul class="tips"><li>${code('FE + O2 = FE2.O3')}</li><li>${code('C12.H22.O11 = C + H2.O')}</li><li>${code('K.MN.O4 + H.CL = K.CL + MN.CL2 + H2.O + CL2')}</li><li>${code('H2 = O2')} — cannot be balanced</li></ul></section>`;
  const thisVersion = isModern(version)
    ? `<section><h2>This version</h2><p>A Rust port of the Chemistry Balancer II algorithm (v20), compiled to WebAssembly. It follows the same steps and error checks: alchemy, ambiguous and negative solutions, independent sub-equations. It answers instantly and shows the result in modern notation, in the 1981 printout style, and as the system of linear equations it solves.</p></section>`
    : isII(version)
    ? `<section><h2>This version</h2><p>${escape(version.note)}</p><p>Chemistry Balancer II works exactly with fractions, so it is slow on 1980 hardware: about 20 seconds for water and up to three minutes for larger equations. The spinner at the top right shows it is working. The answer uses ${code('-^')} as the arrow and ${code('< >')} for parentheses. Type ${key('Y')} and ${key('Enter')} to balance another.</p></section>`
    : `<section><h2>This version</h2><p>${escape(version.note)}</p><p>The 1979 program answers quickly and then asks for the next equation. If it stops with ${code('Break')} or an error, press Restart.</p></section>`;
  return `${history}<div class="instruction-grid">${entry}${thisVersion}</div>`;
}

export const onScreenKeys = version => isModern(version) ? []
  : [{label:'Answer', keys:[['Enter','Enter'], ...(isII(version) ? [['y','Yes'], ['n','No']] : [])]}];
export const quickHelp = () => 'Click the screen first so it gets your keys, then type the equation on your keyboard.';
