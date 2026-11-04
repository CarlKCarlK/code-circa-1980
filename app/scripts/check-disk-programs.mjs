// Starts every program that runs from an original disk and checks its first screen.
// This is a startup check, not a test of each program's behavior. Takes a few minutes.
import {startFromDisk} from '../tests/helpers/disk-machine.mjs';
console.warn=()=>{};console.error=()=>{};
const checks={
 'presidential-crisis-game':p=>p.until(/WELCOME TO THE WHITE HOUSE/),
 'argyle-88':p=>p.until(/QUORUM IN SPACE/),
 'two-player-trail-game':p=>p.until(/CONTROLS  1-2-3-4/),
 'three-dimensional-trail-game':p=>p.until(/BLOCKADE  3-D/),
 race:p=>p.until(/THERE ARE TO PHASES/),
 'amazing-maze':p=>p.until(/A MAZING PROGRAM/),
 go:p=>{p.run(12);if(p.graphics()<100)throw Error('Go drew no board');},
 growth:p=>p.until(/WHICH STATEGY/,40),
 screenfun:p=>p.until(/THERE ARE THREE MODES/,20),
 tones:p=>p.until(/THREE KEYBOARDS/),
 turtle:p=>{p.type('10 F 90 R 10 F\n');p.run(10);if(p.graphics()<5)throw Error('Turtle drew nothing');},
 spacestationzap:p=>{p.run(60);if(p.graphics()<20)throw Error('No station map');},
 deriv:p=>{p.type('(X * X)\n');p.run(2);p.type('X\n');p.until(/\( 2 \* X\)/,20);},
 gps:p=>p.until(/OPERATOR/,60),
};
let failed=0;
for(const [id,check] of Object.entries(checks)){
 if(process.argv[2]&&!process.argv.slice(2).includes(id))continue;
 const start=Date.now();
 try{const p=startFromDisk(id);p.startup();check(p);console.log('ok  ',id,`${((Date.now()-start)/1000).toFixed(0)}s`);console.log(p.screen().split('\n').filter(x=>x.trim()).slice(-4).map(x=>'     '+x.slice(0,62)).join('\n'));}
 catch(error){failed++;console.log('FAIL',id,error.message.slice(0,1100));}
}
process.exitCode=failed?1:0;
