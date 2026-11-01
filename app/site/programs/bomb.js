// Bomb instructions and controls; shared navigation remains generic.
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const key = text => `<kbd>${escape(text)}</kbd>`;
const code = text => `<code>${escape(text)}</code>`;
export const art = {src:new URL('../../assets/bomb-wires.svg',import.meta.url).href, alt:'Bomb on a TRS-80 screen: HERE ARE THE WIRES, the color TURQUOISE in a box, WHAT IS THE FIRST WIRE?'};
export const aboutOpen = true;
// A stock Model I, as in 1981: its ROM shows shifted letters (yOU, mR. TNT) as capitals.
export const model = 'MODEL1';
export const restartConfirm = () => 'Restart the program? The rankings will be lost.';

// v02's DATA lines 1000-1010, in order.
const colors = 'WHITE BLACK GREY GRAY YELLOW GREEN ORANGE RED PINK BLUE PURPLE VIOLET INDIGO EBONY COBALT AQUA SAPPHIRE TURQUOISE SILVER GOLD EMERALD SCARLET CINNAMON CRIMSON LEMON CHROME AZURE BAY TAN AUBURN COPPER KHAKI OLIVE MAROON IVORY AMBER BEIGE BROWN'.split(' ');

const quirks = [
  'The two instruction pages appear before every game: line 10 skips them only when SK=1, and nothing sets SK.',
  'Each answer’s clock counts passes through the input loop, not seconds, and keeps counting while you type.',
  'After each wire is cut there is a pause of a second or two; keys typed then are thrown away.',
  'A backspace becomes part of your answer: it erases the letter on screen, but the bomb goes off when you press Enter.',
  'Only YES retires. Any other answer, even NO, brings the next bomb, faster.',
  'The program never uses RANDOM. The attract screen draws with random numbers, so the first bomb’s wires depend on when you press a key.',
  'Line 875 reads IF TN>RN(9) PRINT, with no THEN; Level II BASIC runs it.',
  'Rankings live only in memory: Restart clears them.',
  'The source has yOU, kEEP and mR. TNT: Shift held for a capital stores a lowercase letter. A stock Model I shows them as capitals, so this site runs Bomb on one, drawn in the same Model III font as the other programs.'
];

// Describes v02 as played on this site; v01 is listed under Source.
export function instructions() {
  const history = `<section class="program-history"><h2>Probably 1981: a spelling test with a fuse</h2><p>I designed Bomb with my roommate, Rich Losey. It shows you the wires to cut, one color at a time, and then makes you type them back, in order and spelled right, while the bomb ticks. Each bomb you defuse flashes the next one’s wires faster and gives you less time to answer. The color list has both GREY and GRAY, so a bomb can ask for one and then the other.</p><p>Two versions survive on one tape side. In the first, Bomb is item 1 of a menu, next to a radio-station intersection program and some binary search research. The bomb-maker there is still called MR. XX, and the one high score is preset to 38 by CMK, my initials. The second version, played here, stands alone. The bomb-maker has a name, Thomas Nicholas Taggert, “known to the police as ‘Nefarious Nick’,” and the program borrows from the arcades: a flashing title screen that asks for a quarter, and a top-ten table that ranks you even after you blow up.</p><p class="small"><em>The date is an estimate. Neither version is dated; a program saved on both sides of the same tape says COPYRIGHT 1981.</em></p></section>`;
  const play = `<section><h2>Remember the wires. Spell them right.</h2><h3>Your first minute</h3><ol><li>Click the screen so it gets your keys.</li><li>At ${code('TO PLAY DEPOSIT $.25 IN BOX, THEN PRESS ANY BUTTON')} press any key (no quarter needed).</li><li>Press ${key('Enter')} on each of the two instruction pages.</li><li>Watch the box: three to five colors appear one after another, about two seconds each.</li><li>At ${code('WHAT IS THE FIRST WIRE?')} type the first color and press ${key('Enter')}. Then the second, and so on.</li></ol></section>`;
  const rules = `<section><h2>How it plays</h2><ul class="tips"><li>A bomb has 3 wires 3 times in 10, 4 wires half the time, and 5 wires 2 times in 10.</li><li>At first you have about 23 seconds to type each wire, typing included. Run out and the bomb goes off.</li><li>Type each color exactly as shown. There is no fixing a typo: a backspace is counted as part of the answer.</li><li>After a defused bomb, ${code('DO YOU WANT TO RETIRE?')}: ${code('YES')} ends the game; anything else brings the next bomb, with the wires shown and the time to answer both cut to three quarters.</li><li>Your score is the number of wires you have cut. If it makes the top ten, type your initials; a score set by blowing up is marked P (posthumous).</li><li>After each game it returns to the title screen and shows the rankings. Press any key to play again.</li></ul></section>`;
  const list = `<section><h2>The 38 colors</h2><p>${colors.map(code).join(' ')}</p><p class="small">Both GREY and GRAY are wires, and a bomb can use both.</p></section>`;
  const note = `<section><h2>This version</h2><p>v02, the standalone Nefarious Nick version, unchanged in the emulator on a stock Model I with Level II BASIC, as in 1981. The menu version (v01) is kept as source: its Bomb has 35 colors, MR. XX and one high score.</p></section>`;
  const odd = `<section class="program-differences"><h2>Quirks kept from the original</h2><p class="small">From reading the source; VERIFICATION.md records what was run.</p><ul class="tips">${quirks.map(q => `<li>${escape(q)}</li>`).join('')}</ul></section>`;
  return `${history}<div class="instruction-grid">${play}${rules}${list}${note}</div>${odd}`;
}

