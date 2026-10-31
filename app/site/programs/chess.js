// CISAB Chess instructions and controls; shared navigation remains generic.
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const key = text => `<kbd>${escape(text)}</kbd>`;
const code = text => `<code>${escape(text)}</code>`;
export const art = {src:new URL('../../assets/chess-board.svg',import.meta.url).href, alt:'CISAB Chess on a TRS-80 screen: a board of letters and the prompt WHAT WAS THEIR FOOLISH MOVE'};
export const aboutOpen = true;
export const restartConfirm = () => 'Restart CISAB? The game in progress is lost.';
export const restartLabel = modern => modern ? 'New game' : 'Restart';
const isModern = version => version.implementation === 'rust';

// Corrections in the edition the site runs (programs/chess/corrected/).
const fixes = [
  'Line 1300: CISAB’s pawns now promote to a queen on your back row. The test looked at the square the pawn moved to, so they never did; they stayed pawns, illegal in chess, and the next turn stopped the program with ?FC Error in 335.',
  'Line 335: CISAB’s pawns now step two squares only from their starting row. They could from any row, even off the board.',
  'Lines 110-111: your pawns now promote to a queen on row 8. The move was erased before the test.',
  'Line 14: move lists hold 300 entries, not 120. Rooks, bishops and queens list some squares two or three times, so busy positions overflowed and stopped the program with ?BS Error in 3015 or 3500.',
  'Line 210: GOTO 2000, not GOSUB. The GOSUB never returned, so every searched move left a frame on BASIC’s stack.',
  'Lines 9500-9540: each opening move needs its own piece at home and a clear path; when none fits, CISAB thinks. It used to move whatever stood on those squares, through pieces, and stopped with ?RG Error in 10020 when they were all empty.',
  'Spelling: COLUMN for COLUMB and COULMB; I for i in I CAN’T MOVE and I WON.'
];
// From reading the v14 source; VERIFICATION.md records what was run.
const quirks = [
  'There is no check or checkmate detection; the game ends when a king is captured.',
  'CHECKMATE.....I WON! can never print: line 1330 tests R, which by then is a loop counter, not a score. If CISAB takes your king, it just asks for your next move.',
    'Line 1075 looks for CLEAR (\\ on your keyboard) between trial moves, to stop the look-ahead. Holding it during CISAB’s second move made no difference in my tests.',
  'Line 12100 is never reached.'
];

const steps = [
  ['v01–v02', 'COMPUTER CHESS: moves for every piece, and a computer that takes the most valuable piece it can. v01 only plays itself; v02 asks SHOULD I PLAY MYSELF.'],
  ['v03–v04', 'The tournament player: WHAT COLOR ARE WE, WHAT WAS THEIR … MOVE, CHEAT and OK?.'],
  ['v05–v07', 'The C I S A B title, ADD, the squares the other side attacks, piece values, and pawns’ two-square first move.'],
  ['v08–v13', 'Look-ahead: it tries its best moves and checks the replies. Test positions with only a few pieces, and the byline BY CARL MYERS KADIE.'],
  ['v14', 'A four-move opening and IQ. Both players on this site run this version.']
];

// The Rust version on the mouse board.
function modernInstructions(history, list) {
  const play = `<section><h2>Play against the 1979 program on a modern board.</h2><ol><li>You play White. To play Black, press <strong>Play Black</strong> beside the board; CISAB then opens with its knight.</li><li>Click one of your pieces (or drag it). Dots show where it can go; click the square.</li><li>CISAB answers after a moment. Its moves come from a Rust port of the BASIC program: the same move generator, scores, shuffle and look-ahead, with the TRS-80’s random numbers and rounding, so it plays the same moves the original would.</li></ol><p>You can make every legal move, including castling, en passant and promotion to any piece. CISAB never checked its own moves, so the board checks them. An illegal move disqualifies it, most often leaving its king in check (it has no idea of check). So does a BASIC error that would have stopped the original. You win either way. The Level II BASIC tab runs the original, which plays on after illegal moves.</p></section>`;
  const original = `<section><h2>What the board does for you</h2><ul class="tips"><li>The 1979 program had no board of its own to check you: an operator typed each move as ${code('ROW,COLUMN,NEW ROW,NEW COLUMN')} and confirmed it with ${code('OK')}. The site types those lines for you; the list shows them beside each move.</li><li>Castling, en passant and promotion are typed as the original asks: your king’s move, then ${code('ADD')} to put the rook, empty a square or change the pawn.</li><li>Unchecking <strong>CISAB’s opening</strong> answers your next move with ${code('IQ')}, which ends the four-move opening, so CISAB starts thinking at once.</li><li>The <strong>TRS-80 transcript</strong> shows the prompts and answers as they would appear on the TRS-80 screen. Its random adjective (FOOLISH, DROLL…) is the one the original would pick.</li></ul></section>`;
  const ends = `<section class="program-differences"><h2>How games end</h2><ul class="tips"><li><strong>You checkmate CISAB:</strong> it can’t tell. Every move it can find loses its king, and lines 1010–1220 repeat forever. The board calls it checkmate.</li><li><strong>CISAB makes an illegal move:</strong> it is disqualified. The move list marks the move.</li><li><strong>The program would stop with an error:</strong> CISAB is disqualified. The fixes below removed the errors seen in testing; the Rust version would stop at the same move with the same message.</li><li><strong>CISAB checkmates you:</strong> it wins, though it never noticed. A stalemate on either side is a draw.</li></ul></section>`;
  return `${history}<div class="instruction-grid">${play}${original}</div>${ends}${list}`;
}

