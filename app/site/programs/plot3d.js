// 3-D Plot instructions and controls; shared navigation remains generic.
import {formulas, line200Keys} from '../../../programs/plot3d/typescript/formulas.js';
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const key = text => `<kbd>${escape(text)}</kbd>`;
const code = text => `<code>${escape(text)}</code>`;
const isModern = version => version.implementation === 'typescript';
export const art = {src:new URL('../../assets/plot3d-funnel.svg',import.meta.url).href, alt:'A funnel-shaped wire-grid surface drawn in TRS-80 block graphics'};
export const actionVerb = 'Run';
export const aboutOpen = true;
export const restartLabel = modern => modern ? 'Redraw' : 'Restart';

const settings = [
  ['TILT', '.5', 'How far the far edge is shifted up and to the left. 0 gives a side view; larger values look down on the grid more.'],
  ['X SCALE', '1', 'Width: 1 is 30 dots each side of centre.'],
  ['Y SCALE', '1', 'Height: 1 is 15 dots each way.'],
  ['SWITCH ON', 'not YES', 'YES draws the whole picture a second time over the first. Nothing changes, so it only doubles the time.'],
  ['HOW MANY LINES', '7', 'Grid lines in each direction. Odd numbers put a line through the centre point; 1 stops with a division-by-zero error.']
];

const quirks = [
  'PERIMETERS for “parameters”.',
  'SWITCH ON sets a flag that only makes the program draw the same picture again.',
  'Z1–Z6 hold 67, 75, 65, 68, 73, 69, the character codes of CKADIE, and are never used.',
  'Level II BASIC reads only the first two letters of a name, so TILT, XSCALE, YSCALE and SWITCH are TI, XS, YS and SW; line 170 uses the short names.',
  'Line 190 is one BASIC line typed across two screen lines.'
];

const formulaHelp = `<section><h2>Your own surface</h2><p>Line 200 sets the height ${code('Y')} from ${code('X')} and ${code('Z')}, which each run from −1 to 1. Keep ${code('Y')} roughly between −1 and 1; points off the screen are skipped. Line 180 sets ${code('PI')} and ${code('E')} for you to use: the funnel never uses them, so they are almost certainly there for your formulas. Line 210 lifts the pen when a formula sets ${code('NO=1')}; the program never sets it, so it looks like a way to break the grid where a surface is undefined.</p><p>Write it as Level II BASIC: ${code('*')} ${code('/')} ${code('+')} ${code('-')}, ${code('^')} for powers (the ↑ key), and ${code('SIN COS TAN ATN EXP LOG SQR ABS INT SGN')}. Several statements can be joined with ${code(':')}, and ${code('IF … THEN … ELSE')} works. Try ${code(formulas[5].line)}.</p></section>`;

