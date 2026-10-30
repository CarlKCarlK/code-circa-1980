import fs from 'node:fs';
import {Trs80,Trs80Screen,Config,Keyboard,CassettePlayer,SilentSoundPlayer} from 'trs80-emulator';
import {decodeBasicProgram,parseBasicText} from 'trs80-base';
class Screen extends Trs80Screen {setConfig(){} writeChar(){}}
export function machine(){return new Trs80(Config.makeDefault(),new Screen(),new Keyboard(),new CassettePlayer(),new SilentSoundPlayer());}
export function runBasic(text,seconds=8,dependency=false){
 const m=machine();m.runBasicProgram(decodeBasicProgram(parseBasicText(text)));
 if(dependency)m.eventScheduler.add(undefined,m.clockHz*.31,()=>m.writeMemoryBlock(fallInfo.origin,fallBinary));
 while(m.tStateCount<m.clockHz*seconds&&m.readMemory(0x7e00)!==42)m.step();
 if(m.readMemory(0x7e00)!==42)throw Error('Reference BASIC did not reach sentinel: '+screenText(m));
 return m;
}
export const screenBytes=m=>Uint8Array.from({length:1024},(_,i)=>m.readMemory(0x3c00+i));
export const screenText=m=>Array.from(screenBytes(m),c=>c>=32&&c<128?String.fromCharCode(c):'#').join('');
const dependency=new URL('../../../programs/castles/dependencies/fall-v6/',import.meta.url);
export const fallBinary=new Uint8Array(fs.readFileSync(new URL('derived.bin',dependency)));
export const fallInfo=JSON.parse(fs.readFileSync(new URL('derived.json',dependency)));
export function measureFall(screen,row,entry='PRCES'){
 const m=machine();m.writeMemoryBlock(0x3c00,screen);m.writeMemoryBlock(fallInfo.origin,fallBinary);
 m.writeMemory(fallInfo.parameter_address,row);
 m.z80.regs.de=row*256; // Only used when calling FALL directly.
 m.z80.regs.sp=0x7000;m.writeMemory(0x7000,0);m.writeMemory(0x7001,0x60);
 m.jumpTo(fallInfo.symbols[entry]);
 while(m.z80.regs.pc!==0x6000&&m.tStateCount<100000000)m.step();
 if(m.z80.regs.pc!==0x6000)throw Error('FALL did not return');
 return {screen:screenBytes(m),cycles:m.tStateCount,clockHz:m.clockHz};
}
export function runFall(screen,row,entry='PRCES'){return measureFall(screen,row,entry).screen;}
