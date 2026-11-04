import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {projectRoot} from '../scripts/web-versions.mjs';
import latestReleases from '../config/latest-releases.js';

const programs=path.join(projectRoot,'programs');
const active=fs.readdirSync(programs).filter(id=>fs.existsSync(path.join(programs,id,'program.json'))&&JSON.parse(fs.readFileSync(path.join(programs,id,'program.json'),'utf8')).website!==false);
const generated=()=>{
  const files=new Map(),plugin=latestReleases();
  plugin.configResolved({publicDir:'../public',command:'build'});
  plugin.generateBundle.call({emitFile:({fileName,source})=>files.set(fileName,source),error:message=>{throw Error(message);}});
  return files;
};
const tag=(html,property)=>html.match(new RegExp(`<meta property="og:${property}" content="([^"]*)"`))?.[1];

test('every program maps to a 1200x630 PNG of its gallery thumbnail',()=>{
  const manifest=JSON.parse(fs.readFileSync(path.join(projectRoot,'app/assets/og/manifest.json'),'utf8'));
  assert.ok(active.length>0);
  for(const id of active)assert.ok(manifest[JSON.parse(fs.readFileSync(path.join(programs,id,'program.json'),'utf8')).urlName??id],id);
  for(const file of new Set(Object.values(manifest))){
    const png=fs.readFileSync(path.join(projectRoot,'app/assets/og',file));
    assert.equal(png.toString('latin1',1,4),'PNG',file);
    assert.deepEqual([png.readUInt32BE(16),png.readUInt32BE(20)],[1200,630],file);
  }
});
test('every stable program page previews as that program',()=>{
  const files=generated();
  for(const id of active){
    const metadata=JSON.parse(fs.readFileSync(path.join(programs,id,'program.json'),'utf8'));
    const html=files.get(`${id}/index.html`);
    assert.ok(html,id);
    assert.match(tag(html,'image'),/^https:\/\/carlkcarlk\.github\.io\/code-circa-1980\/og\/[-\w]+\.png$/,id);
    assert.ok(files.has(tag(html,'image').replace('https://carlkcarlk.github.io/code-circa-1980/','')),id);
    assert.ok(tag(html,'title').length&&tag(html,'title')!=='Code, circa 1980. Running again.',id);
    assert.equal(tag(html,'url'),`https://carlkcarlk.github.io/code-circa-1980/${metadata.urlName??id}/`);
    assert.ok(tag(html,'description').length,id);
    assert.ok(html.includes('twitter:card'),id);
    // Crawlers follow a meta refresh and would read the frozen release's generic tags instead.
    assert.ok(!/http-equiv="refresh"/.test(html),id);
  }
});
test('a renamed program is reachable at both its new and old stable URLs',()=>{
  const files=generated();
  assert.equal(tag(files.get('defuse/index.html'),'title'),'Defuse');
  assert.equal(tag(files.get('bomb/index.html'),'url'),'https://carlkcarlk.github.io/code-circa-1980/defuse/');
  assert.equal(tag(files.get('liers-poker/index.html'),'url'),'https://carlkcarlk.github.io/code-circa-1980/liars-poker/');
  assert.doesNotMatch(tag(files.get('bomb/index.html'),'image'),/bomb/);
});
test('a release build swaps the generic tags for its program',()=>{
  const plugin=latestReleases();
  plugin.configResolved({publicDir:false,command:'build',define:{'import.meta.env.VITE_WEB_PROGRAM':'"bomb"'}});
  const html=plugin.transformIndexHtml(fs.readFileSync(path.join(projectRoot,'app/index.html'),'utf8'));
  assert.equal(tag(html,'title'),'Defuse');
  assert.equal(tag(html,'image'),'https://carlkcarlk.github.io/code-circa-1980/og/defuse-wires.png');
  assert.equal((html.match(/og:title/g)??[]).length,1);
});
