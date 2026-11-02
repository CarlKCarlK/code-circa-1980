// Minimal derived patch; recovered snapshots and canonical originals stay untouched.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {decodeBasicProgram} from 'trs80-base';
import {parseBasic} from './build-alien-corrected.mjs';
const folder=new URL('../../programs/poker/',import.meta.url);
const spelling=[['CHREATIVE','CREATIVE'],['MORRISTIWN','MORRISTOWN'],['WWELCOME','WELCOME'],['OPEEN','OPEN'],['DRAWW','DRAW'],['YOOU','YOU'],['DOWWN','DOWN'],['DO YOU WITH TO CONTINUE','DO YOU WISH TO CONTINUE'],['SELL YOU WATCH','SELL YOUR WATCH'],['WWATCH','WATCH'],['YOUR WAS IS SHOT','YOUR WAD IS SHOT']];
const sha=b=>createHash('sha256').update(b).digest('hex');
export function buildCorrected(){
 const original=fs.readFileSync(new URL('versions/v02/06-POKER.BAS',folder));
 const {header,records,base}=parseBasic(original),changes=[],parts=[header];let offset=4;
 for(const {line,body} of records){
  if(line===1005){if(body.length!==1||body[0]!==0x94)throw Error('Unexpected STOP');changes.push({line,from:'STOP',to:null,reason:'Remove the draw-time debugging stop, absent in the other text save.'});continue;}
  let fixed=Buffer.from(body);
  if(line===2190){const before=Buffer.from([65,40,90,41,0xd5,66,66]);if(!fixed.subarray(0,7).equals(before))throw Error('Unexpected evaluator');fixed=Buffer.concat([Buffer.from([66,66,0xd5,65,40,90,41]),fixed.subarray(7)]);changes.push({line,from:'A(Z)=BB',to:'BB=A(Z)',reason:'Read each card into the rank helper instead of overwriting the hand; matches the other recovered text save.'});}
  if(line===3310){const at=fixed.indexOf(Buffer.from('THEEN'));if(at<0)throw Error('Unexpected THEN typo');fixed=Buffer.concat([fixed.subarray(0,at),Buffer.from([0xca]),fixed.subarray(at+5)]);changes.push({line,from:'IFT<=25THEEN3350',to:'IFT<=25THEN3350',reason:'Correct misspelled THEN keyword; preserve the existing condition and target.'});}
  // Replace text only inside quoted strings. All other tokens/spacing remain intact.
  let quoted=false,run=[],out=[];
  const flush=()=>{let text=Buffer.from(run).toString('latin1');for(const [from,to] of spelling)if(text.includes(from)){changes.push({line,from,to,reason:'Displayed text spelling',count:text.split(from).length-1});text=text.replaceAll(from,to);}out.push(...Buffer.from(text,'latin1'));run=[];};
  for(const b of fixed){if(b===34){if(quoted)flush();quoted=!quoted;out.push(b);}else if(quoted)run.push(b);else out.push(b);}
  if(quoted)flush();fixed=Buffer.from(out);
  const next=offset+4+fixed.length+1,link=Buffer.alloc(4);link.writeUInt16LE(base+next,0);link.writeUInt16LE(line,2);parts.push(link,fixed,Buffer.from([0]));offset=next;
 }
 parts.push(Buffer.from([0,0]));const bytes=Buffer.concat(parts),listing=decodeBasicProgram(bytes).asAscii();
 return {original,bytes,listing,record:{source:'versions/v02/06-POKER.BAS',source_sha256:sha(original),sha256:sha(bytes),listing_sha256:sha(Buffer.from(listing)),description:'Separate corrected edition; recovered historical files are unchanged.',changes}};
}
if(process.argv[1]===new URL(import.meta.url).pathname){const {bytes,listing,record}=buildCorrected();fs.mkdirSync(new URL('corrected/',folder),{recursive:true});fs.writeFileSync(new URL('corrected/POKER.BAS',folder),bytes);fs.writeFileSync(new URL('corrected/POKER.ASC',folder),listing);fs.writeFileSync(new URL('corrected/changes.json',folder),JSON.stringify(record,null,2)+'\n');console.log(record.changes.length+' minimal corrections');}
