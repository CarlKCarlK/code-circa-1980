// Runs a recovered Bomb version headlessly, reads the wires it flashes, and types them back.
import fs from 'node:fs';
import {Trs80,Trs80Screen,Config,Keyboard,CassettePlayer,SilentSoundPlayer} from 'trs80-emulator';
import {decodeBasicProgram} from 'trs80-base';
class Screen extends Trs80Screen {setConfig(){} writeChar(){}}
export const programFolder=new URL('../../../programs/bomb/',import.meta.url);
// Graphics characters read as spaces.
export function screenLines(m){
  return Array.from({length:16},(_,r)=>String.fromCharCode(...Array.from({length:64},(_,c)=>{const b=m.readMemory(0x3c00+r*64+c);return b<32?b+64:b>=128?32:b;})).trimEnd());
}
// Starts a version on the site's configuration (Model III, Level II BASIC).
export function startOriginal(raw){
  const keyboard=new Keyboard();
  const m=new Trs80(Config.makeDefault(),new Screen(),keyboard,new CassettePlayer(),new SilentSoundPlayer());
  const run=seconds=>{const end=m.tStateCount+m.clockHz*seconds;while(m.tStateCount<end)m.step();};
  const seconds=()=>m.tStateCount/m.clockHz;
  const screen=()=>screenLines(m).join('\n');
  run(2);
  m.runBasicProgram(decodeBasicProgram(new Uint8Array(fs.readFileSync(new URL(raw,programFolder)))));
  // Waits until `pattern` matches the screen; returns the emulated seconds taken.
  const until=(pattern,limitSeconds=60)=>{
    const start=seconds();
    while(seconds()-start<limitSeconds&&!pattern.test(screen()))run(0.02);
    if(!pattern.test(screen()))throw new Error(`No ${pattern} after ${limitSeconds} s:\n${screen()}`);
    const taken=seconds()-start;
    // A prompt appears just before the program clears pending keys and starts reading.
    run(0.3);
    return taken;
  };
  // Bomb reads answers with INKEY$, which misses keys that are not held for a while
  // (string handling can make one pass of its loop slow), so each key is held for
  // 0.1 s, as a typist would.
  const press=key=>{keyboard.keyEvent(key,true);run(0.1);keyboard.keyEvent(key,false);run(0.1);};
  const type=text=>{for(const key of text)press(key==='\n'?'Enter':key);};
  // Records each word that stays on screen row `row` for 0.2 s until `stop` matches.
  const watchWires=(row,stop,limitSeconds=60)=>{
    const words=[],onsets=[];let last='',since=0;const start=seconds();
    while(!stop.test(screen())){
      if(seconds()-start>limitSeconds)throw new Error(`No ${stop} after ${limitSeconds} s`);
      run(0.02);const word=screenLines(m)[row].trim();
      if(word!==last){last=word;since=seconds();}
      else if(word&&seconds()-since>0.2&&words.at(-1)!==word){words.push(word);onsets.push(since-start);}
    }
    return {words,onsets};
  };
  return {m,run,until,press,type,watchWires,screen,keyboard};
}
