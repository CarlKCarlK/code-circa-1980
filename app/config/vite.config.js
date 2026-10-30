import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vite';
export default defineConfig({root:fileURLToPath(new URL('../',import.meta.url)),base:'./',publicDir:'../public',build:{outDir:'../dist',emptyOutDir:true,assetsInlineLimit:0},
  // Program folders sit beside app/; the dev server must serve files fetched by URL, such as WebAssembly.
  server:{fs:{allow:[fileURLToPath(new URL('../../',import.meta.url))]}}});
