// Freezes a site-wide change: unshared More v1s refresh in place, everything else gets its next version. Commit the source first.
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {build} from 'vite';
import {planRelease} from './release-policy.mjs';
import {projectRoot,snapshotFiles,verifyWebVersions} from './web-versions.mjs';

const only=process.argv.slice(2);
const dirty=execFileSync('git',['status','--porcelain','--','app','programs','public'],{cwd:projectRoot,encoding:'utf8'}).trim();
if(dirty)throw Error(`Commit the source before freezing:\n${dirty}`);
const sourceCommit=execFileSync('git',['rev-parse','HEAD'],{cwd:projectRoot,encoding:'utf8'}).trim();
const released=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
for(const program of (await fs.readdir(path.join(projectRoot,'programs'))).sort()){
  if(only.length&&!only.includes(program))continue;
  const programPath=path.join(projectRoot,'programs',program);
  let metadata,catalog;
  try {metadata=JSON.parse(await fs.readFile(path.join(programPath,'program.json'),'utf8'));catalog=JSON.parse(await fs.readFile(path.join(programPath,'web-versions.json'),'utf8'));}
  catch(error){if(error.code==='ENOENT'||error.code==='ENOTDIR')continue;throw error;}
  if(metadata.website===false)continue;
  const refreshUnshared=metadata.gallery==='more'&&metadata.unsharedWebV1===true;
  const {version,replace}=planRelease(metadata,catalog,{refreshUnshared});
  const releasePath=`${metadata.urlName??program}/${version}/`;
  const destination=path.join(projectRoot,'public',releasePath);
  const temporary=await fs.mkdtemp(path.join(os.tmpdir(),'circa-web-release-'));
  try {
    await build({root:path.join(projectRoot,'app'),configFile:path.join(projectRoot,'app/config/vite.config.js'),publicDir:false,logLevel:'error',
      define:{'import.meta.env.VITE_WEB_PROGRAM':JSON.stringify(program),'import.meta.env.VITE_WEB_VERSION':JSON.stringify(version)},
      build:{outDir:temporary,emptyOutDir:true}});
    await fs.copyFile(path.join(projectRoot,'public/licenses.txt'),path.join(temporary,'licenses.txt'));
    const release={id:version,path:releasePath,label:replace?catalog.versions[0].label:`Web experience ${version}`,released,sourceCommit,files:await snapshotFiles(temporary)};
    if(replace)await fs.rm(destination,{recursive:true});
    await fs.mkdir(path.dirname(destination),{recursive:true});
    await fs.cp(temporary,destination,{recursive:true,errorOnExist:!replace,force:replace});
    if(replace)catalog.versions=[release];else catalog.versions.push(release);
    await fs.writeFile(path.join(programPath,'web-versions.json'),JSON.stringify(catalog,null,2)+'\n');
    console.log(program,version,release.files.length,'files');
  }finally {await fs.rm(temporary,{recursive:true,force:true});}
}
console.log(`Verified ${await verifyWebVersions()} immutable web releases.`);
