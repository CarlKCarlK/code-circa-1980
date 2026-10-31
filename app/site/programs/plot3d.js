// 3-D Plot instructions and controls; shared navigation remains generic.
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const key = text => `<kbd>${escape(text)}</kbd>`;
const code = text => `<code>${escape(text)}</code>`;
export const art = {src:new URL('../../assets/plot3d-funnel.svg',import.meta.url).href, alt:'A funnel-shaped wire-grid surface drawn in TRS-80 block graphics'};
export const actionVerb = 'Run';
export const aboutOpen = true;

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
  'NO (line 210) is tested but never set.',
  'Z1–Z6 hold 67, 75, 65, 68, 73, 69, the character codes of CKADIE, and are never used. PI and E are computed and never used.',
  'Level II BASIC reads only the first two letters of a name, so TILT, XSCALE, YSCALE and SWITCH are TI, XS, YS and SW; line 170 uses the short names.',
  'Line 190 is one BASIC line typed across two screen lines.'
];

export function instructions(version) {
  const history = `<section class="program-history"><h2>1979: a 3-D surface, one dot at a time</h2><p>TRS-80 Level II BASIC can only turn single block-graphics dots on and off, 128 across and 48 down. 3-D Plot draws a funnel-shaped surface as a wire grid anyway: it projects each grid point onto the screen and joins neighbours with its own line-drawing subroutine.</p><p>The recovered drafts show how it got there. The first used a ${code('LINE')} statement, which Level II BASIC does not have; the second replaced it with the ${code('SET')} subroutine and drew a flat grid to test it; the finished version brought back the funnel and added the questions.</p><p class="small"><em>The finished version prints (C) 1979; the drafts share a tape side with a program marked COPYRIGHT 1979.</em></p></section>`;
  const run = `<section><h2>Watch it draw.</h2><h3>Your first minute</h3><ol><li>Click the screen so it gets your keys.</li><li>Press ${key('Enter')} at each of the five questions to keep the standard settings, or use the <strong>Standard settings</strong> button to answer all five.</li><li>Watch the grid appear. With the standard settings it takes about 80 seconds. A ${code('D')} in the top-left corner means done.</li><li>Press Restart and try other answers, such as ${code('TILT')} ${code('0')} or ${code('1')}, or ${code('11')} lines.</li></ol></section>`;
  const table = `<section><h2>The questions</h2><dl>${settings.map(([q, d, text]) => `<div><dt>${code(q)} <span class="small">(standard ${escape(d)})</span></dt><dd>${escape(text)}</dd></div>`).join('')}</dl><p>Type a number and ${key('Enter')}, or just ${key('Enter')} to keep the standard value.</p></section>`;
  const how = `<section><h2>How it works</h2><p>For each grid point (X, Z) from −1 to 1, the height is Y = 1 − 1/√(18X² + 18Z²), or −1 at the centre. The screen position shifts each point up and left by its depth Z times TILT. Points off the screen lift the pen. It draws every row of constant Z, then every row of constant X.</p></section>`;
  const note = `<section><h2>This version</h2><p>${escape(version.note)}</p></section>`;
  const list = `<section class="program-differences"><h2>Quirks kept from the original</h2><ul class="tips">${quirks.map(q => `<li>${escape(q)}</li>`).join('')}</ul></section>`;
  return `${history}<div class="instruction-grid">${run}${table}${how}${note}</div>${list}`;
}

// Answers use INPUT: type a number and Enter, or Enter alone for the standard value.
export const onScreenKeys = () => [
  {label:'Answer', keys:[...'1234567890'].map(k=>[k,'']).concat([['.',''],['Enter','Enter']])}
];
export const quickHelp = () => 'Click the screen first so it gets your keys. Press Enter at each question to keep the standard settings, or type a number and Enter. A D in the top-left corner means the picture is done.';

// Answers all five questions with Enter, keeping every standard setting.
export function decoratePlayer(instance, {dock}) {
  const group = document.createElement('div');
  group.className = 'key-group';
  group.innerHTML = '<span class="key-group-label">Quick start</span><div></div>';
  const button = document.createElement('button');
  button.className = 'word-key';
  button.innerHTML = '<kbd>Standard settings</kbd><span>Enter × 5</span>';
  button.setAttribute('aria-label', 'Answer every question with Enter');
  button.onclick = () => { instance.type('\n\n\n\n\n'); document.querySelector('#display').focus({preventScroll:true}); };
  group.lastChild.append(button);
  dock.querySelector('.quick-controls').append(group);
}