export function instructions(version) {
  const history = `<section class="program-history"><h2>1979: a 3-D surface, one dot at a time</h2><p>TRS-80 Level II BASIC can only turn single block-graphics dots on and off, 128 across and 48 down. 3-D Plot draws a funnel-shaped surface as a wire grid anyway: it projects each grid point onto the screen and joins neighbours with its own line-drawing subroutine.</p><p>The recovered drafts show how it got there. The first used a ${code('LINE')} statement, which Level II BASIC does not have; the second replaced it with the ${code('SET')} subroutine and drew a flat grid to test it; the finished version brought back the funnel and added the questions, the copyright line, and ${code('PI')} and ${code('E')} ready for an owner's own formulas.</p><p class="small"><em>The finished version prints (C) 1979; the drafts share a tape side with a program marked COPYRIGHT 1979.</em></p></section>`;
  const ai = `<section class="program-history"><h2>What AI makes possible</h2><p>I asked an AI agent to translate the original code into TypeScript because I wanted more control over the display. In my opinion, it went a little crazy, but in an amazing way. It noticed that the TRS-80 does not round numbers the way today's computers do: with modern rounding, the grid misses its center by 0.00000003 and the tip of the funnel disappears. So it modeled the TRS-80's own number format. Then it found that the ROM works out 3${code('^')}2 as 9.0000029, not 9. So it read the ROM's machine code byte by byte and rebuilt its LOG, EXP, SIN and ATN routines from their original constants. The TypeScript version now lights exactly the same dots as the original in every picture it was tested on: 12 pictures, about 10,000 dots.</p><p>It also wrote a small Level II BASIC interpreter, so you can type a new line 200 exactly as an owner would have in 1979, using the ${code('PI')} and ${code('E')} I set up for that. On the original side, it taught the emulator to press BREAK, type your line 200 and RUN, and to run 20 times faster. The original takes 80 seconds to draw the funnel; the new version redraws it instantly as you drag a slider.</p></section>`;
  const how = `<section><h2>How it works</h2><p>For each grid point (X, Z) from −1 to 1, line 200 gives the height Y; the funnel is Y = 1 − 1/√(18X² + 18Z²), or −1 at the centre. The screen position shifts each point up and left by its depth Z times TILT. Points off the screen lift the pen. It draws every row of constant Z, then every row of constant X.</p></section>`;
  const list = `<section class="program-differences"><h2>Quirks kept from the original</h2><ul class="tips">${quirks.map(q => `<li>${escape(q)}</li>`).join('')}</ul></section>`;
  if (isModern(version)) {
    const use = `<section><h2>Draw a surface.</h2><ol><li>Pick a <strong>Surface</strong>, or type your own line 200 and press <strong>Draw</strong> (or ${key('Enter')}).</li><li>Drag the <strong>Tilt</strong>, <strong>X scale</strong>, <strong>Y scale</strong> and <strong>Lines</strong> sliders: they are the original's questions, start at its standard values, and redraw instantly.</li><li>To watch a picture build, choose a speed and press <strong>Draw</strong>: <strong>1979 pace</strong> draws as fast as the TRS-80 (about 80 seconds for the funnel), <strong>Fast</strong> is 20 times faster, <strong>Instant</strong> draws at once.</li><li>For fun, choose <strong>What if · 1024×768</strong>: the same program on a screen of 1024 × 768 square dots instead of 128 × 48 tall ones. Only the screen size in lines 150 and 170 changes (${code('XX=1023:YY=767')}, ${code('DX=XS*240:DY=YS*240')}), so the picture keeps its size and shape, drawn finely.</li></ol><p>Redraw starts the same picture again. Errors use the original's words, such as ${code('?FC Error in 200')} for the square root of a negative number.</p></section>`;
    const note = `<section><h2>This version</h2><p>A TypeScript translation of v03. It draws the same dots as the original: it uses Level II's single-precision rounding and ports the ROM's LOG, EXP, SIN and ATN routines, and its dots match the emulator exactly for every recorded test case. SWITCH ON is left out because it only redraws the same picture. See PARITY.md.</p></section>`;
    return `${history}${ai}<div class="instruction-grid">${use}${formulaHelp}${how}${note}</div>${list}`;
  }
  const run = `<section><h2>Watch it draw.</h2><h3>Your first minute</h3><ol><li>Click the screen so it gets your keys.</li><li>Press ${key('Enter')} at each of the five questions to keep the standard settings, or use the <strong>Standard settings</strong> button to answer all five.</li><li>Watch the grid appear. With the standard settings it takes about 80 seconds. A ${code('D')} in the top-left corner means done.</li><li>Press Restart and try other answers, such as ${code('TILT')} ${code('0')} or ${code('1')}, or ${code('11')} lines.</li></ol></section>`;
  const table = `<section><h2>The questions</h2><dl>${settings.map(([q, d, text]) => `<div><dt>${code(q)} <span class="small">(standard ${escape(d)})</span></dt><dd>${escape(text)}</dd></div>`).join('')}</dl><p>Type a number and ${key('Enter')}, or just ${key('Enter')} to keep the standard value.</p><p><strong>Fast (×20)</strong> runs the emulated TRS-80 about 20 times faster, so the funnel takes about 4 seconds instead of 80; <strong>1979 speed</strong> is the real machine's pace.</p></section>`;
  const change = `<section><h2>Change line 200</h2><p>Pick a surface or type a line in the <strong>Line 200</strong> box and press <strong>Type into BASIC</strong>. It does what a 1979 owner would: presses BREAK (${key('Esc')}), types the new line 200, then ${code('RUN')}. Answer the questions as usual. You can also do it yourself at the keyboard. Restart brings back the original line.</p></section>`;
  const note = `<section><h2>This version</h2><p>${escape(version.note)}</p></section>`;
  return `${history}${ai}<div class="instruction-grid">${run}${table}${change}${formulaHelp}${how}${note}</div>${list}`;
}

