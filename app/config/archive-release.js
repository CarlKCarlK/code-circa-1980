import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url));
// New archive releases need only their own sources. This also keeps each frozen
// player self-contained without repeatedly embedding every other program's data.
export default function archiveRelease(){let program;return {
 name:'archive-release-catalog',
 configResolved(config){const value=config.define?.['import.meta.env.VITE_WEB_PROGRAM'];if(!value)return;const id=JSON.parse(value);const meta=JSON.parse(fs.readFileSync(path.join(root,'programs',id,'program.json')));if(meta.archiveImport)program=id;},
 transform(code,id){if(!program||id!==path.join(root,'app/site/catalog.js'))return;
 return `import metadata from '../../programs/${program}/program.json';
import {archiveView} from './programs/archive.js';
const p={...metadata,...archiveView(metadata),webVersions:[]};
export const allPrograms=[p];export const programs=[];export const morePrograms=[p];
const files=import.meta.glob('../../programs/${program}/**/*.{BAS,ASC,bin,BIN,ASM,TXT,Z80,SRC,3BN,PRG,IMG,TAP,txt}',{query:'?url',import:'default',eager:true});
const provenance=import.meta.glob('../../programs/${program}/provenance.json',{query:'?url',import:'default',eager:true});
export function assetUrl(program,path){const url=files['../../programs/'+program.id+'/'+path];if(!url)throw Error('Missing source asset: '+path);return url;}
export function provenanceUrl(program){return provenance['../../programs/'+program.id+'/provenance.json'];}`;
 }
};}
