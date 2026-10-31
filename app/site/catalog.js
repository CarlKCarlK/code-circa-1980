import castles from '../../programs/castles/program.json';
import * as castlesView from './programs/castles.js';
import balancer from '../../programs/bal/program.json';
import * as balancerView from './programs/bal.js';
import alien from '../../programs/alien/program.json';
import * as alienView from './programs/alien.js';
// Add each new program's metadata here. Navigation and playback are shared.
const modern = {...castles.versions.at(-1), slug:undefined, id:'typescript', label:'TypeScript · v05 rules', implementation:'typescript', capture:'v05 reference', playable:true, note:'First TypeScript translation of Castles v05 and FALL assembly v6. See the parity notes for verified behavior and remaining differences.'};
const balancerModern = {...balancer.versions.at(-1), slug:undefined, id:'rust', label:'Rust · v20 algorithm', implementation:'rust', capture:'v20 reference', playable:true, note:'Rust port of the Chemistry Balancer II (v20) algorithm, compiled to WebAssembly. See PARITY.md for differences.'};
// Alien's default edition is v02 with printed spelling corrected, still run by the emulator.
const alienCorrected = {...alien.versions.at(-1), slug:undefined, id:'corrected', label:'Corrected spelling · v02', implementation:'corrected', capture:'v02, spelling corrected', raw:'corrected/ALIEN.BAS', listing:'corrected/ALIEN.ASC', playable:true, derived:true, note:'Alien v02 with the spelling in its printed text corrected (ALIEN, JUNCTION, TOO and others); every changed byte is listed in corrected/changes.json. The program logic is unchanged.'};
const webCatalogs=import.meta.glob('../../programs/*/web-versions.json',{eager:true,import:'default'});
export const programs = [{...castles, ...castlesView, modern, loadModernPlayer:()=>import('../../programs/castles/typescript/player.ts')}, {...balancer, ...balancerView, modern:balancerModern, loadModernPlayer:()=>import('../../programs/bal/modern/player.js')}, {...alien, ...alienView, modern:alienCorrected, loadModernPlayer:()=>import('./emulator.js')}]
  .map(program=>({...program,webVersions:webCatalogs[`../../programs/${program.id}/web-versions.json`]?.versions??[]}));
const files = import.meta.glob(['../../programs/**/*.{BAS,ASC,bin}','!../../programs/**/target/**'], {query:'?url', import:'default', eager:true});
const provenance = import.meta.glob('../../programs/**/provenance.json', {query:'?url', import:'default', eager:true});
export function assetUrl(program, path) {
  const url = files[`../../programs/${program.id}/${path}`];
  if (!url) throw new Error(`Missing source asset: ${program.id}/${path}`);
  return url;
}
export function provenanceUrl(program) { return provenance[`../../programs/${program.id}/provenance.json`]; }
