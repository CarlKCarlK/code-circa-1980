import fs from 'node:fs';
import {fileURLToPath} from 'node:url';

const programs=fileURLToPath(new URL('../../programs/',import.meta.url));
const page=(id,path)=>`<!doctype html>
<html lang="en">
<head><meta charset="UTF-8"><title>Code Circa 1980</title><link rel="canonical" href="https://carlkcarlk.github.io/code-circa-1980/${path}"><noscript><meta http-equiv="refresh" content="0; url=../${path}"></noscript><meta property="og:type" content="website"><meta property="og:site_name" content="Code Circa 1980"><meta property="og:title" content="Code, circa 1980. Running again."><meta property="og:description" content="Original programs from the early days of personal computing. Recovered from cassette tapes, updated with new controls."><meta property="og:url" content="https://carlkcarlk.github.io/code-circa-1980/${id}/"><meta property="og:image" content="https://carlkcarlk.github.io/code-circa-1980/og-castles.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="An arch and a tower built from blocks, partly knocked down by cannon fire"><meta name="twitter:card" content="summary_large_image">
<script>location.replace(location.pathname.replace(/[^/]*[/]?$/,'')+'${path}'+location.search+location.hash)</script></head>
<body><p><a href="../${path}">Open the latest release</a>.</p></body>
</html>
`;

// The gallery build adds <program>/index.html, redirecting to the newest release in web-versions.json; frozen releases (publicDir false) get none.
export default function latestReleases(){
  let enabled=false;
  return {name:'latest-releases',
    configResolved(config){enabled=Boolean(config.publicDir)&&config.command==='build';},
    generateBundle(){
      if(!enabled)return;
      for(const id of fs.readdirSync(programs)){
        const metadata=`${programs}${id}/program.json`;
        if(fs.existsSync(metadata)&&JSON.parse(fs.readFileSync(metadata,'utf8')).website===false)continue;
        const catalog=`${programs}${id}/web-versions.json`;
        if(!fs.existsSync(catalog))continue;
        const latest=JSON.parse(fs.readFileSync(catalog,'utf8')).versions.at(-1);
        if(latest?.path)this.emitFile({type:'asset',fileName:`${id}/index.html`,source:page(id,latest.path)});
      }
    }};
}
