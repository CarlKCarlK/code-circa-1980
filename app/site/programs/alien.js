// Alien instructions and controls; shared navigation remains generic.
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const key = text => `<kbd>${escape(text)}</kbd>`;
const code = text => `<code>${escape(text)}</code>`;
const cite = (href, text) => `<a class="cite" href="${href}" target="_blank" rel="noopener">${text}</a>`;
// Photos in programs/alien/history/ (resized, metadata removed). Each opens at full size.
const photos = {
  'more-basic-computer-games-cover.jpg': new URL('../../../programs/alien/history/more-basic-computer-games-cover.jpg', import.meta.url).href,
  'wumpus-listing-page-180.jpg': new URL('../../../programs/alien/history/wumpus-listing-page-180.jpg', import.meta.url).href,
};
const figure = (name, width, height, alt, caption, kind) => `<figure class="catalog-${kind}"><a href="${photos[name]}" target="_blank" rel="noopener"><img src="${photos[name]}" width="${width}" height="${height}" alt="${escape(alt)}" loading="lazy" decoding="async"></a><figcaption>${caption}</figcaption></figure>`;
const bookCover = figure('more-basic-computer-games-cover.jpg', 780, 1036, 'Cover of More BASIC Computer Games, edited by David H. Ahl, $7.95', 'My copy of <em>More BASIC Computer Games</em> (1979): 84 games for $7.95.', 'cover');
const bookListing = figure('wumpus-listing-page-180.jpg', 1400, 1860, 'Page 180 of More BASIC Computer Games: the end of the Hunt the Wumpus listing', 'Page 180: the last page of the Wumpus 1 listing, printed straight from a computer printout.', 'page');
export const art = {src:new URL('../../assets/alien-vents.svg',import.meta.url).href, alt:'Alien on a TRS-80 screen: I SMELL AN ALIEN, YOU ARE IN JUNCTION 1, VENTS LEAD TO 10 17 18'};
export const aboutOpen = true;
export const restartConfirm = () => 'Restart the program?';

// Every difference from Yob's published Hunt the Wumpus, shown at the bottom of About.
const differences = [
  ['Play', [
    'New action: close the junction you are in. Every vent into it is cut; your own exits stay open. You, the alien and the gas can no longer enter it.',
    'Win by trapping the alien (all three of its exits closed). Lose if all of your exits are closed.',
    'Each close gives the alien a turn to move.',
    'Junction numbers are shuffled once per run; the map’s shape is unchanged.',
    'Walking into the alien is always fatal. In Hunt the Wumpus the Wumpus wakes and moves away 3 times in 4.',
    'The alien may move at the start of every game (3 times in 8).',
    'Gas wanders only through open vents; gas in a room with no open vent gets you.',
    'Closed junctions and the junction numbering carry over to later games, even new set-ups, until Restart.',
    'No check against gas paths that double back (Yob: “ARROWS AREN’T THAT CROOKED”).',
    'After a missed spray, the alien’s move is checked against the room where the gas stopped instead of your room (Yob reset this). The alien can kill you from elsewhere, or move into your junction harmlessly until you walk into it. A close right after a miss closes the gas’s last room.',
    'Entering your own junction at WHERE TO asks again; Yob lets you stay put.',
    'SAME SET-UP needs YES (Yob: Y); any answer except NO shows the background (Yob: except N).',
    'The program never uses RANDOM, so every start replays the same worlds.']],
  ['Where the instructions and code disagree', [
    '“One chance to flee” the alien: walking into it kills you at once.',
    'The alien “often moves”: only at the start of a game, after a missed spray and after a close.',
    'Computer failure “switches the junction’s numbers”: it moves you to a random junction, like Yob’s super bats.',
    'If the alien’s starting move lands on you, the game prints the slime message and then carries on.',
    '“THE ALIEN IS TRAPPED. YOU HAVE WON!” can print more than once.',
    'The original spells ALEIN, JUCTION, VACUM, BOOBIE-TRAPPED, YOUR ARE, TO LATE and more. This site runs Alien with the printed spelling corrected; the recovered files are unchanged.']],
  ['Unchanged', [
    'The 20-room dodecahedron, two pits (vacuum chambers), two bats (computer failures), warnings one room away, five shots, paths of 1–5 rooms that wander at random where no tunnel leads, and being able to shoot yourself.']]
];

