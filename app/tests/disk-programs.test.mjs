// Boots original disks through the real ROM with the player's own startup steps.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {startFromDisk} from './helpers/disk-machine.mjs';
console.warn=()=>{};console.error=()=>{};

test('NEWDOS/80 boots the Games Diskette into its menu and runs Coldwar',()=>{
  const p=startFromDisk('presidential-crisis-game');p.startup();
  p.until(/WELCOME TO THE WHITE HOUSE/);
});
test('MMSFORTH boots, loads a program from a second disk, and runs Growth',()=>{
  const p=startFromDisk('growth');p.startup();
  p.until(/WHICH STATEGY/,40);
});
test('TRSDOS reads its directory and LISP differentiates (X * X)',()=>{
  const p=startFromDisk('deriv');p.startup();
  p.type('(X * X)\n');p.run(2);p.type('X\n');
  p.until(/\( 2 \* X\)/,20);
});