// Wires are typed letter by letter on your keyboard; these keys cover the rest.
export const onScreenKeys = () => [
  {label:'Keys', keys:[['Enter','Enter'],[' ','Any key']]}
];
export const quickHelp = () => 'Click the screen first so it gets your keys. Press any key at the title screen and Enter on each page. Remember the colors in the box, then type each one and press Enter. Typos cannot be fixed. On a phone, tap Keyboard to type.';

// YES and NO type the whole answer and Enter for the retire question, which uses INPUT.
export function decoratePlayer(instance, {dock}) {
  const group = document.createElement('div');
  group.className = 'key-group';
  group.innerHTML = '<span class="key-group-label">Retire?</span><div></div>';
  for (const word of ['YES', 'NO']) {
    const button = document.createElement('button');
    button.className = 'word-key';
    button.innerHTML = `<kbd>${word}</kbd><span>Enter</span>`;
    button.setAttribute('aria-label', `Type ${word} and Enter`);
    button.onclick = () => { instance.type(`${word}\n`); document.querySelector('#display').focus({preventScroll:true}); };
    group.lastChild.append(button);
  }
  dock.querySelector('.quick-controls').append(group);
  dock.querySelector('.quick-controls').append(phoneKeyboard(instance));
}

// Phones open their own keyboard only for a focused text field. A hidden field
// holds one sentinel character so Backspace still produces an input event; what
// is typed after it goes to the emulator, then the field is reset. Backspace is
// passed through, so it still becomes part of the answer, as on the original.
function phoneKeyboard(instance) {
  const SENTINEL = '_';
  const group = document.createElement('div');
  group.className = 'key-group';
  group.innerHTML = '<span class="key-group-label">Phone</span><div></div>';
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'word-key';
  button.innerHTML = '<kbd>⌨</kbd><span>Keyboard</span>';
  button.setAttribute('aria-label', 'Open the phone keyboard to type wire colors');
  const field = document.createElement('input');
  field.type = 'text';
  field.className = 'phone-keyboard-field';
  field.setAttribute('aria-label', 'Type here to send keys to the TRS-80');
  for (const [name, value] of Object.entries({autocomplete:'off', autocorrect:'off', autocapitalize:'characters', spellcheck:'false', enterkeyhint:'enter', inputmode:'text'})) field.setAttribute(name, value);
  field.style.cssText = 'position:fixed;left:0;bottom:0;width:1px;height:1px;opacity:0;font-size:16px;border:0;padding:0;pointer-events:none';
  let sent = '';
  const reset = () => { field.value = SENTINEL; field.setSelectionRange(1, 1); sent = ''; };
  const sendBackspaces = n => { for (let i = 0; i < n; i++) instance.keys(['Backspace']); };
  field.addEventListener('input', event => {
    if (!field.value.startsWith(SENTINEL)) { sendBackspaces(1 + sent.length); reset(); return; }
    const now = field.value.slice(1);
    let common = 0;
    while (common < now.length && common < sent.length && now[common] === sent[common]) common++;
    sendBackspaces(sent.length - common);
    const added = now.slice(common).replace(/[^ -~]/g, '');
    if (added) instance.type(added);
    sent = now;
    if (!event.isComposing) reset();
  });
  field.addEventListener('compositionend', reset);
  field.addEventListener('keydown', event => {
    if (event.key === 'Enter') { event.preventDefault(); instance.type('\n'); reset(); }
  });
  button.onclick = () => {
    reset();
    field.focus({preventScroll:true});
    document.querySelector('#display')?.scrollIntoView({block:'start'});
  };
  group.lastChild.append(button, field);
  return group;
}
