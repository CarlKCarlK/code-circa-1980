import {defineConfig} from '@playwright/test';
export default defineConfig({
 testDir:'./tests/browser',workers:1,timeout:40000,
 use:{baseURL:'http://127.0.0.1:5181',viewport:{width:1280,height:960},headless:true,
  launchOptions:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{}},
 webServer:{command:'npm run preview -- --port 5181 --strictPort',url:'http://127.0.0.1:5181',reuseExistingServer:!process.env.CI},
 reporter:'list'
});
