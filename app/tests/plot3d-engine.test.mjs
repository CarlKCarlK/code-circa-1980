import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {render,plot,standard,ORIGINAL_LINE_200,WIDTH,screenSize,HIGH_RES} from '../../programs/plot3d/typescript/engine.ts';
import {compile} from '../../programs/plot3d/typescript/basic.ts';
import {round,add} from '../../programs/plot3d/typescript/mbf.ts';
import {settingsFor} from '../../programs/plot3d/typescript/parity-cases.js';
import {formulas} from '../../programs/plot3d/typescript/formulas.js';

const {fixtures}=JSON.parse(fs.readFileSync(new URL('../../programs/plot3d/typescript/parity-fixtures.json',import.meta.url)));
const listing=fs.readFileSync(new URL('../../programs/plot3d/versions/v03/01-3D-PLOT-1979.ASC',import.meta.url),'utf8');

test('the default formula is the recovered line 200, with ^ for the up-arrow',()=>{
 assert.equal(/^200 (.*?) *$/m.exec(listing)[1].replaceAll('[','^'),ORIGINAL_LINE_200);
 assert.equal(formulas[0].line,ORIGINAL_LINE_200);
});

for(const fixture of fixtures){
 test(`matches the original in the emulator: ${fixture.name}`,()=>{
  const settings=settingsFor(fixture,standard);
  if(fixture.error){assert.throws(()=>render(settings),{code:fixture.error});return;}
  const dots=render(settings);
  const differences=[];
  fixture.rows.forEach((row,y)=>[...row].forEach((c,x)=>{if(c!=='.'&&(c==='#')!==(dots[y*WIDTH+x]===1))differences.push([x,y]);}));
  assert.deepEqual(differences,[]);
 });
}

test('Level II rounding: the FOR loop lands on 0 where IEEE single precision would not',()=>{
 const third=round(1/3);let x=1;for(let i=0;i<3;i++)x=add(x,-third);
 assert.equal(x,0);assert.notEqual(Math.fround(Math.fround(Math.fround(1-Math.fround(1/3))-Math.fround(1/3))-Math.fround(1/3)),0);
});

test('formulas accept Level II syntax: no spaces, keywords inside names, two-letter names, IF/ELSE',()=>{
 const run=(text,vars={})=>{const env=new Map(Object.entries(vars));compile(text)(env);return env;};
 assert.equal(run('IFX<>0ORZ<>0THENY=1ELSEY=2',{X:0,Z:0}).get('Y'),2);
 assert.equal(run('RADIUS=3:Y=RA*2').get('Y'),6);
 assert.equal(run('Y=-2^2').get('Y'),-4);
 assert.equal(run('Y=2[3').get('Y'),8);
 assert.equal(run('IF X THEN Y=1:W=5 ELSE Y=2',{X:1}).get('W'),5);
 assert.equal(run('Y=NOT 0 AND 3').get('Y'),3);
 assert.throws(()=>compile('Y=SIN(X'),/SN Error/);
 assert.throws(()=>compile('IF X THEN 290'),/Line numbers/);
});

test('a formula can set NO=1 to lift the pen, as line 210 allows',()=>{
 const count=formula=>[...plot({...standard,formula})].filter(s=>s.kind==='set').length;
 assert.ok(count('Y=0:IF X=0 THEN NO=1')<count('Y=0'));
});

test('what-if high resolution: the same program on a 512 × 384 screen',()=>{
 assert.deepEqual(screenSize(HIGH_RES),{width:512,height:384});
 const steps=[...plot({...standard,scale:HIGH_RES})],sets=steps.filter(s=>s.kind==='set');
 // Same grid points, longer lines between them.
 assert.equal(steps.length-sets.length,[...plot(standard)].filter(s=>s.kind==='point').length);
 assert.ok(sets.every(s=>s.x>=0&&s.x<512&&s.y>=0&&s.y<384));
 assert.ok(render({...standard,scale:HIGH_RES}).reduce((n,d)=>n+d,0)>4*562);
});
