// Bomb instructions and controls; shared navigation remains generic.
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const key = text => `<kbd>${escape(text)}</kbd>`;
const code = text => `<code>${escape(text)}</code>`;
export const art = {src:new URL('../../assets/bomb-wires.svg',import.meta.url).href, alt:'Bomb on a TRS-80 screen: HERE ARE THE WIRES, the color TURQUOISE in a box, WHAT IS THE FIRST WIRE?'};
export const aboutOpen = true;
export const restartConfirm = () => 'Restart the program? The rankings will be lost.';

// v02's DATA lines 1000-1010, in order.
const colors = 'WHITE BLACK GREY GRAY YELLOW GREEN ORANGE RED PINK BLUE PURPLE VIOLET INDIGO EBONY COBALT AQUA SAPPHIRE TURQUOISE SILVER GOLD EMERALD SCARLET CINNAMON CRIMSON LEMON CHROME AZURE BAY TAN AUBURN COPPER KHAKI OLIVE MAROON IVORY AMBER BEIGE BROWN'.split(' ');

const quirks = [
  'The two instruction pages appear before every game: line 10 skips them only when SK=1, and nothing sets SK.',
  'Each answer’s clock counts passes through the input loop, not seconds, and keeps counting while you type.',
  'After each wire is cut there is a pause of a second or two; keys typed then are thrown away.',
  'A backspace becomes part of your answer, so a corrected typo still sets off the bomb.',
  'Only YES retires. Any other answer, even NO, brings the next bomb, faster.',
  'The program never uses RANDOM. The attract screen draws with random numbers, so the first bomb’s wires depend on when you press a key.',
  'Line 875 reads IF TN>RN(9) PRINT, with no THEN; Level II BASIC runs it.',
  'Rankings live only in memory: Restart clears them.',
  'Text such as yOU, kEEP and mR. TNT was typed with the shift key the wrong way round.'
];

// Describes v02 as played on this site; v01 is listed under Source.
export function instructions() {
  const history = `<section class="program-history"><h2>Probably 1981: a spelling test with a fuse</h2><p>Bomb shows you the wires to cut, one color at a time, and then makes you type them back, in order and spelled right, while the bomb ticks. Each bomb you defuse flashes the next one’s wires faster and gives you less time to answer.</p><p>Two versions survive on one tape side. In the first, Bomb is item 1 of a menu, next to a radio-station intersection program and some binary search research. The bomb-maker there is still called MR. XX, and the one high score is preset to 38 by CMK, my initials. The second version, played here, stands alone. The bomb-maker has a name, Thomas Nicholas Taggert, “known to the police as ‘Nefarious Nick’,” and the program borrows from the arcades: a flashing title screen that asks for a quarter, and a top-ten table that ranks you even after you blow up.</p><p class="small"><em>The date is an estimate. Neither version is dated; a program saved on both sides of the same tape says COPYRIGHT 1981.</em></p></section>`;
  const play = `<section><h2>Remember the wires. Spell them right.</h2><h3>Your first minute</h3><ol><li>Click the screen so it gets your keys.</li><li>At ${code('TO PLAY DEPOSIT $.25 IN BOX, THEN PRESS ANY BUTTON')} press any key (no quarter needed).</li><li>Press ${key('Enter')} on each of the two instruction pages.</li><li>Watch the box: three to five colors appear one after another, about two seconds each.</li><li>At ${code('WHAT IS THE FIRST WIRE?')} type the first color and press ${key('Enter')}. Then the second, and so on.</li></ol></section>`;
  const rules = `<section><h2>How it plays</h2><ul class="tips"><li>A bomb has 3 wires 3 times in 10, 4 wires half the time, and 5 wires 2 times in 10.</li><li>At first you have about 21 seconds to type each wire, typing included. Run out and the bomb goes off.</li><li>Type each color exactly as shown. There is no fixing a typo: a backspace is counted as part of the answer.</li><li>After a defused bomb, ${code('DO YOU WANT TO RETIRE?')}: ${code('YES')} ends the game; anything else brings the next bomb, with the wires shown and the time to answer both cut to three quarters.</li><li>Your score is the number of wires you have cut. If it makes the top ten, type your initials; a score set by blowing up is marked P (posthumous).</li><li>After each game it returns to the title screen and shows the rankings. Press any key to play again.</li></ul></section>`;
  const list = `<section><h2>The 38 colors</h2><p>${colors.map(code).join(' ')}</p><p class="small">Both GREY and GRAY are wires, and a bomb can use both.</p></section>`;
  const note = `<section><h2>This version</h2><p>v02, the standalone Nefarious Nick version, unchanged in the emulator. The menu version (v01) is kept as source: its Bomb has 35 colors, MR. XX, one high score and about 16 seconds per answer.</p></section>`;
  const odd = `<section class="program-differences"><h2>Quirks kept from the original</h2><p class="small">From reading the source; VERIFICATION.md records what was run.</p><ul class="tips">${quirks.map(q => `<li>${escape(q)}</li>`).join('')}</ul></section>`;
  return `${history}<div class="instruction-grid">${play}${rules}${list}${note}</div>${odd}`;
}

// Wires are typed letter by letter on your keyboard; these keys cover the rest.
export const onScreenKeys = () => [
  {label:'Keys', keys:[['Enter','Enter'],[' ','Any key']]}
];
export const quickHelp = () => 'Click the screen first so it gets your keys. Press any key at the title screen and Enter on each page. Remember the colors in the box, then type each one and press Enter. Typos cannot be fixed.';

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
}
