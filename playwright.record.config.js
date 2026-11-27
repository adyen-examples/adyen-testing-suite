// @ts-check
// Records a video of the Workshop - Advanced Flow Payment test.
// Usage: npm run record:advanced-flow  (or see command in README)
const base = require('./playwright.config.js');

/** @type {import('@playwright/test').PlaywrightTestConfig} */
module.exports = {
  ...base,
  // Tests that can be recorded; pass the spec file on the command line to pick one
  testMatch: /workshop-(advanced-flow|tokenization-create|preauthorisation)\.spec\.js/,
  reporter: 'list',
  workers: 1,
  retries: 0,
  outputDir: 'test-results-recording',
  use: {
    ...base.use,
    // headless still records video; the headed chrome.exe needs a working full Chromium install
    headless: true,
    video: { mode: 'on', size: { width: 1280, height: 720 } },
    viewport: { width: 1280, height: 720 },
    launchOptions: { slowMo: 700 },
  },
};