// Describes Alien as played on this site (v02); the earlier save is listed under Source.
export function instructions() {
  const history = `<section class="program-history"><h2>Probably 1979: Hunt the Wumpus, reskinned and remixed</h2><p>Alien is my reskinning and remixing of <em>Hunt the Wumpus</em>, which Gregory Yob wrote in 1973. It was published in <em>Creative Computing</em> in 1975, and Wumpus 1 and Wumpus 2 both appear in David Ahl’s <em>More BASIC Computer Games</em> (1979). I started from Yob’s BASIC program: his map of 20 rooms on a dodecahedron, his line numbers and much of his wording. ${cite('https://en.wikipedia.org/wiki/Hunt_the_Wumpus', 'Wikipedia: Hunt the Wumpus')}</p>${bookCover}<p>Back then, the usual way to get someone else’s program was to type it in. Books and magazines printed complete listings: <em>More BASIC Computer Games</em> gave each game’s listing and a sample run. Programs were short, so a game like Hunt the Wumpus fit on about two pages, and paper was much cheaper than the only alternative, a program on cassette. A year later, Radio Shack’s catalog sold my own Chemistry Equation Balancer for $19.95, one program on one cassette.</p>${bookListing}<p>Typing a listing in was a pain. It was slow, and every typo had to be found before the program would run. But by the time it ran, you had read every line. You knew where the map was kept and how the Wumpus decided when to move, and the program felt like yours to change. Alien is what I changed it into.</p><p>The remix changes how it plays. You can <strong>close junctions</strong>, so nothing can enter them again, and you win by trapping the alien instead of only gassing it. The junction numbers are <strong>shuffled</strong> each run, so there is no map to memorize. Walking into the alien is <strong>always fatal</strong>, and the alien gets a move each time you close a junction. Every difference is listed at the bottom.</p><p>The reskin comes from the 1979 film <em>Alien</em>: the cave became a ship’s air vents, pits vacuum chambers, bats a failing ship’s computer, and arrows poison gas. The game opens with the film’s tagline.</p><p class="small"><em>The date is an estimate. No date appears in the program; the tagline is from the film’s 1979 publicity, and a program on the same tape side is dated 11 January 1979.</em></p></section>`;
  const play = `<section><h2>Find the alien before it finds you.</h2><p>Twenty vent junctions each lead to three others. Each turn, move through one vent, spray poison gas, or close a junction. You have five sprays.</p><h3>Your first minute</h3><ol><li>Click the screen so it gets your keys. The title draws itself; press any key to skip it.</li><li>At ${code('DO YOU NEED BACKGROUND INFORMATION?')} type ${code('NO')} and ${key('Enter')}. Any other answer shows the background; press any key to turn each page.</li><li>Wait about 20 seconds while it shows PLEASE WAIT A MOMENT.</li><li>Read the warnings, ${code('YOU ARE IN JUNCTION')} and ${code('VENTS LEAD TO')}. Type ${code('M')}, ${key('Enter')}, then one of those vent numbers and ${key('Enter')}.</li></ol></section>`;
  const commands = `<section><h2>Commands</h2><dl><div><dt>${code('M')}</dt><dd>Move: then type a junction number from VENTS LEAD TO.</dd></div><div><dt>${code('S')}</dt><dd>Spray gas: type how many junctions (1–5), then the path one junction at a time. The gas starts in <strong>your</strong> junction, so the first number must be one of your vents, and each next number must connect to the one before. Where no vent leads that way, the gas goes down a random vent instead, and it can wander back and get you. A one-junction spray into a neighbouring vent is always safe.</dd></div><div><dt>${code('C')}</dt><dd>Close the junction you are in. You can still leave, but neither you, the alien nor the gas can enter it again. Close all three of the alien’s exits to win; close yourself in and you lose.</dd></div></dl><h3>Warnings, one junction away</h3><ul class="tips"><li>${code('I SMELL AN ALIEN')}: the alien</li><li>${code('I FEEL A DRAFT')}: a vacuum chamber; entering it sucks you into space</li><li>${code('BOOBY-TRAPPED JUNCTION NEAR')}: a computer failure; entering it prints ZAP! and drops you in a random junction. Check YOU ARE IN JUNCTION before you spray.</li></ul></section>`;
  const alien = `<section><h2>When the alien moves</h2><ul class="tips"><li>At the start of each game: half the time it tries a move (3 times in 8 overall).</li><li>After a spray that misses: 3 times in 4.</li><li>After you close a junction: 3 times in 4.</li></ul><p>It goes through one open vent at random, ignores the hazards and never enters a closed junction. It never moves when you move.</p></section>`;
  const worlds = `<section><h2>Is every game different?</h2><p>After a game, ${code('SAME SET-UP?')} ${code('YES')} puts you, the alien and the hazards back where that game started (the alien may make its starting move again; closed junctions stay closed). Any other answer places everyone at new junctions, with the same junction numbers.</p><p>Each run starts the same way, though: the program never seeds BASIC’s random numbers, so the TRS-80 repeats them after every start. Your first world depends only on whether you skip the title: watching it starts you in junction 18, skipping it in junction 9. Restart brings the same two back.</p><p class="small">This site runs Alien with its printed spelling corrected. It keeps the original’s quirks, listed below.</p></section>`;
  const list = `<section class="program-differences"><h2>All differences from Hunt the Wumpus</h2><p class="small">Compared line by line with Yob’s published listing. Most items come from reading the source; VERIFICATION.md records what was run.</p>${differences.map(([title, items]) => `<h3>${escape(title)}</h3><ul class="tips">${items.map(item => `<li>${escape(item)}</li>`).join('')}</ul>`).join('')}</section>`;
  return `${history}<div class="instruction-grid">${play}${commands}${alien}${worlds}</div>${list}`;
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
