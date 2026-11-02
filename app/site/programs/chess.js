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


// The Rust version on the mouse board.
function modernInstructions(history, list) {
  const play = `<section><h2>Play against the 1980 program on a modern board.</h2><ol><li>You play White. To play Black, press <strong>Play Black</strong> beside the board; CISAB then opens with its knight.</li><li>Click one of your pieces (or drag it). Dots show where it can go; click the square.</li><li>CISAB answers after a moment. Its moves come from a Rust port of the BASIC program: the same move generator, scores, shuffle and look-ahead, with the TRS-80’s random numbers and rounding, so it plays the same moves the original would.</li></ol><p>You can make every legal move, including castling, en passant and promotion to any piece. CISAB never checked its own moves, so the board checks them. An illegal move disqualifies it, most often leaving its king in check (it has no idea of check). So does a BASIC error that would have stopped the original. You win either way. The Level II BASIC tab runs the original, which plays on after illegal moves.</p></section>`;
  const original = `<section><h2>What the board does for you</h2><ul class="tips"><li>The 1980 program had no board of its own to check you: an operator typed each move as ${code('ROW,COLUMN,NEW ROW,NEW COLUMN')} and confirmed it with ${code('OK')}. The site types those lines for you; the list shows them beside each move.</li><li>Castling, en passant and promotion are typed as the original asks: your king’s move, then ${code('ADD')} to put the rook, empty a square or change the pawn.</li><li>Unchecking <strong>CISAB’s opening</strong> answers your next move with ${code('IQ')}, which ends the four-move opening, so CISAB starts thinking at once.</li><li>The <strong>TRS-80 transcript</strong> shows the prompts and answers as they would appear on the TRS-80 screen. Its random adjective (FOOLISH, DROLL…) is the one the original would pick.</li></ul></section>`;
  const ends = `<section class="program-differences"><h2>How games end</h2><ul class="tips"><li><strong>You checkmate CISAB:</strong> it can’t tell. Every move it can find loses its king, and lines 1010–1220 repeat forever. The board calls it checkmate.</li><li><strong>CISAB makes an illegal move:</strong> it is disqualified. The move list marks the move.</li><li><strong>The program would stop with an error:</strong> CISAB is disqualified. The fixes below removed the errors seen in testing; the Rust version would stop at the same move with the same message.</li><li><strong>CISAB checkmates you:</strong> it wins, though it never noticed. A stalemate on either side is a draw.</li></ul></section>`;
  return `${history}<div class="instruction-grid">${play}${original}</div>${ends}${list}`;
}

// The Illinois Chess Bulletin's notice of the 1980 tournament CISAB was written for.
const masthead = new URL('../../../programs/chess/history/illinois-chess-bulletin-1980-06-masthead.png', import.meta.url).href;
const notice = new URL('../../../programs/chess/history/illinois-chess-bulletin-1980-06-peoria-highlighted.png', import.meta.url).href;
const bulletin = `<figure class="catalog-page"><a href="${masthead}" target="_blank" rel="noopener"><img src="${masthead}" width="1046" height="414" alt="Illinois Chess Bulletin masthead: Official Publication of the Illinois Chess Association, a USCF Affiliate. June-July, 1980. Vol. III, No. 4" loading="lazy" decoding="async"></a><a href="${notice}" target="_blank" rel="noopener"><img src="${notice}" width="518" height="342" alt="Peoria column, with this item highlighted: BILL NAFF reports that Peoria will host a COMPUTER CHESS TOURNAMENT on Saturday, July 12 at the Ramada Inn." loading="lazy" decoding="async"></a><figcaption>The <em>Illinois Chess Bulletin</em>, June–July 1980, announces the tournament: Saturday, July 12, at the Ramada Inn in Peoria.</figcaption></figure>`;

