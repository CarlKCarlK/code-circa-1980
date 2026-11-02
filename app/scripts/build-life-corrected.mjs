import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {Asm} from 'z80-asm';

const folder=new URL('../../programs/life/',import.meta.url);
const hash=b=>createHash('sha256').update(b).digest('hex');
export function buildCorrected(){
 const sourcePath='versions/v06/06-LIFE-ASSEMBLY-V6.Z80';
 const original=fs.readFileSync(new URL(sourcePath,folder));
 const before='\tLD BC,991',after='\tLD BC,992';
 const text=original.toString();
 if(text.split(before).length!==2)throw Error('Expected exactly one generation-copy length.');
 const listing=text.replace(before,after);
 const asm=new Asm(name=>name==='life.asm'?['\tORG 8000H',...listing.trimEnd().split(/\r?\n/)]:undefined);
 asm.assembleFile('life.asm');
 const errors=asm.assembledLines.filter(l=>l.error);
 if(errors.length)throw Error(errors.map(l=>l.error).join('\n'));
 const used=asm.assembledLines.filter(l=>l.binary.length);
 const origin=Math.min(...used.map(l=>l.address));
 const end=Math.max(...used.map(l=>l.address+l.binary.length));
 const binary=Buffer.alloc(end-origin);
 for(const line of used)binary.set(line.binary,line.address-origin);
 const unpatched=fs.readFileSync(new URL('derived/life.bin',folder));
 if(binary.length!==unpatched.length)throw Error('Unexpected binary length change.');
 const changedBytes=[...binary].flatMap((value,offset)=>value===unpatched[offset]?[]:[{offset,address:origin+offset,before:unpatched[offset],after:value}]);
 if(changedBytes.length!==1||changedBytes[0].before!==223||changedBytes[0].after!==224)throw Error('Expected only the copy-count operand to change.');
 const record={description:'Corrected assembly of LIFE v06; modern derivative, not recovered machine code.',source:sourcePath,source_sha256:hash(original),corrected_source_sha256:hash(listing),assembler:'z80-asm 2.3.0',transformation:'Change LD BC,991 to LD BC,992 after CALL GEN, copying the final active-field character. Prepend ORG 8000H for assembly. No other instructions changed.',origin,bytes:binary.length,sha256:hash(binary),original_binary_sha256:hash(unpatched),changed_bytes:changedBytes,symbols:Object.fromEntries([...asm.scopes[0].symbols].map(([k,v])=>[k,v.value]))};
 return {listing,binary,record};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const {listing,binary,record}=buildCorrected();
 fs.mkdirSync(new URL('corrected/',folder),{recursive:true});
 fs.writeFileSync(new URL('corrected/LIFE.Z80',folder),listing);
 fs.writeFileSync(new URL('corrected/life.bin',folder),binary);
 fs.writeFileSync(new URL('corrected/build.json',folder),JSON.stringify(record,null,2)+'\n');
 for(const name of ['LIFE-BOOT.ASC','LIFE-BOOT.BAS'])fs.copyFileSync(new URL('derived/'+name,folder),new URL('corrected/'+name,folder));
 console.log(`Corrected LIFE: ${binary.length} bytes; ${record.sha256}`);
}
