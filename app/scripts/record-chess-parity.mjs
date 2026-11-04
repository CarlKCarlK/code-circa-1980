// Plays games against CISAB v14 (as corrected for the site) in the emulator and records, after
// every typed line, the prompt, the whole B array, the RND seed and the adjective.
// tests/chess-rust.test.mjs replays the same lines into the Rust engine.
// Your moves are chosen at random (seeded) from the legal ones; some games answer
// IQ, mistype, cheat, castle, take en passant or promote, to cover those paths.
// Run: npm run record:chess (several minutes). Prints any divergence at once.
import fs from 'node:fs';
import {startOriginal,readBoard,readSeed,screenLines,programFolder,runBasicText,memory,stepsProgram,readSteps,scoresProgram,SCORE_COUNT,rndProgram} from '../tests/helpers/chess-reference.mjs';
const pkg=new URL('rust/pkg/',programFolder);
const {initSync,Engine,legal_moves_json}=await import(new URL('cisab_chess.js',pkg));
initSync({module:fs.readFileSync(new URL('cisab_chess_bg.wasm',pkg))});
// The site's BASIC version: v14 with its corrections (programs/chess/corrected/).
const raw='corrected/CHESS.BAS';

export const cases=[
  {name:'white-book',we:'WHITE',seed:1,moves:12},
  {name:'black-book',we:'BLACK',seed:2,moves:12},
  {name:'black-iq',we:'BLACK',seed:3,moves:20,iq:true},
  {name:'white-iq',we:'WHITE',seed:4,moves:20,iq:true},
  {name:'black-captures',we:'BLACK',seed:5,moves:30,iq:true,greedy:true},
  {name:'white-captures',we:'WHITE',seed:6,moves:30,greedy:true},
  {name:'black-quirks',we:'BLACK',seed:7,moves:30,iq:true,greedy:true,quirks:true},
  {name:'white-quirks',we:'WHITE',seed:8,moves:30,greedy:true,quirks:true},
  {name:'black-long',we:'BLACK',seed:9,moves:60,iq:true,greedy:true},
  {name:'white-long',we:'WHITE',seed:10,moves:60,greedy:true,quirks:true},
  ...Array.from({length:8},(_,i)=>({name:`random-${i+11}`,we:i%2?'WHITE':'BLACK',seed:i+11,moves:80,iq:i%3===0,greedy:i%4!==3,quirks:i%2===0})),
  // Line 100: a move onto its king ends the game before OK?.
  {name:'take-king',lines:['BLACK','1,4,8,4']},
  // ADD makes a back-rank mate; every move loses the king, so lines 1010-1220 repeat forever.
  {name:'checkmated',lines:['BLACK','2,1,3,1','ADD','8,1,5','ADD','8,2,0','ADD','8,3,0','IQ']},
  // With its opening squares emptied by ADD, line 9540 ends the opening and CISAB thinks.
  {name:'opening-runs-out',lines:['WHITE','2,1,3,1','ADD','8,7,0','ADD','7,5,0','ADD','8,6,0','OK']},
  // A second ADD repeats line 110 with RN, CN, RO and CO all 0; NO asks for the move again.
  {name:'add-twice-and-no',lines:['BLACK','2,5,4,5','NO','2,5,4,5','ADD','3,3,4','ADD','0,0,0','OK','1,7,3,6','OK']},
];

function random(seed){let s=seed*2654435761>>>0;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return (s>>>0)/2**32;};}

// The live prompt, or how the program stopped.
function status(m){
  const lines=screenLines(m),text=lines.join('\n'),last=lines.filter(Boolean).at(-1)??'';
  const error=/\?(\w\w) Error in (\d+)/.exec(text);
  if(error)return {prompt:'ended',end:`?${error[1]} Error in ${error[2]}`};
  if(/DARN THEY BEAT YOU!/.test(text)&&/READY/.test(text))return {prompt:'ended',end:'DARN THEY BEAT YOU!'};
  if(/STALEMATE/.test(text)&&/READY/.test(text))return {prompt:'ended',end:"I CAN'T MOVE.  STALEMATE"};
  if(/COLUMN\)\? *$/.test(last))return {prompt:'move',adjective:/THEIR (\w+) MOVE/.exec(last)[1]};
  if(/^OK\? \(Y\/N, ENTER=Y\)\? *$/.test(last))return {prompt:'ok'};
  if(/^\? *$/.test(last))return {prompt:'add'};
  if(/COLOR ARE WE\? *$/.test(last))return {prompt:'color'};
  return null;
}

function observe(o,limit){
  const start=o.m.tStateCount;
  let s;
  while(!(s=status(o.m))){
    o.run(1);
    if((o.m.tStateCount-start)/o.m.clockHz>limit)return {prompt:'thinking',seconds:limit};
  }
  o.run(0.5);
  return {...s,seconds:Math.round((o.m.tStateCount-start)/o.m.clockHz),board:readBoard(o.m),seed:readSeed(o.m)};
}

const endText=end=>end?.kind==='forever'?'forever':end?.text;
function compare(rec,snap,line){
  const problems=[];
  if(rec.prompt==='thinking'){if(snap.end?.kind!=='forever')problems.push('original still thinking; Rust did not loop');return problems;}
  if(rec.prompt!==snap.prompt)problems.push(`prompt ${rec.prompt} vs ${snap.prompt}`);
  if(rec.end&&rec.end!==endText(snap.end))problems.push(`end ${rec.end} vs ${endText(snap.end)}`);
  if(JSON.stringify(rec.board)!==JSON.stringify(snap.board))problems.push('board differs');
  if(rec.seed!==snap.seed)problems.push(`seed ${rec.seed} vs ${snap.seed}`);
  if(rec.adjective&&rec.adjective!==snap.adjectiveWord)problems.push(`adjective ${rec.adjective} vs ${snap.adjectiveWord}`);
  return problems.map(p=>`after ${JSON.stringify(line)}: ${p}`);
}
const ADJ=['FOOLISH','DESPERATE','IRREDEEMABLE','LUDICROUS','SERIOCOMIC','DROLL','RIDICULOUS','WHIMSICAL','PREPOSTEROUS','ABSURD'];
export const snapshot=engine=>{const s=JSON.parse(engine.snapshot());return {...s,adjectiveWord:ADJ[s.adjective-1]};};

