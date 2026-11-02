import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vite';
import latestReleases from './latest-releases.js';
export default defineConfig({plugins:[latestReleases()],root:fileURLToPath(new URL('../',import.meta.url)),base:'./',publicDir:'../public',build:{outDir:'../dist',emptyOutDir:true,assetsInlineLimit:0},
  // Program folders sit beside app/; the dev server must serve files fetched by URL, such as WebAssembly.
  server:{fs:{allow:[fileURLToPath(new URL('../../',import.meta.url))]}}});
