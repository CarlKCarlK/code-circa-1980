import fs from 'node:fs';
import {fileURLToPath} from 'node:url';

const programs=fileURLToPath(new URL('../../programs/',import.meta.url));
const site='https://carlkcarlk.github.io/code-circa-1980/';
const escape=text=>String(text).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
// Crawlers do not run JavaScript, so these tags on the stable /<program>/ page are what a shared link previews.
const previews=JSON.parse(fs.readFileSync(fileURLToPath(new URL('../assets/og/manifest.json',import.meta.url)),'utf8'));
// A renamed program's urlName is its public name; its folder and old release URLs stay.
const socialTags=(id,metadata,name=metadata.urlName??id)=>`<meta property="og:type" content="website"><meta property="og:site_name" content="Code Circa 1980"><meta property="og:title" content="${escape(metadata.title)}"><meta property="og:description" content="${escape(metadata.description)}"><meta property="og:url" content="${site}${name}/"><meta property="og:image" content="${site}og/${previews[name]}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="Gallery artwork for ${escape(metadata.title)}"><meta name="twitter:card" content="summary_large_image">`;
const page=(id,path,metadata)=>`<!doctype html>
<html lang="en">
<head><meta charset="UTF-8"><title>${escape(metadata.title)} · Code Circa 1980</title><meta name="description" content="${escape(metadata.description)}"><link rel="canonical" href="${site}${metadata.urlName??id}/">${socialTags(id,metadata)}
<script>location.replace(location.pathname.replace(/[^/]*[/]?$/,'')+'${path}'+location.search+location.hash)</script></head>
<body><p><a href="../${path}">Open the latest release</a>.</p></body>
</html>
`;

// The gallery build adds <program>/index.html, redirecting to the newest release in web-versions.json; frozen releases (publicDir false) get none.
export default function latestReleases(){
  let enabled=false,release;
  return {name:'latest-releases',
    configResolved(config){enabled=Boolean(config.publicDir)&&config.command==='build';release=config.define?.['import.meta.env.VITE_WEB_PROGRAM'];},
    // A frozen release previews as its program, so a link copied from the address bar works too.
    transformIndexHtml(html){
      if(!release)return html;
      const id=JSON.parse(release);
      const metadata=JSON.parse(fs.readFileSync(`${programs}${id}/program.json`,'utf8'));
      return html.replace(/<meta property="og:type".*?<meta name="twitter:card"[^>]*>/s,socialTags(id,metadata));
    },
    generateBundle(){
      if(!enabled)return;
      for(const id of fs.readdirSync(programs)){
        const metadataPath=`${programs}${id}/program.json`;
        if(!fs.existsSync(metadataPath))continue;
        const metadata=JSON.parse(fs.readFileSync(metadataPath,'utf8'));
        if(metadata.website===false)continue;
        // A merged program's stable URL goes to the card it joined; its own frozen releases stay.
        if(metadata.mergedInto){
          const target=JSON.parse(fs.readFileSync(`${programs}${metadata.mergedInto}/program.json`,'utf8'));
          const latest=JSON.parse(fs.readFileSync(`${programs}${metadata.mergedInto}/web-versions.json`,'utf8')).versions.at(-1);
          this.emitFile({type:'asset',fileName:`${id}/index.html`,source:page(metadata.mergedInto,latest.path,target)});
          continue;
        }
        const catalog=`${programs}${id}/web-versions.json`;
        if(!fs.existsSync(catalog))continue;
        const latest=JSON.parse(fs.readFileSync(catalog,'utf8')).versions.at(-1);
        if(!latest?.path)continue;
        this.emitFile({type:'asset',fileName:`${id}/index.html`,source:page(id,latest.path,metadata)});
        if(metadata.urlName)this.emitFile({type:'asset',fileName:`${metadata.urlName}/index.html`,source:page(id,latest.path,metadata)});
        if(!previews[metadata.urlName??id])this.error(`No link preview for ${id}: run npm run render:previews`);
      }
      for(const file of new Set(Object.values(previews)))this.emitFile({type:'asset',fileName:`og/${file}`,source:fs.readFileSync(fileURLToPath(new URL(`../assets/og/${file}`,import.meta.url)))});
    }};
}
