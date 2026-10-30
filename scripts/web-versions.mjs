import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';

export const projectRoot=fileURLToPath(new URL('../',import.meta.url));
export async function snapshotFiles(folder,prefix='') {
  const files=[];
  for(const entry of await fs.readdir(folder,{withFileTypes:true})) {
    const relative=prefix+entry.name,absolute=path.join(folder,entry.name);
    if(entry.isDirectory())files.push(...await snapshotFiles(absolute,relative+'/'));
    else if(entry.isFile()){
      const bytes=await fs.readFile(absolute);
      files.push({path:relative,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
    }else throw Error(`Snapshot contains a non-file entry: ${absolute}`);
  }
  return files.sort((a,b)=>a.path.localeCompare(b.path,'en'));
}
export async function verifyWebVersions({root=projectRoot,against,allowUnreleased=false}={}) {
  if(against&&/^0+$/.test(against))against=undefined;
  if(against)execFileSync('git',['rev-parse','--verify',`${against}^{commit}`],{cwd:root,stdio:'pipe'});
  let count=0;
  for(const entry of await fs.readdir(path.join(root,'programs'),{withFileTypes:true})) {
    if(!entry.isDirectory())continue;
    const programPath=path.join(root,'programs',entry.name);
    try {await fs.access(path.join(programPath,'program.json'));}catch{continue;}
    const relative=`programs/${entry.name}/web-versions.json`;
    let catalog;
    try {catalog=JSON.parse(await fs.readFile(path.join(root,relative),'utf8'));}
    catch(error){if(allowUnreleased&&error.code==='ENOENT')continue;throw error;}
    if(!Array.isArray(catalog.versions)||(!catalog.versions.length&&!allowUnreleased))throw Error(`No web versions for ${entry.name}`);
    for(const [index,version] of catalog.versions.entries()) {
      if(version.id!==`v${index+1}`)throw Error(`Web versions must start at v1 and increase in order: ${relative}`);
      if(!/^[0-9a-f]{40}$/.test(version.sourceCommit)||!/^\d{4}-\d{2}-\d{2}$/.test(version.released)||!version.label)throw Error(`Incomplete release metadata: ${entry.name}/${version.id}`);
      const actual=await snapshotFiles(path.join(root,'public','experiences',entry.name,version.id));
      if(JSON.stringify(actual)!==JSON.stringify(version.files))throw Error(`Snapshot integrity failure: ${entry.name}/${version.id}`);
      if(!actual.some(file=>file.path==='index.html')||!actual.some(file=>file.path==='licenses.txt'))throw Error(`Snapshot lacks its entry point or licenses: ${entry.name}/${version.id}`);
      count++;
    }
    if(against){
      let previous;
      try {previous=JSON.parse(execFileSync('git',['show',`${against}:${relative}`],{cwd:root,encoding:'utf8',stdio:'pipe'}));}
      catch(error){
        if(execFileSync('git',['ls-tree','--name-only',against,'--',relative],{cwd:root,encoding:'utf8'}).trim())throw error;
      }
      for(const version of previous?.versions??[])if(JSON.stringify(version)!==JSON.stringify(catalog.versions.find(v=>v.id===version.id)))throw Error(`Published release was changed or removed: ${entry.name}/${version.id}`);
    }
  }
  if(against){
    const removedCatalogs=execFileSync('git',['diff','--name-only','--diff-filter=DR',against,'HEAD','--','programs'],{cwd:root,encoding:'utf8'}).trim().split('\n').filter(file=>file.endsWith('/web-versions.json'));
    if(removedCatalogs.length)throw Error(`Published release catalogs cannot be removed: ${removedCatalogs.join(', ')}`);
    const changes=execFileSync('git',['diff','--name-status','--diff-filter=MDR',against,'HEAD','--','public/experiences'],{cwd:root,encoding:'utf8'}).trim();
    if(changes)throw Error(`Published snapshot files cannot change or be removed:\n${changes}`);
  }
  return count;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const args=process.argv.slice(2);
  if(args.length&&!(args.length===2&&args[0]==='--against'))throw Error('Usage: node scripts/web-versions.mjs [--against COMMIT]');
  console.log(`Verified ${await verifyWebVersions({against:args[1]})} immutable web releases.`);
}
