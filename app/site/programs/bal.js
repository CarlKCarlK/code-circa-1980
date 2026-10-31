// Chemical Equation Balancer instructions and controls; shared navigation remains generic.
import {problems, problemPanel} from '../../../programs/bal/problems.js';
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const key = text => `<kbd>${escape(text)}</kbd>`;
const code = text => `<code>${escape(text)}</code>`;
const isModern = version => version.implementation === 'rust';
const isII = version => version.family?.startsWith('Chemistry Balancer II');

// Catalog scans in programs/bal/history/ (address and phone redacted). Each opens at full size.
const scans = {
  'sourcebook-volume-iv-cover.png': new URL('../../../programs/bal/history/sourcebook-volume-iv-cover.png', import.meta.url).href,
  'catalog-chemistry-equation-balancer.png': new URL('../../../programs/bal/history/catalog-chemistry-equation-balancer.png', import.meta.url).href,
  'catalog-chembalancer-ii.png': new URL('../../../programs/bal/history/catalog-chembalancer-ii.png', import.meta.url).href,
};
const figure = (name, width, height, alt, caption, kind) => `<figure class="catalog-${kind}"><a href="${scans[name]}" target="_blank" rel="noopener"><img src="${scans[name]}" width="${width}" height="${height}" alt="${escape(alt)}" loading="lazy" decoding="async"></a><figcaption>${caption}</figcaption></figure>`;
const sourcebook = 'https://www.trs-80.org/trs-80-applications-software-sourcebook.html';
const cite = (href, text) => `<a class="cite" href="${href}" target="_blank" rel="noopener">${text}</a>`;
const volumeOneListing = figure('catalog-chemistry-equation-balancer.png', 687, 110, 'Catalog listing for Chemistry Equation Balancer, $19.95 on cassette', 'Chemistry Equation Balancer in the 1980 Radio Shack Applications Software Sourcebook, Volume I. Listed at $19.95 on cassette.', 'listing');
const volumeFourListing = figure('catalog-chembalancer-ii.png', 665, 107, 'Catalog listing for Chembalancer II, $39.95 on cassette', 'Chembalancer II in the 1982 Radio Shack Applications Software Sourcebook, Volume IV. Listed at $39.95 on cassette.', 'listing');
const volumeFourCover = figure('sourcebook-volume-iv-cover.png', 781, 1012, 'Cover of the Radio Shack TRS-80 Applications Software Sourcebook, Volume IV', 'Cover of Radio Shack’s <em>TRS-80 Applications Software Sourcebook</em>, Volume IV (1982).', 'cover');
export const art = {src:new URL('../../assets/balancer-equation.svg',import.meta.url).href, alt:'A balanced equation on a TRS-80 screen: (C3.H8) + 5(O2) -^ 3(C.O2) + 4(H2.O)'};
export const actionVerb = 'Run';
export const aboutOpen = true;
export const restartLabel = modern => modern ? 'Clear' : 'Restart';