export function instructions(version) {
  const history = `<section class="program-history"><h2>CISAB: chess in BASIC, spelled backwards</h2><p>I wrote CISAB in TRS-80 Level II BASIC and competed with it in a tournament in Peoria, my high-school hometown. It is built for that: it asks what color “we” are and then “what was their foolish move” (the adjective changes every turn). Someone at the keyboard types in the opponent’s moves and plays CISAB’s replies on the real board.</p><p>I also had Sargon, Dan and Kathe Spracklen’s chess program for the TRS-80. For a mediocre player like me, who played only with family and friends, it was great: it taught me to stop overlooking my own dumb moves, and I got much better against my friends. CISAB asks the same question Sargon made me ask: after this move, what can they take?</p><p>Fourteen versions survive on three cassette sides, in what looks like the order I wrote them. Each listing is the one before with changes. ${steps.map(([v, text]) => `<strong>${escape(v)}</strong>: ${escape(text)}`).join(' ')}</p><p class="small"><em>No save is dated. The order comes from save order on each tape and from the changes; see the versions under Source.</em></p></section>`;
  const play = `<section><h2>You are “them”. CISAB is “we”.</h2><p>Its pieces are always at the bottom of the screen, yours at the top.</p><h3>Your first minute</h3><ol><li>Click the screen so it gets your keys.</li><li>At ${code('WHAT COLOR ARE WE?')} press <strong>WHITE</strong> (CISAB moves first) or <strong>BLACK</strong> (you move first), or type it and ${key('Enter')}.</li><li>As White, CISAB moves its knight from row 8, column 2 to row 6, column 3. At ${code('WHAT WAS THEIR … MOVE')} type ${code('2,5,4,5')} and ${key('Enter')} to push your king’s pawn two squares.</li><li>At ${code('OK?')} press <strong>OK</strong>. CISAB answers.</li></ol><p>Its first four moves are an opening and take a few seconds. After that it thinks. On a real TRS-80 that took 1–7 minutes a move in my tests. <strong>Fast (×20)</strong>, the site’s starting speed, brings most moves down to seconds; <strong>1979 speed</strong> is the real machine’s pace.</p></section>`;
  const board = `<section><h2>Reading the board and typing moves</h2><p>A move is four numbers: ${code('ROW,COLUMN,NEW ROW,NEW COLUMN')}, then ${key('Enter')}. Rows are numbered 1–8 from the top of the screen, columns 1–8 from the left.</p><ul class="tips"><li>${code('K')} king, ${code('Q')} queen, ${code('B')} bishop, ${code('N')} knight, ${code('R')} rook, ${code('P')} pawn; ${code('-')} is an empty square.</li><li>A small block after a letter marks a <strong>White</strong> piece: CISAB’s when it is White, yours when it is Black.</li><li>When CISAB is Black, the kings and queens swap columns: the board is seen from Black’s side.</li><li>CISAB checks only that you move from a square holding one of your pieces (otherwise ${code('**** CHEAT *****')}). The rest of your move is up to you.</li></ul></section>`;
  const ok = `<section><h2>Answers at OK?</h2><dl><div><dt>${code('OK')}</dt><dd>Makes your move; CISAB replies.</dd></div><div><dt>${key('Enter')} or anything else</dt><dd>Forgets the move and asks for it again, for typos.</dd></div><div><dt>${code('ADD')}</dt><dd>Makes your move, then asks ${code('GIVE R,C,V')}: a row, a column and what to put there. ${code('1')} king, ${code('2')} queen, ${code('3')} bishop, ${code('4')} knight, ${code('5')} rook, ${code('6')} pawn; positive for yours, negative for CISAB’s (“WE ARE NEG.”), ${code('0')} to empty it. Then ${code('OK?')} comes back, so you can ${code('ADD')} again. Use it to castle (move the king, then add the rook on its new square and ${code('0')} on its old one), for en passant, and to promote a pawn to something other than a queen.</dd></div><div><dt>${code('IQ')}</dt><dd>Makes your move and turns off CISAB’s opening, so it starts thinking at once.</dd></div></dl><p>Capture CISAB’s king and it prints ${code('DARN THEY BEAT YOU!')}. Restart for a new game.</p></section>`;
  const how = `<section><h2>How CISAB chooses</h2><ul class="tips"><li>It lists every move for its pieces. Bishops, rooks and queens step out along angles computed with COS and SIN.</li><li>It marks every square you attack, by flipping the board and generating your moves.</li><li>Each move scores the piece it takes divided by the piece it puts on an attacked square (king 100, queen 9, rook 5, bishop and knight 3, pawn 1). Leaving its most valuable threatened piece where it is scores lower.</li><li>It tries its best-scoring moves on the board, one at a time, and looks at what you could take in reply. A move that loses its king scores worst.</li></ul></section>`;
  const list = `<section class="program-differences"><h2>Fixed for this site</h2><p class="small">Both players run v14 with these changes, made at my request in 2026. Each keeps what the 1979 program meant to do. The recovered bytes are under Source, and corrected/changes.json lists every change.</p><ul class="tips">${fixes.map(q => `<li>${escape(q)}</li>`).join('')}</ul><h2>Quirks kept from the original</h2><p class="small">From reading the source; VERIFICATION.md records what was run.</p><ul class="tips">${quirks.map(q => `<li>${escape(q)}</li>`).join('')}</ul></section>`;
  if (isModern(version)) return modernInstructions(history, `<div class="instruction-grid">${how}</div>${list}`);
  return `${history}<div class="instruction-grid">${play}${board}${ok}${how}</div>${list}`;
}

