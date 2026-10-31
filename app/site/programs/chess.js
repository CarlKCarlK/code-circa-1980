// CISAB Chess instructions and controls; shared navigation remains generic.
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const key = text => `<kbd>${escape(text)}</kbd>`;
const code = text => `<code>${escape(text)}</code>`;
export const art = {src:new URL('../../assets/chess-board.svg',import.meta.url).href, alt:'CISAB Chess on a TRS-80 screen: a board of letters and the prompt WHAT WAS THEIR FOOLISH MOVE'};
export const aboutOpen = true;
export const restartConfirm = () => 'Restart CISAB? The game in progress is lost.';
export const restartLabel = modern => modern ? 'New game' : 'Restart';
const isModern = version => version.implementation === 'rust';

// From reading the v14 source; VERIFICATION.md records what was run.
const quirks = [
  'COLUMB and COULMB for “column”.',
  'There is no check or checkmate detection; the game ends when a king is captured.',
  'CHECKMATE.....i WON! can never print: line 1330 tests R, which by then is a loop counter, not a score. If CISAB takes your king, it just asks for your next move.',
  'Your pawns are never promoted: line 110 clears the move’s row and column before its promotion check. CISAB’s check (line 1300) looks at the target square before its pawn moves there. Use ADD.',
  'Its opening moves check only that the piece is still on its starting square, not that the path is clear.',
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
  const play = `<section><h2>Play against the 1979 program on a modern board.</h2><ol><li>You play White. To play Black, press <strong>Play Black</strong> beside the board; CISAB then opens with its knight.</li><li>Click one of your pieces (or drag it). Dots show where it can go; click the square.</li><li>CISAB answers after a moment. Its moves come from a Rust port of the BASIC program: the same move generator, scores, shuffle and look-ahead, with the TRS-80’s random numbers and rounding, so it plays the same moves the original would.</li></ol><p>Your moves follow the rules of chess. CISAB’s don’t always: its opening jumps over pieces, and its pawns never promote. The move list marks those <strong>illegal</strong>. The game ends when a king is taken, or where the original program would stop.</p></section>`;
  const original = `<section><h2>What the board does for you</h2><ul class="tips"><li>The 1979 program had no board of its own to check you: an operator typed each move as ${code('ROW,COLUMN,NEW ROW,NEW COLUMN')} and confirmed it with ${code('OK')}. The site types those lines for you; the list shows them beside each move.</li><li>Castling, en passant and promotion are typed as the original asks: your king’s move, then ${code('ADD')} to put the rook, empty a square or change the pawn.</li><li>Unchecking <strong>CISAB’s opening</strong> answers your next move with ${code('IQ')}, which ends the four-move opening, so CISAB starts thinking at once.</li><li>The <strong>TRS-80 transcript</strong> shows the prompts and answers as they would appear on the TRS-80 screen. Its random adjective (FOOLISH, DROLL…) is the one the original would pick.</li></ul></section>`;
  const ends = `<section class="program-differences"><h2>How games end</h2><ul class="tips"><li><strong>You take its king:</strong> DARN THEY BEAT YOU!</li><li><strong>CISAB is checkmated:</strong> it cannot tell. Every move loses its king, and lines 1010–1220 repeat forever. The board says so instead of waiting.</li><li><strong>The original stops with an error.</strong> In busy positions CISAB lists more than 120 moves (its rooks, bishops and queens count some squares two or three times) and stops with ${code('?BS Error in 3015')} or ${code('3500')}. A pawn on your back row gives ${code('?FC Error in 335')}. The Rust version stops at the same move with the same message.</li><li><strong>You are checkmated:</strong> CISAB doesn’t notice; press New game.</li></ul></section>`;
  return `${history}<div class="instruction-grid">${play}${original}</div>${ends}${list}`;
}

