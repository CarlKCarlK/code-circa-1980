// Full original-ROM generator and list/redraw check; intentionally not a fast unit test.
import fs from 'node:fs';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
import {machine,screenText,screenBytes} from '../tests/helpers/reference.mjs';import {decodeBasicProgram} from 'trs80-base';
const folder=new URL('../../programs/wordsearch/',import.meta.url),corrected=process.argv.includes('--corrected'),path=corrected?'corrected/WORDSEARCH.BAS':'versions/v01/07-WORD-SEARCH.BAS',bytes=fs.readFileSync(new URL(path,folder)),m=machine();m.runBasicProgram(decodeBasicProgram(bytes));const start=Date.now();
function waitFor(text,seconds){const end=m.tStateCount+m.clockHz*seconds;while(!screenText(m).includes(text)&&m.tStateCount<end)for(let i=0;i<100000;i++)m.step();assert.ok(screenText(m).includes(text),'Missing '+text);}
waitFor('DONE.  PRESS',30000);
const grid=()=>{const b=screenBytes(m),out=[];for(let r=0;r<15;r++)for(let c=1;c<=15;c++)out.push(b[r*64+c*4]);return Buffer.from(out);};
const before=grid();assert.match(before.toString(),/^[A-Z]{225}$/);
m.keyboard.simulateKeyboardText(' ');waitFor(corrected?'REPRINT THE PUZZLE':'RERRINT THE PUZZLE',100);if(corrected){assert.ok(screenText(m).includes('DISCUSSION'));assert.ok(!screenText(m).includes('DISSCUSSION'));};assert.ok(screenText(m).includes('UNITONE'));
m.keyboard.simulateKeyboardText(' ');waitFor('DONE.  PRESS',100);assert.deepEqual(grid(),before);
const record={date:'2026-11-02',source:path,source_sha256:createHash('sha256').update(bytes).digest('hex'),model:'Stock Model III / Level II ROM via trs80-emulator 2.3.1',execution_tested:true,checks:['Full stored list reaches DONE','All 225 grid cells contain letters','Space displays the included words, including UNITONE','A second Space redraws the exact same grid'],emulated_seconds:m.tStateCount/m.clockHz,wall_seconds:(Date.now()-start)/1000,grid:before.toString(),grid_sha256:createHash('sha256').update(before).digest('hex')};
fs.mkdirSync(new URL('verification/',folder),{recursive:true});fs.writeFileSync(new URL(corrected?'verification/corrected-full-rom-run.json':'verification/full-rom-run.json',folder),JSON.stringify(record,null,2)+'\n');console.log(JSON.stringify({checks:record.checks,emulated_seconds:record.emulated_seconds,wall_seconds:record.wall_seconds}));
