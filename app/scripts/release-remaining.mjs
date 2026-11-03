// Freeze the committed import batch. Existing releases are never overwritten.
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {execFileSync} from 'node:child_process';
import {build} from 'vite';
import {projectRoot,snapshotFiles,verifyWebVersions} from './web-versions.mjs';
const ids=JSON.parse(await fs.readFile(path.join(projectRoot,'app/site/remaining-programs.json')));
const dirty=execFileSync('git',['status','--porcelain','--','app','programs','public'],{cwd:projectRoot,encoding:'utf8'}).trim();
if(dirty)throw Error('Commit the import source before freezing this batch.');
const sourceCommit=execFileSync('git',['rev-parse','HEAD'],{cwd:projectRoot,encoding:'utf8'}).trim();
await verifyWebVersions({allowUnreleased:true});
for(const id of ids){
 const catalogPath=path.join(projectRoot,'programs',id,'web-versions.json');
 try{await fs.access(catalogPath);throw Error('Refusing to replace '+catalogPath);}catch(e){if(e.code!=='ENOENT')throw e;}
 const temporary=await fs.mkdtemp(path.join(os.tmpdir(),'circa-archive-'));
 try{
  await build({root:path.join(projectRoot,'app'),configFile:path.join(projectRoot,'app/config/vite.config.js'),publicDir:false,logLevel:'error',
   define:{'import.meta.env.VITE_WEB_PROGRAM':JSON.stringify(id),'import.meta.env.VITE_WEB_VERSION':JSON.stringify('v1')},build:{outDir:temporary,emptyOutDir:true}});
  await fs.copyFile(path.join(projectRoot,'public/licenses.txt'),path.join(temporary,'licenses.txt'));
  const release={id:'v1',path:`${id}/v1/`,label:'Original cassette archive',released:'2026-11-03',sourceCommit,files:await snapshotFiles(temporary)};
  const destination=path.join(projectRoot,'public',id,'v1');await fs.mkdir(path.dirname(destination),{recursive:true});await fs.cp(temporary,destination,{force:false,errorOnExist:true});
  await fs.writeFile(catalogPath,JSON.stringify({versions:[release]},null,2)+'\n');
  console.log(id,release.files.length,'frozen files');
 }finally{await fs.rm(temporary,{recursive:true,force:true});}
}
console.log('Verified',await verifyWebVersions(),'active releases.');