export function instructions(version) {
  const history = `<section class="program-history"><h2>1980: chess in BASIC, spelled backwards</h2><p>The summer after high school, I wrote CISAB in TRS-80 Level II BASIC for a computer chess tournament in Peoria, Illinois. I think everyone else used commercial programs such as Sargon. CISAB is built for a tournament: it asks what color “we” are and then “what was their foolish move” (the adjective changes every turn). Someone at the keyboard types in the opponent’s moves and plays CISAB’s replies on the real board.</p>${bulletin}<aside class="note"><p><strong>An aside:</strong> at home I also had Sargon, Dan and Kathe Spracklen’s commercial chess program for the TRS-80. I played against it myself; it wasn’t my tournament entry. For a very casual player like me, who played only with family and friends, it was great: it taught me to stop overlooking my own dumb moves, and I got much better against my friends. CISAB asks the same question Sargon made me ask: after this move, what can they take?</p></aside><h3>How it worked, and why BASIC made it hard</h3><p>CISAB lists every move it can make and scores each one, roughly, as the value of the piece it would capture divided by the risk to the piece it moves, if that square is attacked. Moves that leave its most valuable threatened piece where it is score lower. It shuffles the tied best moves with RND.</p><p>Then it looks ahead one reply. It makes its best move on the board, then flips the sign of every square, so its pieces become the other side’s and the same move generator plays for its opponent. It notes the most valuable piece that reply could take, undoes its move, and lowers that move’s score. If the reply can take nothing, it plays the move; otherwise it tries the next best. When every candidate it has checked loses something, it settles for the one that loses least. That is Sargon’s question: after this move, what can they take?</p><p>Level II BASIC made this hard. It has no procedures with parameters, no local variables and no recursion, so the look-ahead couldn’t simply call itself. Instead, one maze of GOSUBs and GOTOs shares global variables, with flags (SW and QT) telling the move generator which side it is working for. To undo a trial move, it keeps the two squares the move changes in OC and NC and puts them back. Level II reads only the first two letters of a variable name, so the names are things like R7, C8, QQ and VA. The whole program is about 5 KB, and the interpreter is slow: at the TRS-80’s real speed, each move took 1–7 minutes in my tests.</p><p>I didn’t learn the full theory behind programs like this (game-tree search, minimax, evaluation functions) until years later, in AI classes in college.</p><h3>How strong is it?</h3><p>About 100 Elo: very weak, roughly a player who knows the moves but little else. In 2026, the Rust version (below) played 200 games against Texel, a modern chess engine that can be set to play at calibrated strengths, at its Elo 0 and 200 settings. That gives 104 ± 50 (95% confidence). It never lost to random legal moves: 32 games, 5 wins and 27 draws. Its weak spot is finishing: it knows nothing of check, checkmate or stalemate, so in 129 of the 200 games it stalemated its opponent while ahead by a queen or more.</p><p class="small">The rating is for the corrected v14 this site plays. The v14 I recovered scored under 10% even against random moves, because of its pawn bugs. Games were run by Fastchess at 30 seconds plus 0.2 per move; illegal moves, crashes and time forfeits counted as losses. The figure is only as good as Texel’s own calibration. Details are in rating/RESULTS.md.</p><h3>The Rust version</h3><p>The mouse board plays against a Rust port of the corrected v14, compiled to WebAssembly. It follows the BASIC statement by statement and reproduces the TRS-80’s random-number generator and its single-precision rounding, so given the same moves it makes the same replies, illegal moves and BASIC errors included. It was checked against 22 games recorded from the original running in the emulator. The site adds only what the original lacked: it checks moves and disqualifies an illegal one.</p></section>`;
  const play = `<section><h2>You are “them”. CISAB is “we”.</h2><p>Its pieces are always at the bottom of the screen, yours at the top.</p><h3>Your first minute</h3><ol><li>Click the screen so it gets your keys.</li><li>At ${code('WHAT COLOR ARE WE?')} press <strong>WHITE</strong> (CISAB moves first) or <strong>BLACK</strong> (you move first), or type it and ${key('Enter')}.</li><li>As White, CISAB moves its knight from row 8, column 2 to row 6, column 3. At ${code('WHAT WAS THEIR … MOVE')} type ${code('2,5,4,5')} and ${key('Enter')} to push your king’s pawn two squares.</li><li>At ${code('OK?')} press <strong>OK</strong>. CISAB answers.</li></ol><p>Its first four moves are an opening and take a few seconds. After that it thinks. On a real TRS-80 that took 1–7 minutes a move in my tests. <strong>Fast (×20)</strong>, the site’s starting speed, brings most moves down to seconds; <strong>1979 speed</strong> is the real machine’s pace.</p></section>`;
  const board = `<section><h2>Reading the board and typing moves</h2><p>A move is four numbers: ${code('ROW,COLUMN,NEW ROW,NEW COLUMN')}, then ${key('Enter')}. Rows are numbered 1–8 from the top of the screen, columns 1–8 from the left.</p><ul class="tips"><li>${code('K')} king, ${code('Q')} queen, ${code('B')} bishop, ${code('N')} knight, ${code('R')} rook, ${code('P')} pawn; ${code('-')} is an empty square.</li><li>A small block after a letter marks a <strong>White</strong> piece: CISAB’s when it is White, yours when it is Black.</li><li>When CISAB is Black, the kings and queens swap columns: the board is seen from Black’s side.</li><li>CISAB checks only that you move from a square holding one of your pieces (otherwise ${code('**** CHEAT *****')}). The rest of your move is up to you.</li></ul></section>`;
  const ok = `<section><h2>Answers at OK?</h2><dl><div><dt>${code('OK')}</dt><dd>Makes your move; CISAB replies.</dd></div><div><dt>${key('Enter')} or anything else</dt><dd>Forgets the move and asks for it again, for typos.</dd></div><div><dt>${code('ADD')}</dt><dd>Makes your move, then asks ${code('GIVE R,C,V')}: a row, a column and what to put there. ${code('1')} king, ${code('2')} queen, ${code('3')} bishop, ${code('4')} knight, ${code('5')} rook, ${code('6')} pawn; positive for yours, negative for CISAB’s (“WE ARE NEG.”), ${code('0')} to empty it. Then ${code('OK?')} comes back, so you can ${code('ADD')} again. Use it to castle (move the king, then add the rook on its new square and ${code('0')} on its old one), for en passant, and to promote a pawn to something other than a queen.</dd></div><div><dt>${code('IQ')}</dt><dd>Makes your move and turns off CISAB’s opening, so it starts thinking at once.</dd></div></dl><p>Capture CISAB’s king and it prints ${code('DARN THEY BEAT YOU!')}. Restart for a new game.</p></section>`;
  const list = `<section class="program-differences"><h2>Fixed for this site</h2><p class="small">Both players run v14 with these changes, made at my request in 2026. Each keeps what the 1980 program meant to do. The recovered bytes are under Source, and corrected/changes.json lists every change.</p><ul class="tips">${fixes.map(q => `<li>${escape(q)}</li>`).join('')}</ul><h2>Quirks kept from the original</h2><p class="small">From reading the source; VERIFICATION.md records what was run.</p><ul class="tips">${quirks.map(q => `<li>${escape(q)}</li>`).join('')}</ul></section>`;
  if (isModern(version)) return modernInstructions(history, list);
  return `${history}<div class="instruction-grid">${play}${board}${ok}</div>${list}`;
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
