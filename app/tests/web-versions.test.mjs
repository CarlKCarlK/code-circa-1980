import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {snapshotFiles,verifyWebVersions} from '../scripts/web-versions.mjs';

// A program still being imported may not have web v1 yet; the deploy check stays strict.
test('each released program has intact web releases starting at v1',async()=>{
 assert.ok(await verifyWebVersions({allowUnreleased:true})>0);
});
test('changing an archived asset fails release verification',async()=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'circa-release-test-'));
 try {
  const program=path.join(root,'programs','example'),snapshot=path.join(root,'public','experiences','example','v1');
  await fs.mkdir(program,{recursive:true});await fs.mkdir(snapshot,{recursive:true});
  await fs.writeFile(path.join(program,'program.json'),JSON.stringify({id:'example'}));
  await fs.writeFile(path.join(snapshot,'index.html'),'<h1>Original experience</h1>');
  await fs.writeFile(path.join(snapshot,'licenses.txt'),'License retained.');
  const catalog={versions:[{id:'v1',label:'First release',released:'2026-10-30',sourceCommit:'a'.repeat(40),files:await snapshotFiles(snapshot)}]};
  await fs.writeFile(path.join(program,'web-versions.json'),JSON.stringify(catalog));
  assert.equal(await verifyWebVersions({root}),1);
  await fs.writeFile(path.join(snapshot,'index.html'),'<h1>Changed experience</h1>');
  await assert.rejects(verifyWebVersions({root}),/Snapshot integrity failure/);
 }finally {await fs.rm(root,{recursive:true,force:true});}
});
