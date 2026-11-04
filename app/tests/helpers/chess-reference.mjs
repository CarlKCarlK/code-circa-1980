// Runs a recovered chess version headlessly and answers its prompts.
import fs from 'node:fs';
import {Trs80,Trs80Screen,Config,Keyboard,CassettePlayer,SilentSoundPlayer} from 'trs80-emulator';
import {decodeBasicProgram,parseBasicText} from 'trs80-base';
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
  // returns the emulated seconds taken. Prompts: /COLOR/, /COLUMN\)\?/ (their move),
  // /^OK\?/ (confirm) and /^\?/ (ADD's R,C,V).
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
// B(0-10,0-10) as rows, read from BASIC's array storage (40FBh-40FDh). Each entry is
// a type byte, the name (second letter first), a length, the subscripts, then the
// values with the first subscript varying fastest.
export function readBoard(m){
  const w=a=>m.readMemory(a)|m.readMemory(a+1)<<8;
  for(let a=w(0x40fb),end=w(0x40fd);a<end;a+=5+w(a+3)){
    if(m.readMemory(a+1)!==0||m.readMemory(a+2)!==0x42)continue;
    const data=a+6+2*m.readMemory(a+5);
    return Array.from({length:11},(_,r)=>Array.from({length:11},(_,c)=>{
      const p=data+(r+11*c)*4,e=m.readMemory(p+3);
      if(!e)return 0;
      const hi=m.readMemory(p+2),mant=((hi|0x80)<<16)|m.readMemory(p+1)<<8|m.readMemory(p);
      return (hi&0x80?-1:1)*mant*2**(e-152);
    }));
  }
  throw Error('No B array');
}
// The RND seed at 40AAh-40ACh.
export const readSeed=m=>m.readMemory(0x40aa)|m.readMemory(0x40ab)<<8|m.readMemory(0x40ac)<<16;
// Runs a short Level II BASIC program to READY; returns the machine.
export function runBasicText(text,limitSeconds=600){
  const keyboard=new Keyboard();
  const m=new Trs80(Config.makeDefault(),new Screen(),keyboard,new CassettePlayer(),new SilentSoundPlayer());
  const run=seconds=>{const end=m.tStateCount+m.clockHz*seconds;while(m.tStateCount<end)m.step();};
  run(2);
  m.runBasicProgram(decodeBasicProgram(parseBasicText(text)));
  const start=m.tStateCount;
  for(;;){
    run(0.5);
    const after=screenLines(m).join('\n').split(/RUN\n/).slice(1).join('');
    if(/READY|Error/.test(after))return m;
    if((m.tStateCount-start)/m.clockHz>limitSeconds)throw Error(`No READY after ${limitSeconds} s`);
  }
}
export const memory=(m,address,length)=>Array.from({length},(_,i)=>m.readMemory(address+i));
// CISAB's step loops (lines 410-500 and 560-650) with R=C=0, poked from A000h.
export const stepsProgram=`10 DEFINT C,R,H
20 W=-24576:R=0:C=0:PI=3.14159
40 FOR T=1 TO 3
45 IF T=1 THEN SP=PI/2:SI=0 ELSE IF T=2 THEN SP=PI/2:SI=PI/4 ELSE SP=PI/4:SI=0
50 FOR A=SITO2*PI-.01 STEP SP
60 FOR M=1TO12STEP.5
70 RN=INT(COS(A)*M+.5)+R:CN=INT(.5+SIN(A)*M)+C
80 POKE W,RN+128:POKE W+1,CN+128:W=W+2
90 NEXT M
100 POKE W,255:W=W+1:NEXT A
105 POKE W,254:W=W+1:NEXT T
110 FOR A=PI/2 TO 2*PISTEP PI/2
120 FOR AF=-1TO1STEP2
130 RN=R+INT(.5+COS(A)*2+AF*SIN(A)):CN=C+INT(.5+SIN(A)*2+AF*COS(A))
140 POKE W,RN+128:POKE W+1,CN+128:W=W+2
150 NEXT AF,A
160 POKE W,253
`;
export function readSteps(m){
  const b=memory(m,0xa000,1400);let i=0;const out={};
  for(const name of ['rook','bishop','queen']){const dirs=[];let d=[];for(;;){const x=b[i++];if(x===254)break;if(x===255){dirs.push(d);d=[];continue;}d.push([x-128,b[i++]-128]);}out[name]=dirs;}
  out.knight=[];while(b[i]!==253){out.knight.push([b[i]-128,b[i+1]-128]);i+=2;}
  return out;
}
// Every score lines 3000-3030 and 1205 can produce, in the order of score_table() in lib.rs.
export const scoresProgram=`10 DIM V(6):FOR I=0TO6:READ V(I):NEXT:DATA .5,100,9,3,3,5,1
20 W=-24576
30 FOR PI=0TO6:P1=V(PI):FOR Q=1TO2:QQ=1:IF Q=2 THEN QQ=9
40 FOR K=0TO6:FOR F=0TO8
50 IF K=0 THEN P2=.5 ELSE P2=V(K)
60 IF F=0 THEN P2=P2*.91 ELSE IF F<8 THEN FV=1:P2=P2+V(F-1)*FV
70 IF P1=100 THEN P2=.5
80 D=P1*QQ/P2:X=D:GOSUB 500
90 FOR VI=1TO5:VA=1:IF VI=2 THEN VA=3 ELSE IF VI=3 THEN VA=5 ELSE IF VI=4 THEN VA=9 ELSE IF VI=5 THEN VA=100
95 X=-ABS(D)/VA:GOSUB 500:NEXT VI
100 NEXT F,K,Q,PI
110 END
500 V=VARPTR(X):FOR I=0TO3:POKE W,PEEK(V+I):W=W+1:NEXT:RETURN
`;
export const SCORE_COUNT=7*2*7*9*6;
// RND(N) for N = 1, 2, … 120, 1, … then the seed, as rnd_sequence() in lib.rs.
export const rndProgram=count=>`10 W=-24576
20 FOR I=1TO${count}:N=I-INT(I/120)*120+1:POKE W,RND(N):W=W+1:NEXT
30 POKE W,PEEK(16554):POKE W+1,PEEK(16555):POKE W+2,PEEK(16556)
`;
