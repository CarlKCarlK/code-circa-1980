// Runs the recovered CISAB v14 headless: its opening, ADD, and the king-capture ending.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {startOriginal} from './helpers/chess-reference.mjs';

const raw='versions/v14/08-CISAB-CHESS-V9.BAS';
// The piece on a square as printed: a letter, then a block (shown as *) for White.
const square=(p,row,column)=>p.screen().split('\n')[row-1].padEnd(64).slice(column*6,column*6+3).trim();
const move=(p,text,answer='OK')=>{p.type(text+'\n');p.until(/^OK\?\?/);p.type(answer+'\n');};

test('CISAB v14 as White opens with its book moves',()=>{
  const p=startOriginal(raw);
  p.until(/COLOR ARE WE/);p.type('WHITE\n');
  assert.ok(p.until(/COULMB\)\?/)<15);
  assert.equal(square(p,6,3),'N *');assert.equal(square(p,8,2),'-');
  move(p,'2,5,4,5');
  assert.ok(p.until(/COULMB\)\?/)<15);
  assert.equal(square(p,4,5),'P');assert.equal(square(p,6,6),'N *');
});

test('CISAB v14 ADD puts a piece on a square and asks OK? again',()=>{
  const p=startOriginal(raw);
  p.until(/COLOR ARE WE/);p.type('BLACK\n');p.until(/COULMB\)\?/);
  move(p,'2,5,4,5','ADD');
  p.until(/^\?/);assert.match(p.screen(),/WE ARE NEG\. GIVE R,C,V/);
  p.type('5,4,2\n');p.until(/^OK\?\?/);
  assert.equal(square(p,5,4),'Q *');assert.equal(square(p,4,5),'P *');
});

test('CISAB v14 ends when its king is taken',()=>{
  const p=startOriginal(raw);
  p.until(/COLOR ARE WE/);p.type('BLACK\n');p.until(/COULMB\)\?/);
  p.type('2,4,8,4\n');p.until(/^>/,30);
  assert.match(p.screen(),/DARN THEY BEAT YOU!\nREADY/);
});
