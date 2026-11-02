// Expand the recovered DEF FN functions for the stock Level II ROM.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {parseBasicText,decodeBasicProgram} from 'trs80-base';
import {parseBasic} from './build-alien-corrected.mjs';
const folder=new URL('../../programs/learningttt/',import.meta.url);
const hash=b=>createHash('sha256').update(b).digest('hex');
export function buildRuntime(){
 const source='versions/v04/08-LEARNING-TIC-TAC-TOE-V2.BAS';
 const original=fs.readFileSync(new URL(source,folder));const parsed=parseBasic(original);
 const lines=decodeBasicProgram(original).asAscii().split(/\r?\n/);
 const replacements=new Map();const changes=[];
 for(const number of [215,218,300,305,4010]){
  const before=lines.find(l=>l.startsWith(number+' '));
  if(!before)throw Error('Missing source line '+number);
  const after=before.replaceAll('FNX(CH)','(INT(((CH-1)/3-INT((CH-1)/3))*3+.5)+1)').replaceAll('FNY(CH)','(INT((CH-1)/3)+1)').replaceAll('FNM(R,4)','INT((R/4-INT(R/4))*4+.5)');
  const tokenized=Buffer.from(decodeBasicProgram(parseBasicText(after+'\n')).asCassetteBinary());replacements.set(number,parseBasic(tokenized).records[0].body);
  changes.push({line:number,before,after});
 }
 const parts=[parsed.header];let offset=4;
 for(const record of parsed.records){
  if([10,12].includes(record.line))continue;
  const body=replacements.get(record.line)??record.body;
  const next=offset+4+body.length+1;const prefix=Buffer.alloc(4);
  prefix.writeUInt16LE(parsed.base+next,0);prefix.writeUInt16LE(record.line,2);
  parts.push(prefix,body,Buffer.from([0]));offset=next;
 }
 parts.push(Buffer.from([0,0]));const bytes=Buffer.concat(parts);
 return {bytes,listing:decodeBasicProgram(bytes).asAscii().replaceAll('\r\n','\n'),record:{source,source_sha256:hash(original),sha256:hash(bytes),description:'Runtime adaptation: inline DEF FN expressions for stock Level II BASIC. No game rules or historical bugs corrected.',removed_declarations:[10,12],changes}};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const built=buildRuntime();fs.mkdirSync(new URL('runtime/',folder),{recursive:true});
 for(const [name,data] of [['LEARNINGTTT.BAS',built.bytes],['LEARNINGTTT.ASC',built.listing],['changes.json',JSON.stringify(built.record,null,2)+'\n']])fs.writeFileSync(new URL('runtime/'+name,folder),data);
 console.log(built.record.sha256);
}
