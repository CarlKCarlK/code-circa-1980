// Records what the original 3-D Plot v03 draws in the emulator for several answers
// and line-200 formulas. tests/plot3d-engine.test.mjs compares the TypeScript engine
// with these screens. Run: npm run record:plot3d (takes a few minutes).
import fs from 'node:fs';
import {Trs80,Trs80Screen,Config,Keyboard,CassettePlayer,SilentSoundPlayer} from 'trs80-emulator';
import {decodeBasicProgram} from 'trs80-base';
import {cases} from '../../programs/plot3d/typescript/parity-cases.js';
import {line200Keys} from '../../programs/plot3d/typescript/formulas.js';
class Screen extends Trs80Screen {setConfig(){} writeChar(){}}
const folder=new URL('../../programs/plot3d/',import.meta.url);
const raw=fs.readFileSync(new URL('versions/v03/01-3D-PLOT-1979.BAS',folder));


function runCase({answers,formula}){
  const keyboard=new Keyboard();
  const m=new Trs80(Config.makeDefault(),new Screen(),keyboard,new CassettePlayer(),new SilentSoundPlayer());
  const run=seconds=>{const end=m.tStateCount+m.clockHz*seconds;while(m.tStateCount<end)m.step();};
  run(2);m.runBasicProgram(decodeBasicProgram(new Uint8Array(raw)));run(2);
  // The same keys the BASIC player's line-200 box sends.
  if(formula){for(const k of line200Keys(formula)){keyboard.keyEvent(k,true);keyboard.keyEvent(k,false);}run(8);}
  for(const answer of answers){keyboard.simulateKeyboardText(`${answer}\n`);run(1);}
  const start=m.tStateCount;
  const text=()=>Array.from({length:1024},(_,i)=>m.readMemory(0x3c00+i));
  // Done when D appears at the top left, or BASIC stops with an error.
  for(;;){
    run(0.5);
    const screen=text();
    if(screen[0]===68)break;
    const words=String.fromCharCode(...screen.map(c=>c<128?c:32));
    const error=/\?(\S\S) Error in (\d+)/i.exec(words);
    if(error)return {error:error[1],errorLine:Number(error[2])};
    if((m.tStateCount-start)/m.clockHz>900)throw Error('timed out');
  }
  const seconds=Math.round((m.tStateCount-start)/m.clockHz);
  // 128 × 48 dots, one string per row; the D's character cell (dots 0-1, 0-2) is skipped.
  const rows=Array.from({length:48},(_,y)=>Array.from({length:128},(_,x)=>{
    if(x<2&&y<3)return '.';
    const c=m.readMemory(0x3c00+Math.floor(y/3)*64+Math.floor(x/2));
    return c>=128&&c&(1<<((y%3)*2+(x%2)))?'#':' ';
  }).join(''));
  return {seconds,rows};
}

if(import.meta.url===`file://${process.argv[1]}`){
  const fixtures=[];
  for(const c of cases){
    const t=Date.now();const result=runCase(c);
    fixtures.push({...c,...result});
    console.log(c.name,result.error??`${result.seconds} emulated s`,`(${((Date.now()-t)/1000).toFixed(0)} s)`);
  }
  fs.writeFileSync(new URL('typescript/parity-fixtures.json',folder),JSON.stringify({recorded:new Date().toISOString().slice(0,10),emulator:'trs80-emulator 2.3.1, Model III Level II',fixtures},null,1)+'\n');
}
