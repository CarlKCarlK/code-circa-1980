// Builds the Rust balancer engine to WebAssembly and records the sources it came from.
// CI has no Rust toolchain, so the generated pkg/ is committed; npm test checks it is current.
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const crate=new URL('../../programs/chemical-equation-balancer/rust/',import.meta.url);
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
export const sourceFiles=()=>['Cargo.toml','Cargo.lock',...fs.readdirSync(new URL('src/',crate)).sort().map(f=>`src/${f}`)];
export const sourceHashes=()=>Object.fromEntries(sourceFiles().map(f=>[f,sha(fs.readFileSync(new URL(f,crate)))]));
if(import.meta.url===`file://${process.argv[1]}`){
  execFileSync('wasm-pack',['build','--target','web','--release','--no-pack','--out-dir','pkg'],{cwd:crate,stdio:'inherit'});
  fs.rmSync(new URL('pkg/.gitignore',crate),{force:true});
  const wasm=fs.readFileSync(new URL('pkg/chemistry_balancer_bg.wasm',crate));
  const tool=command=>execFileSync(command,['--version'],{encoding:'utf8'}).trim();
  fs.writeFileSync(new URL('pkg/build.json',crate),JSON.stringify({
    description:'WebAssembly build of the Rust port; generated, not historical.',
    tools:{rustc:tool('rustc'),wasm_pack:tool('wasm-pack'),wasm_bindgen:tool('wasm-bindgen')},
    sources:sourceHashes(),wasm_sha256:sha(wasm),wasm_bytes:wasm.length
  },null,2)+'\n');
  console.log(`Balancer engine: ${wasm.length} bytes, SHA-256 ${sha(wasm)}`);
}
