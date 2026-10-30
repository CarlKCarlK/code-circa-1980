// Records what recovered v20 (and v06) print for reference equations, for the Rust parity tests.
import fs from 'node:fs';
import {runOriginal,programFolder} from '../tests/helpers/balancer-reference.mjs';
const program=JSON.parse(fs.readFileSync(new URL('program.json',programFolder)));
const raw=id=>program.versions.find(v=>v.id===id).raw;
const equations=['H2+O2=H2.O','C3.H8+O2=C.O2+H2.O','FE+O2=FE2.O3','C12.H22.O11=C+H2.O','CA(O.H)2+H3.P.O4=CA3(P.O4)2+H2.O','K.MN.O4+H.CL=K.CL+MN.CL2+H2.O+CL2','NA2.B4.O7+H2.O+H2.S.O4=NA2.S.O4+H3.B.O3','CU+H.N.O3=CU(N.O3)2+N.O+H2.O','AL+O2=AL2.O3','H2=O2'];
// The answer is the text between the echoed equation and the next prompt.
const answer=(lines,startAfter,stop)=>{const i=lines.findIndex(l=>l.includes(startAfter));const rest=lines.slice(i+1);const j=rest.findIndex(l=>stop.test(l));return rest.slice(0,j<0?undefined:j).filter(Boolean).map(l=>l.trim()).join(' ');};
const cases=[];
for(const equation of equations){
  const ii=runOriginal(raw('v20'),equation,/ANOTHER EQUATION|FATAL ERROR/);
  const i79=runOriginal(raw('v06'),equation,/\n\?.*\n[^]*\n\?|CAN NOT/);
  const record={equation,
    v20:{output:answer(ii.lines,equation,/ANOTHER EQUATION/),seconds:Math.round(ii.seconds*10)/10},
    v06:{output:answer(i79.lines,equation,/^\?|WHAT IS THE EQUATION/)}};
  console.log(JSON.stringify(record));cases.push(record);
}
fs.writeFileSync(new URL('modern/parity-fixtures.json',programFolder),JSON.stringify({
  description:'Output of recovered versions in the TRS-80 emulator (trs80-emulator 2.3.1), recorded by app/scripts/record-balancer-parity.mjs.',
  recorded:new Date().toISOString().slice(0,10),cases},null,2)+'\n');
