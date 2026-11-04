// Starts a program from its original disks headlessly, using the same machine and
// startup steps as the site's player.
import fs from 'node:fs';
import {Trs80,Trs80Screen,Config,ModelType,BasicLevel,CGChip,Keyboard,CassettePlayer,SilentSoundPlayer,RamSize} from 'trs80-emulator';
import {decodeTrs80File} from 'trs80-base';
import {withModel1Disks} from '../../site/model1-disks.js';
import {runDiskSteps,screenText} from '../../site/disk-session.js';
class Screen extends Trs80Screen {setConfig(){} writeChar(){}}
const Machine=withModel1Disks(Trs80);
export function startFromDisk(id){
  const folder=new URL(`../../../programs/${id}/`,import.meta.url);
  const meta=JSON.parse(fs.readFileSync(new URL('program.json',folder)));
  const version=meta.versions.find(v=>v.id===meta.defaultVersion);
  const disks=version.disk.images.map(p=>decodeTrs80File(new Uint8Array(fs.readFileSync(new URL(p,folder))),p));
  const keyboard=new Keyboard();
  const config=Config.makeDefault().withModelType(ModelType.MODEL1).withBasicLevel(BasicLevel.LEVEL2).withCGChip(CGChip.ORIGINAL).withRamSize(RamSize.RAM_48_KB);
  const m=new Machine(config,new Screen(),keyboard,new CassettePlayer(),new SilentSoundPlayer());
  m.loadFloppyDisk(disks[0],0);m.reset();
  let ready=false;runDiskSteps(m,keyboard,disks,version.disk.steps,()=>{ready=true;});
  const run=seconds=>{const end=m.tStateCount+m.clockHz*seconds;while(m.tStateCount<end)m.step();};
  const screen=()=>screenText(m);
  const graphics=()=>Array.from({length:1024},(_,i)=>m.readMemory(0x3c00+i)).filter(c=>c>128&&c<192).length;
  const startup=(limit=240)=>{for(let t=0;t<limit&&!ready;t+=0.25)run(0.25);if(!ready)throw Error(`${id}: startup did not finish:\n${screen()}`);};
  const until=(pattern,limit=30)=>{for(let t=0;t<limit&&!pattern.test(screen());t+=0.1)run(0.1);if(!pattern.test(screen()))throw Error(`${id}: no ${pattern}:\n${screen()}`);};
  const press=key=>{keyboard.keyEvent(key,true);run(0.08);keyboard.keyEvent(key,false);run(0.08);};
  const type=text=>{for(const k of text)press(k==='\n'?'Enter':k.toLowerCase());};
  return {m,run,screen,graphics,startup,until,press,type};
}
