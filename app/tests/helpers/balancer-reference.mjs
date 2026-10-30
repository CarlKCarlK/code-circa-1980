// Runs a recovered balancer version headlessly and types an equation into it.
import fs from 'node:fs';
import {Trs80,Trs80Screen,Config,Keyboard,CassettePlayer,SilentSoundPlayer} from 'trs80-emulator';
import {decodeBasicProgram} from 'trs80-base';
class Screen extends Trs80Screen {setConfig(){} writeChar(){}}
export const programFolder=new URL('../../../programs/bal/',import.meta.url);
export function screenLines(m){
  return Array.from({length:16},(_,r)=>String.fromCharCode(...Array.from({length:64},(_,c)=>{const b=m.readMemory(0x3c00+r*64+c);return b<32?b+64:b>=128?32:b;})).trimEnd());
}
// Returns the screen once `done` matches it, and the emulated seconds the answer took.
export function runOriginal(raw,equation,done,limitSeconds=400){
  const keyboard=new Keyboard();
  const m=new Trs80(Config.makeDefault(),new Screen(),keyboard,new CassettePlayer(),new SilentSoundPlayer());
  const run=seconds=>{const end=m.tStateCount+m.clockHz*seconds;while(m.tStateCount<end)m.step();};
  run(2);
  m.runBasicProgram(decodeBasicProgram(new Uint8Array(fs.readFileSync(new URL(raw,programFolder)))));
  run(3);
  keyboard.simulateKeyboardText(equation+'\n');
  const start=m.tStateCount,limit=start+m.clockHz*limitSeconds;
  while(m.tStateCount<limit&&!done.test(screenLines(m).join('\n')))for(let i=0;i<20000;i++)m.step();
  return {lines:screenLines(m),seconds:(m.tStateCount-start)/m.clockHz};
}
