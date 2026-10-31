import castles from '../../programs/castles/program.json';
import * as castlesView from './programs/castles.js';
import balancer from '../../programs/bal/program.json';
import * as balancerView from './programs/bal.js';
import alien from '../../programs/alien/program.json';
import * as alienView from './programs/alien.js';
import plot3d from '../../programs/plot3d/program.json';
import * as plot3dView from './programs/plot3d.js';
import chess from '../../programs/chess/program.json';
import * as chessView from './programs/chess.js';
// Add each new program's metadata here. Navigation and playback are shared.
const modern = {...castles.versions.at(-1), slug:undefined, id:'typescript', label:'TypeScript · v05 rules', implementation:'typescript', capture:'v05 reference', playable:true, note:'First TypeScript translation of Castles v05 and FALL assembly v6. See the parity notes for verified behavior and remaining differences.'};
const balancerModern = {...balancer.versions.at(-1), slug:undefined, id:'rust', label:'Rust · v20 algorithm', implementation:'rust', capture:'v20 reference', playable:true, note:'Rust port of the Chemistry Balancer II (v20) algorithm, compiled to WebAssembly. See PARITY.md for differences.'};
// The site plays one BASIC version of Alien: v02 with its printed spelling corrected (programs/alien/corrected/).
const alienVersions = alien.versions.map(v => v.id !== alien.defaultVersion ? v : {...v, raw:'corrected/ALIEN.BAS', listing:'corrected/ALIEN.ASC', derived:true, running:'Running BASIC', note:'Alien v02 with the spelling in its printed text corrected (ALIEN, JUNCTION, TOO and others); every changed byte is listed in corrected/changes.json, and the program logic is unchanged. The recovered v02 bytes are kept in versions/v02.'});
const plot3dModern = {...plot3d.versions.at(-1), slug:undefined, id:'typescript', label:'TypeScript · v03 rules', implementation:'typescript', capture:'v03 reference', playable:true, note:'TypeScript translation of 3-D Plot v03 that draws the same dots, with a line-200 formula box and a choice of speed. See PARITY.md.'};
// The site plays one BASIC version of CISAB: v14 with three bugs and two spellings corrected (programs/chess/corrected/).
const chessVersions = chess.versions.map(v => v.id !== chess.defaultVersion ? v : {...v, raw:'corrected/CHESS.BAS', listing:'corrected/CHESS.ASC', derived:true, note:'CISAB v14 with six bugs fixed and two spellings corrected: pawns promote (lines 110-111, 1300) and step two squares only from their first row (line 335), move lists hold 300 entries (line 14), GOTO replaces a GOSUB that never returned (line 210), and the opening plays only moves that fit (lines 9500-9540). Every change is listed in corrected/changes.json; the recovered v14 bytes are kept in versions/v14.'});
const chessModern = {...chessVersions.at(-1), slug:undefined, id:'rust', label:'Rust · v14 algorithm', implementation:'rust', capture:'v14 reference', playable:true, note:'Rust port of CISAB v14 as corrected, compiled to WebAssembly, on a mouse board. For the same moves it makes the same replies as the BASIC program, illegal ones included. See PARITY.md.'};
const webCatalogs=import.meta.glob('../../programs/*/web-versions.json',{eager:true,import:'default'});
export const programs = [{...castles, ...castlesView, modern, loadModernPlayer:()=>import('../../programs/castles/typescript/player.ts')}, {...balancer, ...balancerView, modern:balancerModern, loadModernPlayer:()=>import('../../programs/bal/modern/player.js')}, {...alien, ...alienView, versions:alienVersions}, {...plot3d, ...plot3dView, modern:plot3dModern, loadModernPlayer:()=>import('../../programs/plot3d/typescript/player.ts')}, {...chess, ...chessView, versions:chessVersions, modern:chessModern, loadModernPlayer:()=>import('../../programs/chess/modern/player.js')}]
  .map(program=>({...program,webVersions:webCatalogs[`../../programs/${program.id}/web-versions.json`]?.versions??[]}));
const files = import.meta.glob(['../../programs/**/*.{BAS,ASC,bin}','!../../programs/**/target/**'], {query:'?url', import:'default', eager:true});
const provenance = import.meta.glob('../../programs/**/provenance.json', {query:'?url', import:'default', eager:true});
export function assetUrl(program, path) {
  const url = files[`../../programs/${program.id}/${path}`];
  if (!url) throw new Error(`Missing source asset: ${program.id}/${path}`);
  return url;
}
export function provenanceUrl(program) { return provenance[`../../programs/${program.id}/provenance.json`]; }
