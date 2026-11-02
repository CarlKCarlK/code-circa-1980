// Reproducible original-ROM check; no recovered file or payload byte is changed.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {Trs80,Trs80Screen,Config,ModelType,BasicLevel,Keyboard,CassettePlayer,SilentSoundPlayer} from 'trs80-emulator';
import {decodeBasicProgram,parseBasicText} from 'trs80-base';
class Screen extends Trs80Screen{setConfig(){} writeChar(){}}
const make=()=>new Trs80(Config.makeDefault().withModelType(ModelType.MODEL3).withBasicLevel(BasicLevel.LEVEL2),new Screen(),new Keyboard(),new CassettePlayer(),new SilentSoundPlayer());
const text=m=>String.fromCharCode(...Array.from({length:1024},(_,i)=>m.readMemory(0x3c00+i)));
const advance=(m,seconds)=>{const until=m.tStateCount+m.clockHz*seconds;while(m.tStateCount<until)m.step();};
const arithmetic=make();arithmetic.runBasicProgram(decodeBasicProgram(parseBasicText('10 PRINT 2[3:POKE 32256,42:END')));
for(let i=0;i<80&&arithmetic.readMemory(32256)!==42;i++)advance(arithmetic,.1);
assert.equal(arithmetic.readMemory(32256),42);assert.match(text(arithmetic),/\b8\b/);
const bytes=fs.readFileSync(new URL('../../programs/starwars81/versions/v02/02-STAR-WARS-THEMED-GAME.BAS',import.meta.url));
const m=make();m.runBasicProgram(decodeBasicProgram(bytes));
for(let i=0;i<50&&!text(m).includes('CODE');i++)advance(m,.2);
assert.ok(text(m).includes('CODE'));m.keyboard.simulateKeyboardText('1\n');advance(m,1);
m.keyboard.keyEvent(' ',true);advance(m,.2);m.keyboard.keyEvent(' ',false);
for(let i=0;i<120&&!/\d/.test(text(m).slice(250,255));i++)advance(m,.5);
assert.match(text(m).slice(250,255),/\d/);
const radar=()=>Array.from({length:192},(_,i)=>m.readMemory(0x3c00+i)).filter((_,i)=>i%64>=54);
const before=radar();m.keyboard.keyEvent('ArrowLeft',true);advance(m,3);m.keyboard.keyEvent('ArrowLeft',false);advance(m,.2);
assert.notDeepEqual(radar(),before);assert.doesNotMatch(text(m),/\?(?:SN|FC|BS) Error/i);
console.log(JSON.stringify({operator:'2[3',result:8,source:'tape30a save 2',sha256:createHash('sha256').update(bytes).digest('hex'),cockpit_started:true,arrow_left_changes_radar:true},null,2));
