// Alien instructions and controls; shared navigation remains generic.
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const key = text => `<kbd>${escape(text)}</kbd>`;
const code = text => `<code>${escape(text)}</code>`;
const cite = (href, text) => `<a class="cite" href="${href}" target="_blank" rel="noopener">${text}</a>`;
const expanded = version => version.id === 'v02';
export const art = {src:new URL('../../assets/alien-vents.svg',import.meta.url).href, alt:'Alien on a TRS-80 screen: I SMELL AN ALIEN, YOUR ARE IN JUCTION 1, VENTS LEAD TO 10 17 18'};
export const aboutOpen = true;

export function instructions(version) {
  const history = `<section class="program-history"><h2>Probably 1979: Hunt the Wumpus, on board the Nostromo</h2><p>The game is not my idea. It is <em>Hunt the Wumpus</em>, which Gregory Yob wrote in 1973. It was published in <em>Creative Computing</em> in 1975, and Wumpus 1 and Wumpus 2 both appear in David Ahl’s <em>More BASIC Computer Games</em> (1979). ${cite('https://en.wikipedia.org/wiki/Hunt_the_Wumpus', 'Wikipedia: Hunt the Wumpus')}</p><p>I typed in Yob’s BASIC program and re-themed it after Ridley Scott’s film <em>Alien</em>. The cave became the air vents of a spaceship, the Wumpus an alien, bottomless pits vacuum chambers, super bats a failing ship’s computer, and crooked arrows poison gas. My listing keeps his map of 20 rooms on a dodecahedron, his line numbers and much of his wording; one comment still says ${code('2 WAMPUS')}, pits and bats.</p><p>In the expanded version I added my own ideas: a block-graphics title with the film’s tagline, a backstory, junction numbers shuffled every game, and a new move, closing a junction, so you can trap the alien instead of gassing it.</p><p class="small"><em>The date is an estimate. No date appears in the program; the tagline is from the film’s 1979 publicity, and a program on the same tape side is dated 11 January 1979.</em></p></section>`;
  const play = `<section><h2>Find the alien before it finds you.</h2><p>Twenty vent junctions each lead to three others. Each turn, move through one vent, spray poison gas${expanded(version) ? ', or close a junction' : ''}. You have five sprays.</p><h3>Your first minute</h3><ol><li>Click the screen so it gets your keys.${expanded(version) ? ` The title draws itself; press any key to skip it.` : ''}</li><li>At ${code(expanded(version) ? 'DO YOU NEED BACKGROUND INFORMATION?' : 'DO YOU NEED INSTRUCTIONS?')} type ${code('NO')} and ${key('Enter')}. Any other answer shows the instructions; press any key to turn each page.</li><li>${expanded(version) ? 'Wait about 20 seconds while it shows PLEASE WAIT A MOMENT.' : 'Wait a few seconds while the program sets up.'}</li><li>Read the warnings and ${code('VENTS LEAD TO')}. Type ${code('M')}, ${key('Enter')}, then one of those junction numbers and ${key('Enter')}.</li></ol></section>`;
  const commands = `<section><h2>Commands</h2><dl><div><dt>${code('M')}</dt><dd>Move: then type a junction number from VENTS LEAD TO.</dd></div><div><dt>${code('S')}</dt><dd>Spray gas: type how many junctions (1–5), then each junction number along its path. Where no vent leads that way, the gas wanders at random, and it can get you.</dd></div>${expanded(version) ? `<div><dt>${code('C')}</dt><dd>Close the junction you are in. You can still leave, but neither you nor the alien can enter it again. Trap the alien to win; trap yourself and you lose.</dd></div>` : ''}</dl><h3>Warnings, one junction away</h3><ul class="tips"><li>${code('I SMELL AN ALIEN')}: the alien</li><li>${code('I FEEL A DRAFT')}: a vacuum chamber; entering it sucks you into space</li><li>${code('BOOBIE-TRAPPED JUCTION NEAR')}: a computer failure; entering it sends you to a random junction</li></ul><p>After each game, ${code('SAME SET-UP?')} ${code('YES')} replays the same positions; any other answer sets up new ones. Restart reruns the program from the start.</p></section>`;
  const quirks = `<section><h2>This version</h2><p>${escape(version.note)}</p>${expanded(version) ? `<p>The original’s quirks are kept. The background text promises one chance to flee the alien, but walking into it kills you. Closed junctions stay closed in later games until you press Restart. After a missed spray, the program checks the alien against the room where the gas stopped, not your junction, and a close right after that closes that room. Spelling is the original’s.</p>` : `<p>This first version is mostly Yob’s game with new words. It drops his check that stops a gas path doubling back.</p>`}</section>`;
  return `${history}<div class="instruction-grid">${play}${commands}${quirks}</div>`;
}

// Prompts use INPUT, so letters and numbers are typed and then sent with Enter.
export const onScreenKeys = () => [
  {label:'Command', keys:[['m','Move'],['s','Spray'],['c','Close'],['Enter','Enter']]},
  {label:'Junction', keys:[...'1234567890'].map(k=>[k,''])},
  {label:'Pages', keys:[[' ','Any key']]}
];
export const quickHelp = () => 'Click the screen first so it gets your keys. Type each answer and press Enter: M, S or C for a command, then junction numbers. Type YES or NO at the yes/no questions.';

// YES and NO type the whole answer and Enter, as on the original keyboard.
export function decoratePlayer(instance, {dock}) {
  const group = document.createElement('div');
  group.className = 'key-group';
  group.innerHTML = '<span class="key-group-label">Answer</span><div></div>';
  for (const word of ['YES', 'NO']) {
    const button = document.createElement('button');
    button.className = 'word-key';
    button.innerHTML = `<kbd>${word}</kbd><span>Enter</span>`;
    button.setAttribute('aria-label', `Type ${word} and Enter`);
    button.onclick = () => { instance.type(`${word}\n`); document.querySelector('#display').focus({preventScroll:true}); };
    group.lastChild.append(button);
  }
  dock.querySelector('.quick-controls').append(group);
}
