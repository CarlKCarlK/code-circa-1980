import {fileURLToPath} from 'node:url';
import {defineConfig} from '@playwright/test';
const existingServer=process.env.PLAYWRIGHT_BASE_URL;
export default defineConfig({
 testDir:'../app/tests/browser',workers:1,timeout:40000,
 use:{baseURL:existingServer||'http://127.0.0.1:5181',viewport:{width:1280,height:960},headless:true,
  launchOptions:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{}},
 webServer:existingServer?undefined:{cwd:fileURLToPath(new URL('../',import.meta.url)),command:'npm run preview -- --port 5181 --strictPort',url:'http://127.0.0.1:5181',reuseExistingServer:!process.env.CI},
 reporter:'list'
});
