import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {build} from 'vite';
import {projectRoot,snapshotFiles,verifyWebVersions} from './web-versions.mjs';

const [program,...args]=process.argv.slice(2);
if(!program||!/^[-a-z0-9]+$/.test(program)||args.length&&!(args.length===2&&args[0]==='--label'))throw Error('Usage: npm run release:web -- PROGRAM [--label "Release title"]');
const programPath=path.join(projectRoot,'programs',program);
const metadata=JSON.parse(await fs.readFile(path.join(programPath,'program.json'),'utf8'));
if(metadata.id!==program)throw Error('Program ID does not match its folder.');
const dirty=execFileSync('git',['status','--porcelain','--','app','programs','public'],{cwd:projectRoot,encoding:'utf8'}).trim();
if(dirty)throw Error(`Commit the source before freezing a web release:\n${dirty}`);
await verifyWebVersions({allowUnreleased:true});
const catalogPath=path.join(programPath,'web-versions.json');
let catalog;
try {catalog=JSON.parse(await fs.readFile(catalogPath,'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;catalog={versions:[]};}
const version=`v${catalog.versions.length+1}`;
const destination=path.join(projectRoot,'public','experiences',program,version);
try {await fs.access(destination);throw Error(`Refusing to overwrite ${destination}`);}catch(error){if(error.code!=='ENOENT')throw error;}
const sourceCommit=execFileSync('git',['rev-parse','HEAD'],{cwd:projectRoot,encoding:'utf8'}).trim();
const temporary=await fs.mkdtemp(path.join(os.tmpdir(),'circa-web-release-'));
try {
  await build({root:path.join(projectRoot,'app'),configFile:path.join(projectRoot,'app/config/vite.config.js'),publicDir:false,
    define:{'import.meta.env.VITE_WEB_PROGRAM':JSON.stringify(program),'import.meta.env.VITE_WEB_VERSION':JSON.stringify(version)},
    build:{outDir:temporary,emptyOutDir:true}});
  await fs.copyFile(path.join(projectRoot,'public','licenses.txt'),path.join(temporary,'licenses.txt'));
  const release={id:version,label:args[1]||`Web experience ${version}`,
    released:new Intl.DateTimeFormat('en-CA',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()),
    sourceCommit,files:await snapshotFiles(temporary)};
  await fs.mkdir(path.dirname(destination),{recursive:true});
  await fs.cp(temporary,destination,{recursive:true,errorOnExist:true,force:false});
  catalog.versions.push(release);
  await fs.writeFile(catalogPath,JSON.stringify(catalog,null,2)+'\n');
  await verifyWebVersions();
  console.log(`Frozen ${metadata.title} ${version}. Commit ${catalogPath} and ${destination}; keep earlier releases unchanged.`);
}finally {await fs.rm(temporary,{recursive:true,force:true});}
