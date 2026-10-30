import castles from '../../programs/castles/program.json';
import * as castlesView from './programs/castles.js';
import balancer from '../../programs/chemical-equation-balancer/program.json';
import * as balancerView from './programs/chemical-equation-balancer.js';
// Add each new program's metadata here. Navigation and playback are shared.
const modern = {...castles.versions.at(-1), id:'typescript', label:'TypeScript · v05 rules', implementation:'typescript', capture:'v05 reference', playable:true, note:'First TypeScript translation of Castles v05 and FALL assembly v6. See the parity notes for verified behavior and remaining differences.'};
const webCatalogs=import.meta.glob('../../programs/*/web-versions.json',{eager:true,import:'default'});
export const programs = [{...castles, ...castlesView, modern, loadModernPlayer:()=>import('../../programs/castles/typescript/player.ts')}, {...balancer, ...balancerView}]
  .map(program=>({...program,webVersions:webCatalogs[`../../programs/${program.id}/web-versions.json`]?.versions??[]}));
const files = import.meta.glob('../../programs/**/*.{BAS,ASC,bin}', {query:'?url', import:'default', eager:true});
const provenance = import.meta.glob('../../programs/**/provenance.json', {query:'?url', import:'default', eager:true});
export function assetUrl(program, path) {
  const url = files[`../../programs/${program.id}/${path}`];
  if (!url) throw new Error(`Missing source asset: ${program.id}/${path}`);
  return url;
}
export function provenanceUrl(program) { return provenance[`../../programs/${program.id}/provenance.json`]; }
