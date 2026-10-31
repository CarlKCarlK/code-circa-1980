// The Rust CISAB engine against the original v14: recorded games, the ROM's
// arithmetic, and a short game running now in the emulator.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {sourceHashes} from '../scripts/build-chess.mjs';
import {programFolder,runBasicText,stepsProgram,readSteps,startOriginal,readBoard,readSeed} from './helpers/chess-reference.mjs';
const pkg=new URL('rust/pkg/',programFolder);
const {initSync,Engine,Game,steps_json,score_table,rnd_sequence}=await import(new URL('cisab_chess.js',pkg));
initSync({module:fs.readFileSync(new URL('cisab_chess_bg.wasm',pkg))});
const fixtures=JSON.parse(fs.readFileSync(new URL('modern/parity-fixtures.json',programFolder)));
const ADJ=['FOOLISH','DESPERATE','IRREDEEMABLE','LUDICROUS','SERIOCOMIC','DROLL','RIDICULOUS','WHIMSICAL','PREPOSTEROUS','ABSURD'];
const endText=end=>end?.kind==='forever'?'forever':end?.text;

test('committed WebAssembly was built from the current Rust sources',()=>{
  const build=JSON.parse(fs.readFileSync(new URL('build.json',pkg)));
  assert.deepEqual(build.sources,sourceHashes(),'Run npm run build:chess');
  assert.equal(createHash('sha256').update(fs.readFileSync(new URL('cisab_chess_bg.wasm',pkg))).digest('hex'),build.wasm_sha256);
});

test('steps, scores and RND match what the ROM computed',()=>{
  const {steps,scores,rnd}=fixtures.arithmetic;
  assert.deepEqual(JSON.parse(steps_json()),steps);
  assert.equal(Buffer.from(score_table()).toString('hex'),scores);
  assert.equal(Buffer.from(rnd_sequence(3000)).toString('hex'),rnd);
});

test('Rust engine replays every recorded game: boards, RND seeds, adjectives and endings',()=>{
  let lines=0;
  for(const game of fixtures.games){
    const engine=new Engine();
    for(const step of game.steps){
      engine.input(step.line);lines++;
      const s=JSON.parse(engine.snapshot()),where=`${game.name} after ${JSON.stringify(step.line)} (line ${lines})`;
      if(step.prompt==='thinking'){assert.equal(endText(s.end),'forever',where);continue;}
      assert.equal(s.prompt,step.prompt,where);
      assert.deepEqual(s.board,step.board,where);
      assert.equal(s.seed,step.seed,where);
      if(step.adjective)assert.equal(ADJ[s.adjective-1],step.adjective,where);
      if(step.end)assert.equal(endText(s.end),step.end,where);
    }
  }
  assert.ok(lines>500,`only ${lines} lines recorded`);
});

test('steps match the ROM running now',()=>{
  assert.deepEqual(JSON.parse(steps_json()),readSteps(runBasicText(stepsProgram)));
});

test('Rust engine matches v14 running now through a searched move',()=>{
  const o=startOriginal('versions/v14/08-CISAB-CHESS-V9.BAS'),engine=new Engine();
  o.until(/COLOR ARE WE/,30);
  for(const [line,prompt] of [['BLACK',/COULMB\)\?/],['2,5,4,5',/^OK\?\?/],['IQ',/COULMB\)\?/]]){
    o.type(`${line}\n`);o.run(1);o.until(prompt,900);engine.input(line);
  }
  const s=JSON.parse(engine.snapshot());
  assert.deepEqual(readBoard(o.m),s.board);
  assert.equal(readSeed(o.m),s.seed);
});

test('the site types castling as the original asks: the king, then ADD for the rook',()=>{
  const g=new Game(false);
  g.first_reply();
  for(const m of [[2,7,3,7],[1,6,2,7],[1,7,3,6]])g.play(...m,0,false);
  const result=JSON.parse(g.play(1,5,1,7,0,false));
  assert.ok(result.reply,'CISAB answers');
  const typed=JSON.parse(g.state()).typed;
  assert.deepEqual(typed.slice(-6,-1),['1,5,1,7','ADD','1,6,5','ADD','1,8,0']);
  assert.equal(typed.at(-1),'OK');
});
