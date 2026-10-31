// Browser version: the Rust port of CISAB v14, compiled to WebAssembly, on a mouse board.
// Follows the shared player contract used by Castles (see app/site/main.js).
// The board is CISAB's screen turned around, so your pieces are at the bottom.
import init, {Game} from '../rust/pkg/cisab_chess.js';

const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ADJECTIVES = ['FOOLISH','DESPERATE','IRREDEEMABLE','LUDICROUS','SERIOCOMIC','DROLL','RIDICULOUS','WHIMSICAL','PREPOSTEROUS','ABSURD'];
// Solid glyphs for both sides, colored by CSS; U+FE0E asks for text, not emoji.
const GLYPH = {1:'♚', 2:'♛', 3:'♝', 4:'♞', 5:'♜', 6:'♟'};
const LETTER = {1:'K', 2:'Q', 3:'B', 4:'N', 5:'R', 6:''};
const NAME = {1:'king', 2:'queen', 3:'bishop', 4:'knight', 5:'rook', 6:'pawn'};
const PROMOTIONS = [[2,'Queen'], [5,'Rook'], [3,'Bishop'], [4,'Knight']];

// Why the original program stops, for each way it can end.
function endMessage(end) {
  if (end.kind === 'theyWin') return ['You took CISAB’s king.', 'DARN THEY BEAT YOU! Taking its king is the only way CISAB admits defeat (line 100).'];
  if (end.kind === 'forever') return ['Checkmate: you win.', 'Every move CISAB can find loses its king, so lines 1010–1220 repeat forever. It never knew it had lost; the 1979 program simply never moves again.'];
  if (end.kind === 'stalemate') return ['Stalemate: a draw.', 'I CAN’T MOVE.  STALEMATE (line 1005).'];
  const why = {
    'BS 3015': 'CISAB listed more than 120 moves of its own. Rooks, bishops and queens list some squares two or three times (they step half a square at a time), and DIM in line 15 has room for 120.',
    'BS 3500': 'CISAB listed more than 120 of your moves while mapping the squares you attack. Your rooks, bishops and queens count some squares two or three times, and DIM in line 15 has room for 120.',
    'FC 335': 'A CISAB pawn stood on your back row, and line 335, looking two squares ahead, asked for row −1.',
    'RG 10020': 'The four squares of CISAB’s opening were all empty, so line 9530 fell into the board-drawing subroutine, whose RETURN has no GOSUB.',
  }[end.text.replace(/^\?(\w\w) Error in (\d+)$/, '$1 $2')] ?? 'The 1979 program stops here.';
  return [`CISAB is disqualified: ${end.text}. You win.`, `${why} The 1979 program stops here.`];
}

