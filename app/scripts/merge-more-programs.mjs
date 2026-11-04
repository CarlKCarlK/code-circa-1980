// One-time merge of More cards the user judged to be the same program. The merged folders, tags, and frozen releases stay;
// copies of their saves join the target as source-only versions, and their stable URLs redirect there.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {projectRoot} from './web-versions.mjs';

const groups=[
 {target:'modular-operation-chart',from:['modular-arithmetic-chart']},
 {target:'two-player-trail-game',from:['two-player-trail-game-tape30a']},
 {target:'physics-formula-reference',from:['formula-lookup']},
 {target:'amazing-maze',from:['maze-generator','amazing-dungeon-and-maze']},
 {target:'mileage-card-game',from:['mille-bornes-card-game'],title:'Mille Bornes Card Game'},
 // Main-gallery cards keep their descriptions.
 {target:'bal',from:['chemistry-balancer-ii'],main:true},
 {target:'plot3d',from:['3d-plot'],main:true},
];
const folder=id=>path.join(projectRoot,'programs',id);
const read=(id,file)=>JSON.parse(fs.readFileSync(path.join(folder(id),file),'utf8'));
const write=(id,file,value)=>fs.writeFileSync(path.join(folder(id),file),JSON.stringify(value,null,2)+'\n');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
for(const {target,from,title,main} of groups){
 const program=read(target,'program.json'),provenance=read(target,'provenance.json');
 if(program.mergedPrograms)continue;
 const titles=[],records=[];
 for(const id of from){
  const source=read(id,'program.json');titles.push(source.title);
  for(const version of source.versions){
   const moved={},place=file=>{
    if(!file)return file;
    const destination=`versions/${id}-${version.id}/${path.basename(file)}`;
    const bytes=fs.readFileSync(path.join(folder(id),file));
    fs.mkdirSync(path.dirname(path.join(folder(target),destination)),{recursive:true});
    fs.writeFileSync(path.join(folder(target),destination),bytes);
    moved[destination]={source:`programs/${id}/${file}`,sha256:sha(bytes),bytes:bytes.length};
    return destination;
   };
   const {slug,disk,running,...kept}=version;
   // A credit the target's card does not already carry has to travel with the save.
   const credit=source.attribution&&source.attribution.text!==program.attribution?.text?`${source.attribution.text} `:'';
   const copy={...kept,id:`v${String(program.versions.length+1).padStart(2,'0')}`,raw:place(version.raw),listing:place(version.listing),
    exports:version.exports?.map(item=>({...item,path:place(item.path)})),playable:false,
    unavailableReason:'Another recovered save; the site offers one selected player.',
    note:`Previously listed separately as ${source.title} ${version.id}. ${credit}${version.note}`,mergedFrom:{program:id,version:version.id}};
   for(const {path:file,label} of source.upstreamDownloads??[])copy.exports.push({path:place(file),label});
   program.versions.push(copy);records.push({program:id,version:version.id,merged_version:copy.id,files:moved});
  }
  write(id,'program.json',{...source,mergedInto:target,galleryHidden:true});
 }
 const count=program.versions.length;
 if(!main)program.description=program.description
  .replace(/\b\d+ captured saves?\b/,`${count} captured saves`)
  .replace(/\b\d+ recovered forms?\b/,`${count} recovered forms`)
  +` Includes the saves once listed as ${titles.join(' and ')}.`;
 if(title){program.title=title;provenance.official_title=title;}
 program.mergedPrograms=from;
 write(target,'program.json',program);
 write(target,'provenance.json',{...provenance,merged_programs:records});
 console.log(target,count,'saves from',from.join(', '));
}
