import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url));
// SPI and AIM share one gallery entry, and each player's selector opens the other's latest release.
const linkedReleases={spi:['spi','aim'],aim:['spi','aim']};
// New archive releases need only their own sources. This also keeps each frozen
// player self-contained without repeatedly embedding every other program's data.
export default function archiveRelease(){let program,single,usesModel100;return {
 name:'archive-release-catalog',
 configResolved(config){const value=config.define?.['import.meta.env.VITE_WEB_PROGRAM'];if(!value)return;const id=JSON.parse(value);const meta=JSON.parse(fs.readFileSync(path.join(root,'programs',id,'program.json')));usesModel100=meta.model==='MODEL100';if(meta.archiveImport)program=id;else single=id;},
 transform(code,id){
 // Only a Model 100 release needs VirtualT, whose 1.35 MB would otherwise reach every release.
 if(id===path.join(root,'app/site/main.js')&&(program||single)&&!usesModel100){
  if(!code.includes("await import('./model100.js')"))throw Error('Player import changed; update archive-release.js');
  return code.replace("await import('./model100.js')",'null');
 }
 if(id!==path.join(root,'app/site/catalog.js'))return;
 if(!program&&single){
  // A full-catalog release still needs only its own files and web versions.
  const scoped=code
   .replace("'../../programs/**/*.{","'../../programs/"+single+"/**/*.{")
   .replace("'!../../programs/**/target/**'","'!../../programs/"+single+"/**/target/**'")
   .replace("'!../../programs/**/third_party/**'","'!../../programs/"+single+"/**/third_party/**'")
   .replace("['../../programs/**/provenance.json']","['../../programs/"+single+"/provenance.json']")
   .replace("['../../programs/*/web-versions.json']",JSON.stringify((linkedReleases[single]??[single]).map(name=>'../../programs/'+name+'/web-versions.json')));
  if(scoped.includes('../../programs/**/')||scoped.includes("programs/*/web-versions"))throw Error('Catalog globs changed; update archive-release.js');
  return scoped;
 }
 if(!program)return;
 return `import metadata from '../../programs/${program}/program.json';
import {archiveView} from './programs/archive.js';
import {model100View} from './programs/model100.js';
const p={...metadata,...(metadata.model==='MODEL100'?model100View(metadata):archiveView(metadata)),webVersions:[]};
export const allPrograms=[p];export const programs=[];export const morePrograms=[p];
const files=import.meta.glob('../../programs/${program}/**/*.{BAS,ASC,bin,BIN,ASM,TXT,Z80,SRC,3BN,PRG,IMG,TAP,txt,dmk,LSP}',{query:'?url',import:'default',eager:true});
const provenance=import.meta.glob('../../programs/${program}/provenance.json',{query:'?url',import:'default',eager:true});
export function assetUrl(program,path){const url=files['../../programs/'+program.id+'/'+path];if(!url)throw Error('Missing source asset: '+path);return url;}
export function provenanceUrl(program){return provenance['../../programs/'+program.id+'/provenance.json'];}`;
 }
};}