export async function createPlayer(host, _url, status, title) {
  await init();
  const dock = document.getElementById('control-dock');
  const field = document.createElement('div');
  field.className = 'chess-field';
  field.innerHTML = `<p class="chess-prompt trs80" aria-live="polite"></p><div class="chess-board-wrap"><div class="chess-board" role="grid" aria-label="Chess board"></div><div class="chess-files" aria-hidden="true"></div><div class="chess-ranks" aria-hidden="true"></div></div><div class="chess-end" hidden></div><div class="chess-promotion" hidden role="dialog" aria-label="Promote your pawn"><p>Promote to</p><div></div></div>`;
  host.replaceChildren(field);
  host.append(dock);
  host.classList.add('chess-host');
  host.setAttribute('aria-label', `${title}. Click one of your pieces, then a square.`);

  const panel = document.createElement('div');
  panel.className = 'chess-panel';
  panel.innerHTML = `<div class="chess-new"><span>New game</span><button type="button" data-white="true">Play White</button><button type="button" data-white="false">Play Black</button></div><label class="chess-book"><input type="checkbox" checked> CISAB’s opening <span class="small">(off = answer IQ)</span></label><h3>Moves</h3><ol class="chess-moves"></ol><p class="chess-offboard small" hidden></p><details class="chess-transcript"><summary>TRS-80 transcript</summary><pre class="trs80"></pre></details>`;
  dock.querySelector('.essential-controls').after(panel);

  const board = field.querySelector('.chess-board'), prompt = field.querySelector('.chess-prompt');
  const endBox = field.querySelector('.chess-end'), promotion = field.querySelector('.chess-promotion');
  const book = panel.querySelector('.chess-book input'), moveList = panel.querySelector('.chess-moves');
  const offboard = panel.querySelector('.chess-offboard'), transcript = panel.querySelector('.chess-transcript pre');

  let game, youWhite = true, dq = null, state, history = [], lines = [], selected = null, thinking = false, shown = null, last = null, timer = 0;

  // CISAB's squares: rows 1-8 from your back row, columns 1-8 across its screen.
  const square = (r, c) => youWhite ? `${'hgfedcba'[c - 1]}${r}` : `${'abcdefgh'[c - 1]}${9 - r}`;
  const at = (b, [r, c]) => b[r][c];
  function san(b, m, by) {
    const piece = Math.abs(at(b, m.from));
    if (piece === 1 && Math.abs(m.to[1] - m.from[1]) === 2 && by === 'you') return m.to[1] < m.from[1] === youWhite ? 'O-O' : 'O-O-O';
    const onBoard = ([r, c]) => r >= 1 && r <= 8 && c >= 1 && c <= 8;
    if (!onBoard(m.to)) return `${LETTER[piece] || 'P'}${square(...m.from)} to row ${m.to[0]}`;
    const capture = at(b, m.to) !== 0 || (piece === 6 && m.from[1] !== m.to[1]);
    const from = piece === 6 ? (capture ? square(...m.from)[0] : '') : LETTER[piece];
    return `${from}${capture ? 'x' : ''}${square(...m.to)}${m.promote ? `=${LETTER[m.promote]}` : ''}`;
  }

  function addTranscript(newLines, adjective, events) {
    let mode = 'move';
    for (const line of newLines) {
      if (mode === 'color') lines.push(`WHAT COLOR ARE WE? ${line}`);
      else if (mode === 'move') { lines.push(`WHAT WAS THEIR ${adjective} MOVE (ROW,COLUMN,NEW ROW,COLUMN)? ${line}`); if (events.some(e => e.kind === 'ohDarn')) lines.push('OH DARN!'); }
      else if (mode === 'ok') lines.push(`OK?? ${line}`);
      else lines.push('K=1,Q=2,B=3,N=4,R=5,P=6  WE ARE NEG. GIVE R,C,V', `? ${line}`);
      mode = mode === 'move' || mode === 'add' ? 'ok' : line === 'ADD' ? 'add' : 'done';
    }
    const keyfree = events.filter(e => e.kind === 'keyfree').length;
    if (events.some(e => e.kind === 'ourTurn')) lines.push('NOW IT IS OUR TURN');
    if (keyfree) lines.push(`KEYFREE ×${keyfree}`);
    const end = events.find(e => e.kind === 'ended')?.end;
    if (end?.text) lines.push(end.text);
    transcript.textContent = lines.join('\n');
    transcript.scrollTop = transcript.scrollHeight;
  }

  function refresh() { state = JSON.parse(game.state()); }

  function start(white) {
    clearTimeout(timer);
    youWhite = white;
    game = new Game(white);
    history = []; lines = []; selected = null; thinking = false; last = null; dq = null;
    refresh();
    lines.push(`WHAT COLOR ARE WE? ${state.typed[0]}`);
    const reply = JSON.parse(game.first_reply());
    if (reply) {
      // As White, CISAB opens before your first move; its knight went to an empty square.
      const before = state.engine.board.map(row => [...row]);
      before[reply.from[0]][reply.from[1]] = before[reply.to[0]][reply.to[1]];
      before[reply.to[0]][reply.to[1]] = 0;
      history.push({by:'cisab', text:san(before, reply, 'cisab'), raw:`${reply.from}–${reply.to}`, legal:true, book:true});
      last = reply;
      lines.push('NOW IT IS OUR TURN');
    }
    refresh();
    shown = state.engine.board;
    book.checked = true;
    render();
  }

  function play(m, promote = 0) {
    if (thinking || dq || state.engine.prompt !== 'move') return;
    const before = state.engine.board, adjective = ADJECTIVES[state.engine.adjective - 1], typedBefore = state.typed.length;
    const iq = !book.checked && state.engine.opening;
    const result = JSON.parse(game.play(m.from[0], m.from[1], m.to[0], m.to[1], promote, iq));
    refresh();
    addTranscript(state.typed.slice(typedBefore), adjective, result.events);
    history.push({by:'you', text:san(before, {...m, promote}, 'you'), raw:`${m.from}–${m.to}`, legal:true});
    selected = null;
    last = {from:m.from, to:m.to};
    shown = result.afterYou;
    if (!result.reply) { render(); return; }
    // Show your move, then CISAB's after a moment, as if it had thought.
    thinking = true;
    render();
    const reply = result.reply, opening = result.events.some(e => e.kind === 'moved' && e.book);
    timer = setTimeout(() => {
      thinking = false;
      history.push({by:'cisab', text:san(result.afterYou, reply, 'cisab'), raw:`${reply.from}–${reply.to}`, legal:reply.legal, book:opening});
      // An illegal move disqualifies CISAB; the board shows the move it made.
      if (!reply.legal) dq = {text:history.at(-1).text, reason:reply.reason};
      last = reply;
      shown = state.engine.board;
      render();
    }, opening ? 250 : 600);
  }

  function legalFrom(sq) { return state.moves.filter(m => m.from[0] === sq[0] && m.from[1] === sq[1]); }
  function tryMove(from, to) {
    const m = state.moves.find(x => x.from[0] === from[0] && x.from[1] === from[1] && x.to[0] === to[0] && x.to[1] === to[1]);
    if (!m) return false;
    if (m.promotes) { askPromotion(m); return true; }
    play(m);
    return true;
  }
  function askPromotion(m) {
    const choices = promotion.querySelector('div');
    choices.innerHTML = PROMOTIONS.map(([v, name]) => `<button type="button" data-v="${v}" aria-label="${name}"><span class="piece mine">${GLYPH[v]}︎</span>${name}</button>`).join('');
    promotion.hidden = false;
    for (const b of choices.querySelectorAll('button')) b.onclick = () => { promotion.hidden = true; play(m, Number(b.dataset.v)); };
    choices.querySelector('button').focus();
  }

  function render() {
    const e = state.engine, b = shown ?? e.board;
    const over = e.end || dq || (!thinking && e.prompt === 'move' && state.moves.length === 0);
    const targets = selected ? legalFrom(selected).map(m => `${m.to}`) : [];
    const checkSq = !thinking && state.inCheck ? findKing(b, 1) : null;
    const cells = [];
    for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) {
      const r = 8 - i, c = 8 - j, v = b[r][c], key = `${r},${c}`;
      const classes = ['sq', (i + j) % 2 ? 'dark' : 'light'];
      if (selected && `${selected}` === key) classes.push('selected');
      if (last && (`${last.from}` === key || `${last.to}` === key)) classes.push('last');
      if (targets.includes(key)) classes.push(v ? 'capture' : 'target');
      if (checkSq && `${checkSq}` === key) classes.push('check');
      const mine = v > 0, color = mine === youWhite ? 'white' : 'black';
      const label = `${square(r, c)}${v ? `, ${mine ? 'your' : 'CISAB’s'} ${NAME[Math.abs(v)]}` : ''}`;
      cells.push(`<button type="button" class="${classes.join(' ')}" data-r="${r}" data-c="${c}" aria-label="${label}">${v ? `<span class="piece ${color}${mine ? ' mine' : ''}">${GLYPH[Math.abs(v)]}︎</span>` : ''}</button>`);
    }
    board.innerHTML = cells.join('');
    field.querySelector('.chess-files').innerHTML = [...Array(8)].map((_, j) => `<span>${square(1, 8 - j)[0]}</span>`).join('');
    field.querySelector('.chess-ranks').innerHTML = [...Array(8)].map((_, i) => `<span>${square(8 - i, 1).slice(1)}</span>`).join('');
    board.classList.toggle('busy', thinking || Boolean(over));

    if (thinking) prompt.textContent = 'NOW IT IS OUR TURN';
    else if (e.prompt === 'move') prompt.textContent = `WHAT WAS THEIR ${ADJECTIVES[e.adjective - 1]} MOVE?`;
    else prompt.textContent = e.end?.text || 'READY';

    let heading = '', detail = '';
    if (dq) [heading, detail] = ['CISAB is disqualified: illegal move. You win.', `Its move ${dq.text} ${dq.reason}. The 1979 program never checked its own moves and would have played on; the Level II BASIC tab runs it unchanged.`];
    else if (!thinking && e.end) [heading, detail] = endMessage(e.end);
    else if (!thinking && e.prompt === 'move' && state.moves.length === 0) {
      [heading, detail] = state.inCheck ? ['Checkmate: CISAB wins.', 'It never noticed: the 1979 program would simply ask for your next move.'] : ['Stalemate: a draw.', 'You have no legal move, and you are not in check.'];
    }
    endBox.hidden = !heading;
    endBox.innerHTML = heading ? `<strong>${escape(heading)}</strong><p>${escape(detail)}</p><button type="button">New game</button>` : '';
    endBox.querySelector('button')?.addEventListener('click', () => start(youWhite));

    // One row per move number: White's move, then Black's.
    const cell = h => `<span class="ply ${h.by}" title="${h.by === 'you' ? 'You' : 'CISAB'} · row,column as typed into the original: ${escape(h.raw)}"><span class="san">${escape(h.text)}</span>${h.book ? '<span class="tag" title="From the opening in lines 9500-9530">book</span>' : ''}${h.legal ? '' : '<span class="tag illegal" title="Not a legal chess move: CISAB is disqualified.">illegal</span>'}<span class="raw">${escape(h.raw)}</span></span>`;
    const rows = [];
    history.forEach((h, k) => {
      const white = (h.by === 'you') === youWhite;
      if (white || !rows.length || rows.at(-1).length === 2) rows.push(white ? [h] : [null, h]);
      else rows.at(-1).push(h);
    });
    moveList.innerHTML = rows.map(([w, b]) => `<li>${w ? cell(w) : '<span class="ply">…</span>'}${b ? cell(b) : ''}</li>`).join('');
    moveList.scrollTop = moveList.scrollHeight;
    const hidden = [];
    e.board.forEach((row, r) => row.forEach((v, c) => { if (v && (r < 1 || r > 8 || c < 1 || c > 8)) hidden.push(`${v < 0 ? 'CISAB’s' : 'your'} ${NAME[Math.abs(v)]} at row ${r}, column ${c}`); }));
    offboard.hidden = !hidden.length;
    offboard.textContent = hidden.length ? `Off the board, where the original keeps them: ${hidden.join('; ')}.` : '';
    book.disabled = !e.opening || Boolean(over);
    book.parentElement.title = e.opening ? 'Unchecked, your next move is confirmed with IQ, which turns off CISAB’s four-move opening.' : 'CISAB’s opening is over.';
    status.textContent = thinking ? 'CISAB is thinking…' : over ? 'Game over · New game to play again'
      : state.inCheck ? 'Check! Your move' : selected ? 'Choose a square (dots show legal moves)' : 'Your move · click or drag a piece';
  }

  function findKing(b, side) {
    for (let r = 1; r <= 8; r++) for (let c = 1; c <= 8; c++) if (b[r][c] === side) return [r, c];
    return null;
  }

  // Mouse and touch: click a piece then a square, or drag it there.
  const squareAt = (x, y) => { const el = document.elementFromPoint(x, y)?.closest?.('.sq'); return el && board.contains(el) ? [Number(el.dataset.r), Number(el.dataset.c)] : null; };
  let drag = null;
  board.addEventListener('pointerdown', ev => {
    const el = ev.target.closest('.sq');
    if (!el || thinking || state.engine.prompt !== 'move' || !promotion.hidden) return;
    const sq = [Number(el.dataset.r), Number(el.dataset.c)];
    if (dq) return;
    if (selected && `${selected}` !== `${sq}` && tryMove(selected, sq)) { ev.preventDefault(); return; }
    if (state.engine.board[sq[0]][sq[1]] > 0 && legalFrom(sq).length) {
      ev.preventDefault();
      selected = sq;
      render();
      const piece = board.querySelector(`.sq[data-r="${sq[0]}"][data-c="${sq[1]}"] .piece`);
      drag = {sq, piece, id:ev.pointerId, x:ev.clientX, y:ev.clientY, moved:false};
      board.setPointerCapture(ev.pointerId);
    } else if (selected) { selected = null; render(); }
  });
  board.addEventListener('pointermove', ev => {
    if (!drag || ev.pointerId !== drag.id) return;
    const dx = ev.clientX - drag.x, dy = ev.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 4) return;
    drag.moved = true;
    drag.piece?.classList.add('dragging');
    if (drag.piece) drag.piece.style.transform = `translate(${dx}px, ${dy}px)`;
  });
  const endDrag = ev => {
    if (!drag || ev.pointerId !== drag.id) return;
    const d = drag; drag = null;
    if (!d.moved) return;
    const to = squareAt(ev.clientX, ev.clientY);
    if (!to || !tryMove(d.sq, to)) { if (d.piece) { d.piece.style.transform = ''; d.piece.classList.remove('dragging'); } }
  };
  board.addEventListener('pointerup', endDrag);
  board.addEventListener('pointercancel', ev => { if (drag) { drag.piece && (drag.piece.style.transform = ''); drag = null; render(); } });
  board.addEventListener('keydown', ev => {
    if (ev.key !== 'Enter' && ev.key !== ' ') return;
    const el = ev.target.closest('.sq');
    if (!el || thinking || dq) return;
    ev.preventDefault();
    const sq = [Number(el.dataset.r), Number(el.dataset.c)];
    if (selected && tryMove(selected, sq)) return;
    selected = state.engine.board[sq[0]][sq[1]] > 0 && legalFrom(sq).length ? sq : null;
    render();
    board.querySelector(`.sq[data-r="${sq[0]}"][data-c="${sq[1]}"]`)?.focus();
  });
  for (const b of panel.querySelectorAll('.chess-new button')) b.onclick = () => {
    if (history.some(h => h.by === 'you') && !state.engine.end && !confirm('Start a new game? The game in progress is lost.')) return;
    start(b.dataset.white === 'true');
  };

  start(true);
  return {
    pausable: false,
    press() {}, release() {},
    restart() { start(youWhite); },
    togglePause() {},
    hasWork() { return history.some(h => h.by === 'you') && !state.engine.end && !dq; },
    get paused() { return false; },
    loadStartingPattern() {},
    snapshot() { return {youWhite, dq, prompt:state.engine.prompt, board:state.engine.board, history, moves:state.moves, end:state.engine.end, thinking, typed:state.typed}; },
    diagnostics() { return {youWhite, prompt:state.engine.prompt, moves:history.length, end:dq ? `illegal: ${dq.text}` : state.engine.end?.text ?? null, thinking}; },
    play(from, to, promote = 0) { const m = state.moves.find(x => `${x.from}` === `${from}` && `${x.to}` === `${to}`); if (m) play(m, promote); return Boolean(m); },
    dispose() { clearTimeout(timer); panel.remove(); },
  };
}
