import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {sourceHashes} from '../scripts/build-balancer.mjs';
import {runOriginal,programFolder} from './helpers/balancer-reference.mjs';
const pkg=new URL('rust/pkg/',programFolder);
const {initSync,balance_json}=await import(new URL('chemistry_balancer.js',pkg));
initSync({module:fs.readFileSync(new URL('chemistry_balancer_bg.wasm',pkg))});
const balance=text=>JSON.parse(balance_json(text));
// The original wraps long answers at 62 columns, so compare without whitespace.
const squash=text=>text.replace(/\s+/g,'');
const fixtures=JSON.parse(fs.readFileSync(new URL('modern/parity-fixtures.json',programFolder)));

test('committed WebAssembly was built from the current Rust sources',()=>{
  const build=JSON.parse(fs.readFileSync(new URL('build.json',pkg)));
  assert.deepEqual(build.sources,sourceHashes(),'Run npm run build:balancer');
  assert.equal(createHash('sha256').update(fs.readFileSync(new URL('chemistry_balancer_bg.wasm',pkg))).digest('hex'),build.wasm_sha256);
});
test('Rust engine matches recorded v20 output for every reference equation',()=>{
  for(const {equation,v20} of fixtures.cases){
    const r=balance(equation);
    assert.equal(squash(r.ok?r.trs80:`FATAL ERROR: ${r.error}`),squash(v20.output),equation);
  }
});
test('Rust engine matches v20 running now in the emulator',()=>{
  const program=JSON.parse(fs.readFileSync(new URL('program.json',programFolder)));
  const v20=program.versions.find(v=>v.id==='v20').raw;
  for(const equation of ['H2+O2=H2.O','FE+O2=FE2.O3']){
    const {lines}=runOriginal(v20,equation,/ANOTHER EQUATION/);
    const answer=lines.find(l=>l.includes('-^')&&l.includes('('));
    assert.equal(squash(answer),squash(balance(equation).trs80),equation);
  }
});
