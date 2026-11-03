import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {decodeBasicProgram,parseBasicText} from 'trs80-base';
import {parseBasic} from './build-alien-corrected.mjs';
const folder=new URL('../../programs/cipher/',import.meta.url);
const sha=b=>createHash('sha256').update(b).digest('hex');
export function buildCorrected(){
 const source='versions/v01/02-KEYWORD-CIPHER.BAS';const original=fs.readFileSync(new URL(source,folder));const parsed=parseBasic(original);
 const originalLines=decodeBasicProgram(original).asAscii().split('\n');
 const edits=new Map();const changes=[];
 for(const [line,from,to,reason] of [[50,'TO1:','TO1STEP-1:','Read every message character, not only the first.'],[80,'TO1:','TO1STEP-1:','Read every keyword character, not only the first.'],[440,'L(C)+64','L(C)','Stored values are already character codes.'],[520,'"`"','"@"','Use code 64 for the space slot in the 27-symbol alphabet.'],[550,'"`"','"@"','Use code 64 for the space slot in the 27-symbol alphabet.']]){
  const before=originalLines.find(l=>l.startsWith(line+' '));if(!before?.includes(from))throw Error('Unexpected line '+line);
  const after=before.replace(from,to);edits.set(line,parseBasic(Buffer.from(decodeBasicProgram(parseBasicText(after+'\n')).asCassetteBinary())).records[0].body);changes.push({line,before,after,reason});
 }
 const parts=[parsed.header];let offset=4;
 for(const record of parsed.records){const bytes=edits.get(record.line)??record.body;const next=offset+4+bytes.length+1;const header=Buffer.alloc(4);header.writeUInt16LE(parsed.base+next,0);header.writeUInt16LE(record.line,2);parts.push(header,bytes,Buffer.from([0]));offset=next;}
 parts.push(Buffer.from([0,0]));const bytes=Buffer.concat(parts);return {bytes,listing:decodeBasicProgram(bytes).asAscii(),record:{source,source_sha256:sha(original),sha256:sha(bytes),changes,limits:'Message support tested for A–Z and spaces, keywords A–Z up to 10 letters. Other punctuation and long inputs retain original behavior.'}};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){const b=buildCorrected();fs.mkdirSync(new URL('corrected/',folder),{recursive:true});for(const [name,data] of [['CIPHER.BAS',b.bytes],['CIPHER.ASC',b.listing],['changes.json',JSON.stringify(b.record,null,2)+'\n']])fs.writeFileSync(new URL('corrected/'+name,folder),data);}
