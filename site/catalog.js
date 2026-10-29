import castles from '../programs/castles/program.json';
import {instructions, onScreenKeys, quickHelp} from './programs/castles.js';
// Add each new program's metadata here. Navigation and playback are shared.
const modern = {...castles.versions.at(-1), id:'typescript', label:'TypeScript · v05 rules', implementation:'typescript', capture:'v05 reference', playable:true, note:'First TypeScript translation of Castles v05 and FALL assembly v6. See the parity notes for verified behavior and remaining differences.'};
export const programs = [{...castles, instructions, onScreenKeys, quickHelp, modern, loadModernPlayer:()=>import('../programs/castles/typescript/player.ts')}];
const files = import.meta.glob('../programs/**/*.{BAS,ASC,bin}', {query:'?url', import:'default', eager:true});
const provenance = import.meta.glob('../programs/**/provenance.json', {query:'?url', import:'default', eager:true});
export function assetUrl(program, path) {
  const url = files[`../programs/${program.id}/${path}`];
  if (!url) throw new Error(`Missing source asset: ${program.id}/${path}`);
  return url;
}
export function provenanceUrl(program) { return provenance[`../programs/${program.id}/provenance.json`]; }
