// Runs a recovered chess version headlessly and answers its prompts.
import fs from 'node:fs';
import {Trs80,Trs80Screen,Config,Keyboard,CassettePlayer,SilentSoundPlayer} from 'trs80-emulator';
import {decodeBasicProgram} from 'trs80-base';
class Screen extends Trs80Screen {setConfig(){} writeChar(){}}
export const programFolder=new URL('../../../programs/chess/',import.meta.url);
export function screenLines(m){
  return Array.from({length:16},(_,r)=>String.fromCharCode(...Array.from({length:64},(_,c)=>{const b=m.readMemory(0x3c00+r*64+c);return b<32?b+64:b>=128?(b===191?35:b===128?32:42):b;})).trimEnd());
}
// Starts a version on the site's configuration (Model III, Level II BASIC).
export function startOriginal(raw){
  const keyboard=new Keyboard();
  const m=new Trs80(Config.makeDefault(),new Screen(),keyboard,new CassettePlayer(),new SilentSoundPlayer());
  const run=seconds=>{const end=m.tStateCount+m.clockHz*seconds;while(m.tStateCount<end)m.step();};
  run(2);
  m.runBasicProgram(decodeBasicProgram(new Uint8Array(fs.readFileSync(new URL(raw,programFolder)))));
  // Waits until `pattern` matches the last non-blank screen line (the live prompt);
  // returns the emulated seconds taken. Prompts: /COLOR/, /COULMB\)\?/ (their move),
  // /^OK\?\?/ (confirm) and /^\?/ (ADD's R,C,V).
  const prompt=()=>screenLines(m).filter(Boolean).at(-1)??'';
  const until=(pattern,limitSeconds=600)=>{
    const start=m.tStateCount,limit=start+m.clockHz*limitSeconds;
    while(m.tStateCount<limit&&!pattern.test(prompt()))for(let i=0;i<20000;i++)m.step();
    const seconds=(m.tStateCount-start)/m.clockHz;
    if(!pattern.test(prompt()))throw new Error(`No ${pattern} after ${limitSeconds} s:\n${screenLines(m).join('\n')}`);
    // The prompt appears before INPUT starts reading keys.
    run(0.5);
    return seconds;
  };
  return {m,run,until,type:text=>keyboard.simulateKeyboardText(text),keyboard,screen:()=>screenLines(m).join('\n')};
}
