import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {decodeBasicProgram,parseBasicText} from 'trs80-base';
import {parseBasic} from './build-alien-corrected.mjs';
const folder=new URL('../../programs/wordsearch/',import.meta.url);
const sha=b=>createHash('sha256').update(b).digest('hex');
export function buildCorrected(){
 const source='versions/v01/07-WORD-SEARCH.BAS';const original=fs.readFileSync(new URL(source,folder));const parsed=parseBasic(original);
 const originalLines=decodeBasicProgram(original).asAscii().split('\n');
 const edits=new Map();const changes=[];
 for(const [line,from,to,reason] of [[1065,'PRINT@960,D$;','PRINT@960,LEFT$(D$+STRING$(40,32),40);','Pad the current-word field through column 39 to erase old letters without overwriting the position counter.'],[1330,'RERRINT','REPRINT','Correct the redraw prompt.'],[2000,'DISSCUSSION','DISCUSSION','Correct a word in the active puzzle list.'],[3000,'SOLVEN,','SOLVENT,','Correct a word in the unused chemistry list.']]){
  const before=originalLines.find(l=>l.startsWith(line+' '));if(!before?.includes(from))throw Error('Unexpected line '+line);
  const after=before.replace(from,to);edits.set(line,parseBasic(Buffer.from(decodeBasicProgram(parseBasicText(after+'\n')).asCassetteBinary())).records[0].body);changes.push({line,before,after,reason});
 }
 const parts=[parsed.header];let offset=4;
 for(const record of parsed.records){const bytes=edits.get(record.line)??record.body;const next=offset+4+bytes.length+1;const header=Buffer.alloc(4);header.writeUInt16LE(parsed.base+next,0);header.writeUInt16LE(record.line,2);parts.push(header,bytes,Buffer.from([0]));offset=next;}
 parts.push(Buffer.from([0,0]));const bytes=Buffer.concat(parts);return {bytes,listing:decodeBasicProgram(bytes).asAscii(),record:{source,source_sha256:sha(original),sha256:sha(bytes),changes,limits:'Three spelling corrections and one padded current-word field (four record bodies). Names, abbreviations, placement rules, and all other recovered content remain unchanged.'}};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){const b=buildCorrected();fs.mkdirSync(new URL('corrected/',folder),{recursive:true});for(const [name,data] of [['WORDSEARCH.BAS',b.bytes],['WORDSEARCH.ASC',b.listing],['changes.json',JSON.stringify(b.record,null,2)+'\n']])fs.writeFileSync(new URL('corrected/'+name,folder),data);}