// Moves and ADD squares are typed with INPUT: numbers and commas, then Enter.
export const onScreenKeys = version => isModern(version) ? [] : [
  {label:'Move', keys:[...'12345678'].map(k=>[k,'']).concat([[',',''],['Enter','Enter']])},
  {label:'ADD value', keys:[['-','Neg.'],['0','Empty']]}
];
export const quickHelp = version => isModern(version) ? 'Click or drag your pieces.' : 'Click the screen first so it gets your keys. Type a move as row,column,new row,new column (rows 1–8 from the top, columns 1–8 from the left) and press Enter, then OK.';

// Word buttons type a whole answer and Enter; the speed buttons pace the emulated TRS-80.
export function decoratePlayer(instance, {dock, modern}) {
  if (modern) return;
  const display = () => document.querySelector('#display').focus({preventScroll:true});
  const group = document.createElement('div');
  group.className = 'key-group';
  group.innerHTML = '<span class="key-group-label">Answer</span><div></div>';
  for (const word of ['WHITE', 'BLACK', 'OK', 'ADD', 'IQ']) {
    const button = document.createElement('button');
    button.className = 'word-key';
    button.innerHTML = `<kbd>${word}</kbd><span>Enter</span>`;
    button.setAttribute('aria-label', `Type ${word} and Enter`);
    button.onclick = () => { instance.type(`${word}\n`); display(); };
    group.lastChild.append(button);
  }
  dock.querySelector('.quick-controls').prepend(group);

  // CISAB thinks for minutes at the real pace, so the site starts fast. Speed survives Restart.
  const speeds = document.createElement('div');
  speeds.className = 'speed-toggle';
  speeds.setAttribute('role', 'group');
  speeds.setAttribute('aria-label', 'Emulator speed');
  speeds.innerHTML = `<button type="button" data-speed="1" aria-pressed="false">1979 speed</button><button type="button" data-speed="20" aria-pressed="true">Fast (×20)</button>`;
  const choose = b => {
    instance.setSpeed(Number(b.dataset.speed));
    for (const other of speeds.querySelectorAll('button')) other.setAttribute('aria-pressed', String(other === b));
  };
  for (const b of speeds.querySelectorAll('button')) b.onclick = () => { choose(b); display(); };
  choose(speeds.querySelector('[data-speed="20"]'));
  dock.querySelector('.essential-controls').after(speeds);
}
