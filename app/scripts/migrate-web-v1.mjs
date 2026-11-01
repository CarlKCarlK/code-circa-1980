// One-time migration explicitly requested on 2026-10-31, before links were shared.
// Ordinary releases must use release-web.mjs, which never replaces a release.
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {build} from 'vite';
import {projectRoot,snapshotFiles,verifyWebVersions} from './web-versions.mjs';

if(process.argv.slice(2).join(' ')!=='--replace-unshared-v1')throw Error('One-time authorized migration: node scripts/migrate-web-v1.mjs --replace-unshared-v1');
if(execFileSync('git',['status','--porcelain'],{cwd:projectRoot,encoding:'utf8'}).trim())throw Error('Commit source before rebuilding v1.');
await verifyWebVersions();
const sourceCommit=execFileSync('git',['rev-parse','HEAD'],{cwd:projectRoot,encoding:'utf8'}).trim();
const programs=['castles','bal','alien','plot3d','chess','bomb'];
const plans=[];
for(const program of programs){
  const catalogPath=path.join(projectRoot,'programs',program,'web-versions.json');
  const catalog=JSON.parse(await fs.readFile(catalogPath,'utf8'));
  if(catalog.versions.length!==1||catalog.versions[0].id!=='v1'||catalog.versions[0].path)throw Error(`Migration already performed, or later releases exist: ${program}`);
  const destination=path.join(projectRoot,'public',program,'v1');
  try{await fs.access(destination);throw Error(`Refusing existing destination: ${destination}`);}catch(error){if(error.code!=='ENOENT')throw error;}
  plans.push({program,catalogPath,destination});
}
const temporary=await fs.mkdtemp(path.join(os.tmpdir(),'circa-v1-migration-'));
try{
  // Build everything before replacing any catalog or old snapshot.
  for(const plan of plans){
    const outDir=path.join(temporary,plan.program);
    await build({root:path.join(projectRoot,'app'),configFile:path.join(projectRoot,'app/config/vite.config.js'),publicDir:false,
      define:{'import.meta.env.VITE_WEB_PROGRAM':JSON.stringify(plan.program),'import.meta.env.VITE_WEB_VERSION':JSON.stringify('v1')},build:{outDir,emptyOutDir:true}});
    await fs.copyFile(path.join(projectRoot,'public','licenses.txt'),path.join(outDir,'licenses.txt'));
    plan.release={id:'v1',path:`${plan.program}/v1/`,label:'Web experience v1',released:'2026-10-31',sourceCommit,files:await snapshotFiles(outDir)};
  }
  for(const plan of plans){
    await fs.mkdir(path.dirname(plan.destination),{recursive:true});
    await fs.cp(path.join(temporary,plan.program),plan.destination,{recursive:true,errorOnExist:true,force:false});
    await fs.writeFile(plan.catalogPath,JSON.stringify({versions:[plan.release]},null,2)+'\n');
  }
  await verifyWebVersions();
  for(const plan of plans)await fs.rm(path.join(projectRoot,'public','experiences',plan.program),{recursive:true});
  console.log('Rebuilt six v1 releases at /<program>/v1/. Old builds remain in Git history.');
}finally{await fs.rm(temporary,{recursive:true,force:true});}