export function instructions(version) {
  const history = `<section class="program-history"><h2>1979 and 1981: It Was Linear Algebra All Along</h2><p>In middle school and high school, we were taught to balance chemical equations by trial and error. Change the coefficients, count the atoms on each side, and keep trying until everything balances. Remarkably, this approach, also called balancing by inspection, is still taught today. ${cite('https://openstax.org/books/chemistry-2e/pages/4-1-writing-and-balancing-chemical-equations', 'OpenStax Chemistry')}</p><p>A little later, but still in high school, my math teacher, Ms. Canty, taught us about systems of linear equations. For example:</p><p><strong>Problem:</strong> Find two numbers, <var>x</var> and <var>y</var>, that satisfy both equations:</p><div class="equation-system" role="math" aria-label="2x plus y equals 7; x minus y equals 2"><span>2<var>x</var> + <var>y</var></span><span>=</span><span>7</span><span><var>x</var> − <var>y</var></span><span>=</span><span>2</span></div><p>She also taught us Gaussian elimination, a general algorithm for solving systems like these.</p><p>I realized that balancing chemical equations was fundamentally the same as solving a system of linear equations. Each chemical element gives one linear equation, and each compound contributes one unknown coefficient.</p><p>The realization pissed me off. First, our science teachers graded us on how well we guessed. That was the injury. Second, they never showed us the systematic approach. That was the insult.</p><p>In 1979, I wrote <em>Chemistry Equation Balancer</em> in TRS-80 BASIC. The program translated chemical equations into systems of linear equations, solved them using floating-point Gaussian elimination, and rescaled the answers to whole-number coefficients.</p><p>The next year, I paid $10 to advertise the program in Volume I of Radio Shack’s <em>TRS-80 Applications Software Sourcebook</em>. Radio Shack published these catalogs to help independent programmers sell software directly to customers. ${cite(sourcebook, 'Volume I (1980)')}</p>${volumeOneListing}<p>In 1981, now in college, I developed <em>Chembalancer II</em>, a substantial rewrite that replaced floating-point arithmetic with exact fractions. It could recognize equations without a positive solution or with multiple independent solutions. It also handled ionic equations, conserving electrical charge as well as atoms.</p><p>I advertised the new version in Volume IV of the <em>Sourcebook</em>, published in 1982. The listing promised to balance chemical equations “WITHOUT TRIAL &amp; ERROR,” including large equations and oxidation-reduction reactions. The cassette version cost $39.95 (roughly $150 in 2026 dollars) and came with 14 pages of documentation. ${cite(sourcebook, 'Volume IV (1982)')}</p>${volumeFourListing}${volumeFourCover}<p>I sold only a few copies, but that was real money to me at the time.</p><p>For a modern explanation of the mathematics, see Wikipedia’s discussion of balancing chemical equations using systems of linear equations. ${cite('https://en.wikipedia.org/wiki/Chemical_equation#System_of_linear_equations', 'Wikipedia: Chemical equation')}</p><p class="small"><em>The 1979 and 1981 dates come from copyright remarks in the recovered source code.</em></p></section>`;
  const entry = `<section><h2>Enter an equation.</h2><ul class="tips"><li>Separate the elements in a compound with periods: ${code('H2.O')}, ${code('NA.CL')}, ${code('K.MN.O4')}. Two letters together are one element, so ${code('CO')} is cobalt and ${code('C.O')} is carbon monoxide.</li><li>Separate compounds with ${code('+')} and the two sides with ${code('=')}. Leave out coefficients.</li><li>Group with parentheses: ${code('CA(O.H)2')}. Write charge with ${code('@')}: ${code('FE@3')}, ${code('S.O4@-2')}.</li></ul><h3>Try these</h3><ul class="tips"><li>${code('FE + O2 = FE2.O3')}</li><li>${code('C12.H22.O11 = C + H2.O')}</li><li>${code('K.MN.O4 + H.CL = K.CL + MN.CL2 + H2.O + CL2')}</li><li>${code('H2 = O2')} — cannot be balanced</li></ul></section>`;
  const thisVersion = isModern(version)
    ? `<section><h2>This version</h2><p>A Rust port of the Chemistry Balancer II algorithm (v20), compiled to WebAssembly. It follows the same steps and error checks: alchemy, ambiguous and negative solutions, independent sub-equations. Press Balance for an instant answer, shown first in the 1981 printout style, then in modern notation, and as the system of linear equations it solves.</p></section>`
    : isII(version)
    ? `<section><h2>This version</h2><p>${escape(version.note)}</p><p>Chemistry Balancer II works exactly with fractions, so it is slow on 1980 hardware: about 20 seconds for water and up to three minutes for larger equations. The spinner at the top right shows it is working. The answer uses ${code('-^')} as the arrow and ${code('< >')} for parentheses. Type ${key('Y')} and ${key('Enter')} to balance another.</p></section>`
    : `<section><h2>This version</h2><p>${escape(version.note)}</p><p>The 1979 program answers quickly and then asks for the next equation. If it stops with ${code('Break')} or an error, press Restart.</p></section>`;
  return `${history}<div class="instruction-grid">${entry}${thisVersion}</div>`;
}

export const onScreenKeys = version => isModern(version) ? []
  : [{label:'Answer', keys:[['Enter','Enter'], ...(isII(version) ? [['y','Yes'], ['n','No']] : [])]}];
export const quickHelp = () => 'Click the screen first so it gets your keys, then type the equation on your keyboard.';

// The Level II BASIC player gets the same problems; a click types the equation
// at the INPUT prompt, and Enter submits it, as on the original keyboard.
export function decoratePlayer(instance, {dock, version, modern, status}) {
  if (modern) return;
  // Charges (@) and spaces arrived with Chemistry Balancer II.
  const groups = isII(version) ? problems : problems.filter(p => !p.group.startsWith('Ions'))
    .map(p => ({...p, items: p.items.map(([label, eq]) => [label, eq.replaceAll(' ', '')])}));
  const host = document.querySelector('#display');
  dock.append(problemPanel(text => {
    instance.type(text);
    host.focus({preventScroll:true});
    status.textContent = 'Typed at the prompt · press Enter to balance';
  }, {groups, note: isII(version) ? 'A problem types the equation at the prompt; press Enter. After an answer, type Y and Enter first. You can also paste.' : 'A problem types the equation at the prompt; press Enter. You can also paste.'}));
}
