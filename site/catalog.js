import castles from '../programs/castles/program.json';
import {instructions, onScreenKeys, quickHelp} from './programs/castles.js';
// Add each new program's metadata here. Navigation and playback are shared.
export const programs = [{...castles, instructions, onScreenKeys, quickHelp}];
const files = import.meta.glob('../programs/**/*.{BAS,ASC}', {query:'?url', import:'default', eager:true});
const provenance = import.meta.glob('../programs/**/provenance.json', {query:'?url', import:'default', eager:true});
export function assetUrl(program, path) {
  const url = files[`../programs/${program.id}/${path}`];
  if (!url) throw new Error(`Missing source asset: ${program.id}/${path}`);
  return url;
}
export function provenanceUrl(program) { return provenance[`../programs/${program.id}/provenance.json`]; }