function play(c){
  const o=startOriginal(raw),rand=random(c.seed),engine=new Engine();
  const steps=[];let problems=[];
  const send=(line,limit=3600)=>{
    o.type(`${line}\n`);
    // Let the keys reach INPUT before looking for the next prompt.
    o.run(0.5+0.1*line.length);
    let events=[];try{events=JSON.parse(engine.input(line));}catch(e){problems.push(String(e));}
    const snap=snapshot(engine);
    const rec=observe(o,snap.end?.kind==='forever'?900:limit);
    steps.push({line,...rec});
    problems.push(...compare(rec,snap,line));
    return rec;
  };
  let state=observe(o,30);
  if(c.lines){for(const line of c.lines)if(state.prompt!=='ended'&&state.prompt!=='thinking')state=send(line);return {name:c.name,steps,problems};}
  let rights={col1:true,col8:true},passant=0,lastBoard=state.board;
  state=send(c.we);
  for(let n=0;n<c.moves&&state.prompt==='move'&&!problems.length;n++){
    const b=state.board;
    // A pawn of CISAB's that just stepped two squares can be taken en passant.
    passant=0;
    for(let col=1;col<=8;col++)for(let r=1;r<=6;r++)if(b[r][col]===-6&&lastBoard[r+2]?.[col]===-6&&lastBoard[r][col]===0&&b[r+2][col]===0&&lastBoard[r+1][col]===0)passant=(r+1)*16+col;
    if(b[1][1]!==5)rights.col1=false;
    if(b[1][8]!==5)rights.col8=false;
    const moves=JSON.parse(legal_moves_json(Int8Array.from(b.flat()),rights.col1,rights.col8,passant));
    if(!moves.length)break;
    if(c.quirks&&rand()<0.08){
      // A square without one of your pieces: CHEAT, then a new adjective.
      const empty=[];for(let r=3;r<=6;r++)for(let col=1;col<=8;col++)if(b[r][col]<=0)empty.push([r,col]);
      const [r,col]=empty[Math.floor(rand()*empty.length)];
      state=send(`${r},${col},${r},${col}`);continue;
    }
    const special=moves.filter(m=>m.rook||m.passant||m.promotes);
    const captures=moves.filter(m=>b[m.to[0]][m.to[1]]<0);
    const pool=special.length&&rand()<0.7?special:c.greedy&&captures.length&&rand()<0.6?captures:moves;
    const m=pool[Math.floor(rand()*pool.length)];
    state=send(`${m.from.join(',')},${m.to.join(',')}`);
    if(state.prompt!=='ok')continue;
    if(c.quirks&&rand()<0.08){state=send('NO');continue;}
    const edits=[];
    if(m.rook)edits.push([...m.rook[1],5],[...m.rook[0],0]);
    if(m.passant)edits.push([...m.passant,0]);
    if(m.promotes)edits.push([...m.to,[2,5,3,4][Math.floor(rand()*4)]]);
    for(const e of edits){send('ADD');send(e.join(','));}
    if(b[m.from[0]][m.from[1]]===1){rights={col1:false,col8:false};}
    for(const sq of [m.from,m.to]){if(sq[0]===1&&sq[1]===1)rights.col1=false;if(sq[0]===1&&sq[1]===8)rights.col8=false;}
    lastBoard=steps.at(-1).board;
    state=send(c.iq&&n===0?'IQ':'OK');
  }
  return {name:c.name,steps,problems};
}

// What the ROM computes for CISAB's steps, scores and RND, independent of any game.
export function recordArithmetic(){
  const hex=bytes=>Buffer.from(bytes).toString('hex');
  const steps=readSteps(runBasicText(stepsProgram));
  const scores=hex(memory(runBasicText(scoresProgram,3000),0xa000,SCORE_COUNT*4));
  const rnd=hex(memory(runBasicText(rndProgram(3000),3000),0xa000,3003));
  return {steps,scores,rnd};
}

if(import.meta.url===`file://${process.argv[1]}`){
  const fixture=new URL('modern/parity-fixtures.json',programFolder);
  const only=process.argv[2];
  if(only==='--arithmetic'){
    const f=JSON.parse(fs.readFileSync(fixture));
    fs.writeFileSync(fixture,JSON.stringify({...f,arithmetic:recordArithmetic()})+'\n');
    process.exit(0);
  }
  const games=[];
  for(const c of cases.filter(c=>!only||c.name===only)){
    const t=Date.now();const g=play(c);games.push({...c,steps:g.steps});
    const last=g.steps.at(-1);
    console.log(c.name,`${g.steps.length} lines,`,last.end??last.prompt,`(${((Date.now()-t)/1000).toFixed(0)} s)`,g.problems.length?`\n  DIVERGES: ${g.problems.slice(0,3).join('\n  ')}`:'matches Rust');
  }
  if(!only)fs.writeFileSync(fixture,JSON.stringify({recorded:new Date().toISOString().slice(0,10),emulator:'trs80-emulator 2.3.1, Model III Level II',program:raw,arithmetic:recordArithmetic(),games})+'\n');
}