export function instructions(version) {
  const history = `<section class="program-history"><h2>CISAB: chess in BASIC, spelled backwards</h2><p>I wrote CISAB in TRS-80 Level II BASIC and competed with it in a tournament in Peoria, my high-school hometown. It is built for that: it asks what color “we” are and then “what was their foolish move” (the adjective changes every turn). Someone at the keyboard types in the opponent’s moves and plays CISAB’s replies on the real board.</p><p>Fourteen versions survive on three cassette sides, in what looks like the order I wrote them. Each listing is the one before with changes. ${steps.map(([v, text]) => `<strong>${escape(v)}</strong>: ${escape(text)}`).join(' ')}</p><p class="small"><em>No save is dated. The order comes from save order on each tape and from the changes; see the versions under Source.</em></p></section>`;
  const play = `<section><h2>You are “them”. CISAB is “we”.</h2><p>Its pieces are always at the bottom of the screen, yours at the top.</p><h3>Your first minute</h3><ol><li>Click the screen so it gets your keys.</li><li>At ${code('WHAT COLOR ARE WE?')} press <strong>WHITE</strong> (CISAB moves first) or <strong>BLACK</strong> (you move first), or type it and ${key('Enter')}.</li><li>As White, CISAB moves its knight from row 8, column 2 to row 6, column 3. At ${code('WHAT WAS THEIR … MOVE')} type ${code('2,5,4,5')} and ${key('Enter')} to push your king’s pawn two squares.</li><li>At ${code('OK?')} press <strong>OK</strong>. CISAB answers.</li></ol><p>Its first four moves are an opening and take a few seconds. After that it thinks. On a real TRS-80 that took 1–7 minutes a move in my tests. <strong>Fast (×20)</strong>, the site’s starting speed, brings most moves down to seconds; <strong>1979 speed</strong> is the real machine’s pace.</p></section>`;
  const board = `<section><h2>Reading the board and typing moves</h2><p>A move is four numbers: ${code('ROW,COLUMN,NEW ROW,NEW COLUMN')}, then ${key('Enter')}. Rows are numbered 1–8 from the top of the screen, columns 1–8 from the left.</p><ul class="tips"><li>${code('K')} king, ${code('Q')} queen, ${code('B')} bishop, ${code('N')} knight, ${code('R')} rook, ${code('P')} pawn; ${code('-')} is an empty square.</li><li>A small block after a letter marks a <strong>White</strong> piece: CISAB’s when it is White, yours when it is Black.</li><li>When CISAB is Black, the kings and queens swap columns: the board is seen from Black’s side.</li><li>CISAB checks only that you move from a square holding one of your pieces (otherwise ${code('**** CHEAT *****')}). The rest of your move is up to you.</li></ul></section>`;
  const ok = `<section><h2>Answers at OK?</h2><dl><div><dt>${code('OK')}</dt><dd>Makes your move; CISAB replies.</dd></div><div><dt>${key('Enter')} or anything else</dt><dd>Forgets the move and asks for it again, for typos.</dd></div><div><dt>${code('ADD')}</dt><dd>Makes your move, then asks ${code('GIVE R,C,V')}: a row, a column and what to put there. ${code('1')} king, ${code('2')} queen, ${code('3')} bishop, ${code('4')} knight, ${code('5')} rook, ${code('6')} pawn; positive for yours, negative for CISAB’s (“WE ARE NEG.”), ${code('0')} to empty it. Then ${code('OK?')} comes back, so you can ${code('ADD')} again. Use it to castle (move the king, then add the rook on its new square and ${code('0')} on its old one), for en passant, and to promote a pawn.</dd></div><div><dt>${code('IQ')}</dt><dd>Makes your move and turns off CISAB’s opening, so it starts thinking at once.</dd></div></dl><p>Capture CISAB’s king and it prints ${code('DARN THEY BEAT YOU!')}. Restart for a new game.</p></section>`;
  const how = `<section><h2>How CISAB chooses</h2><ul class="tips"><li>It lists every move for its pieces. Bishops, rooks and queens step out along angles computed with COS and SIN.</li><li>It marks every square you attack, by flipping the board and generating your moves.</li><li>Each move scores the piece it takes divided by the piece it puts on an attacked square (king 100, queen 9, rook 5, bishop and knight 3, pawn 1). Leaving its most valuable threatened piece where it is scores lower.</li><li>It tries its best-scoring moves on the board, one at a time, and looks at what you could take in reply. A move that loses its king scores worst.</li></ul></section>`;
  const list = `<section class="program-differences"><h2>Quirks kept from the original</h2><p class="small">From reading the source; VERIFICATION.md records what was run.</p><ul class="tips">${quirks.map(q => `<li>${escape(q)}</li>`).join('')}</ul></section>`;
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
