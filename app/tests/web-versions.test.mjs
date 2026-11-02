import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {snapshotFiles,verifyWebVersions} from '../scripts/web-versions.mjs';
import {routeParts,editionSearch,releaseSearch,releasePath} from '../site/routes.js';

const basic={id:'v02',slug:'basic',playable:true};
const modern={id:'typescript',playable:true};
const example={id:'example',defaultVersion:'v02',defaultImplementation:'typescript',modern,versions:[{id:'v01',playable:false},basic],playSuffix:'/castle'};
test('release URLs need only the short program name and web version',()=>{
 assert.equal(releasePath('bomb',{id:'v1',path:'bomb/v1/'}),'bomb/v1/');
 assert.deepEqual(routeParts('','example'),['program','example',undefined,'play',undefined]);
 assert.equal(editionSearch(example),'');
 assert.equal(editionSearch({...example,modern:undefined,defaultImplementation:undefined}),'');
 assert.equal(releaseSearch(example,['program','example','typescript','play','castle']),'');
});
test('existing alternate implementations and sources use query parameters',()=>{
 assert.equal(editionSearch(example,basic),'?lang=basic');
 assert.equal(editionSearch(example,example.versions[0]),'?source=v01');
 assert.equal(editionSearch(example,modern,'blank'),'?scene=blank');
 assert.deepEqual(routeParts('','example','?lang=basic'),['program','example','basic','play',undefined]);
 assert.deepEqual(routeParts('','example','?source=v01'),['program','example','v01','play',undefined]);
 assert.equal(editionSearch(example,modern,undefined,'?lang=basic&source=v01&scene=blank'),'');
});
test('legacy links translate without retaining redundant routing',()=>{
 const parts=routeParts('#/program/example/typescript/play/castle');
 assert.equal(releaseSearch(example,parts,'?test'),'?test=');
 assert.equal(releaseSearch(example,routeParts('','', '?program=example'),'?program=example'),'');
});

// A program still being imported may not have web v1 yet; the deploy check stays strict.
test('each released program has intact web releases starting at v1',async()=>{
 assert.ok(await verifyWebVersions({allowUnreleased:true})>0);
});
for(const cleanPath of [false,true])test(`changing an archived asset fails release verification (${cleanPath?'clean':'legacy'} path)`,async()=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'circa-release-test-'));
 try {
  const program=path.join(root,'programs','example'),snapshot=path.join(root,'public',cleanPath?'example':'experiences/example','v1');
  await fs.mkdir(program,{recursive:true});await fs.mkdir(snapshot,{recursive:true});
  await fs.writeFile(path.join(program,'program.json'),JSON.stringify({id:'example'}));
  await fs.writeFile(path.join(snapshot,'index.html'),'<h1>Original experience</h1>');
  await fs.writeFile(path.join(snapshot,'licenses.txt'),'License retained.');
  const catalog={versions:[{id:'v1',...(cleanPath?{path:'example/v1/'}:{}),label:'First release',released:'2026-10-30',sourceCommit:'a'.repeat(40),files:await snapshotFiles(snapshot)}]};
  await fs.writeFile(path.join(program,'web-versions.json'),JSON.stringify(catalog));
  assert.equal(await verifyWebVersions({root}),1);
  await fs.writeFile(path.join(snapshot,'index.html'),'<h1>Changed experience</h1>');
  await assert.rejects(verifyWebVersions({root}),/Snapshot integrity failure/);
 }finally {await fs.rm(root,{recursive:true,force:true});}
});
