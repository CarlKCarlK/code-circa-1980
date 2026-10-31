// Runs the recovered Bomb versions headless: attract screen, a defused bomb, and the ways to blow up.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {startOriginal} from './helpers/bomb-reference.mjs';

const v02='versions/v02/03-BOMB-NEFARIOUS-NICK.BAS', v01='versions/v01/01-BOMB-RADIO-INTERSECTION-BINARY-SEARCH.BAS';
// A Model I shows the cursor as _ after a prompt.
const prompts=[/FIRST WIRE\? *_?$/m,/SECOND WIRE\? *_?$/m,/THIRD WIRE\? *_?$/m,/FOURTH WIRE\? *_?$/m,/CUT NOW\? *_?$/m];
// v02 from the attract screen to its first set of wires (row 9 is inside the box).
function firstBomb(){
  const p=startOriginal(v02);
  p.until(/TO PLAY DEPOSIT \$\.25 IN BOX, THEN PRESS ANY BUTTON/,10);p.press(' ');
  p.until(/NEFARIOUS NICK/,5);p.press('Enter');
  p.until(/THE BOMB IS TICKING/,5);
  // The Model I ROM shows the source's shifted letters (yOU) as capitals.
  assert.match(p.screen(),/BOMB\.  YOU WILL BE TOLD/);
  p.press('Enter');
  p.until(/WIRES IN THE PROPER ORDER/,10);
  const count=+p.screen().match(/YOU MUST CUT (\d) +WIRES/)[1];
  const shown=p.watchWires(9,prompts[0]);
  assert.equal(shown.words.length,count);
  return {p,...shown};
}

test('Bomb v02: defuse a bomb by typing the wires back, then retire into the rankings',()=>{
  const {p,words,onsets}=firstBomb();
  assert.ok(words.length>=3&&words.length<=5);
  // At the starting speed each wire stays up for about 2.06 emulated seconds on a Model I.
  for(let i=1;i<onsets.length;i++)assert.ok(Math.abs(onsets[i]-onsets[i-1]-2.06)<0.15,`${onsets}`);
  words.forEach((word,i)=>{p.until(prompts[i],15);p.type(word+'\n');});
  p.until(/DO YOU WANT TO RETIRE\?/,15);
  assert.match(p.screen(),new RegExp(`SO FAR YOU HAVE CUT ${words.length} +WIRES`));
  assert.match(p.screen(),/YOU ARE CURRENTLY RANKED NUMBER 1/);
  p.type('YES\n');
  p.until(/WHAT ARE YOUR INITIALS\?/,5);p.type('CMK\n');
  p.until(/R +A +N +K +I +N +G +S/,5);
  // Double-width text (CHR$(23)) puts every character in every other column.
  assert.match(p.screen(),new RegExp(`^ +1 +${words.length} +C M K$`,"m"));
});

test('Bomb v02: a typo fixed with backspace still sets off the bomb',()=>{
  const {p,words}=firstBomb();
  p.until(prompts[0],15);
  p.type(words[0].slice(0,-1)+'X');p.press('Backspace');p.type(words[0].at(-1)+'\n');
  p.until(/B O O M !!!/,5);
  p.until(new RegExp(`^ +${words.at(-1)}$`,'m'),10);
  for(const word of words)assert.match(p.screen(),new RegExp(`^ +${word}$`,'m'));
  // No wires were cut, so no ranking: back to the attract screen.
  p.until(/TO PLAY DEPOSIT/,20);
});

test('Bomb v02: waiting at a wire prompt runs out the clock after about 23 seconds',()=>{
  const {p}=firstBomb();
  p.until(prompts[0],15);
  const seconds=p.until(/B O O M !!!/,40);
  assert.ok(seconds>21&&seconds<25,`${seconds}`);
});

test('Bomb v01: the menu starts Bomb, with its preset high score of 38 by CMK',()=>{
  const p=startOriginal(v01);
  p.until(/3\) BINARY SEARCH/,10);p.type('1\n');
  p.until(/MR\. XX/,5);p.press('Enter');
  p.until(/G O O D   L U C K/,5);p.press('Enter');
  p.until(/HERE ARE THE WIRES/,10);
  const {words}=p.watchWires(8,/FIRST WIRE IS \? *_?$/m);
  assert.ok(words.length>=3&&words.length<=5,`${words}`);
  // Answer the first wire wrongly.
  p.type('PLAID\n');p.until(/B  O  O  M/,10);
  p.until(/SHALL I DO THIS\?/,15);
  assert.match(p.screen(),/HIGH SCORE IS 38  BY CMK/);
  for(const word of words)assert.match(p.screen(),new RegExp(`^${word}$`,'m'));
});