// Answers use INPUT: type a number and Enter, or Enter alone for the standard value.
export const onScreenKeys = version => isModern(version) ? [] : [
  {label:'Answer', keys:[...'1234567890'].map(k=>[k,'']).concat([['.',''],['Enter','Enter'],['Escape','Break']])}
];
export const quickHelp = version => isModern(version)
  ? 'Pick a surface or type line 200, then Draw.'
  : 'Click the screen first so it gets your keys. Press Enter at each question to keep the standard settings, or type a number and Enter. A D in the top-left corner means the picture is done.';

// BASIC: a Standard settings button, and a line-200 box that types the new line into the running original.
export function decoratePlayer(instance, {dock, modern}) {
  if (modern) return;
  const display = () => document.querySelector('#display').focus({preventScroll:true});
  const group = document.createElement('div');
  group.className = 'key-group';
  group.innerHTML = '<span class="key-group-label">Quick start</span><div></div>';
  const button = document.createElement('button');
  button.className = 'word-key';
  button.innerHTML = '<kbd>Standard settings</kbd><span>Enter × 5</span>';
  button.setAttribute('aria-label', 'Answer every question with Enter');
  button.onclick = () => { instance.type('\n\n\n\n\n'); display(); };
  group.lastChild.append(button);
  dock.querySelector('.quick-controls').append(group);

  const form = document.createElement('form');
  form.className = 'plot3d-panel';
  form.innerHTML = `<label>Surface <select>${formulas.map((f, i) => `<option value="${i}">${escape(f.name)}</option>`).join('')}<option value="custom" hidden>Your formula</option></select></label>
    <label class="plot3d-formula">Line 200<span class="plot3d-line"><span aria-hidden="true">200</span><input autocomplete="off" spellcheck="false" value="${escape(formulas[0].line)}" aria-label="Line 200"></span></label>
    <button type="submit">Type into BASIC</button><p class="small">Presses BREAK, types this line 200, then RUN.</p>`;
  const select = form.querySelector('select'), input = form.querySelector('input');
  select.onchange = () => { const f = formulas[Number(select.value)]; if (f) input.value = f.line; };
  input.oninput = () => { const i = formulas.findIndex(f => f.line === input.value.trim()); select.value = i >= 0 ? String(i) : 'custom'; };
  form.onsubmit = event => {
    event.preventDefault();
    if (instance.paused) instance.togglePause();
    instance.keys(line200Keys(input.value));
    display();
  };
  dock.querySelector('.essential-controls').after(form);

  // The original at its real speed, or about 20 times faster.
  const speeds = document.createElement('div');
  speeds.className = 'plot3d-speed';
  speeds.setAttribute('role', 'group');
  speeds.setAttribute('aria-label', 'Emulator speed');
  speeds.innerHTML = `<button type="button" data-speed="1" aria-pressed="true">1979 speed</button><button type="button" data-speed="20" aria-pressed="false">Fast (×20)</button>`;
  for (const b of speeds.querySelectorAll('button')) b.onclick = () => {
    instance.setSpeed(Number(b.dataset.speed));
    for (const other of speeds.querySelectorAll('button')) other.setAttribute('aria-pressed', String(other === b));
    display();
  };
  dock.querySelector('.essential-controls').after(speeds);
}
