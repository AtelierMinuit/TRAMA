const puppeteer = require('puppeteer');
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.static(path.join(__dirname, '../dist')));
const server = app.listen(3033, async () => {
  console.log('Server started on 3033');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const wait = (ms) => new Promise(r => setTimeout(r, ms));

  // Load state
  const state = JSON.parse(fs.readFileSync(path.join(__dirname, '../docs/assets/screenshots/dummy_state.json'), 'utf8'));

  await page.goto('http://localhost:3033');
  
  await page.evaluate((data) => {
    for (const [k, v] of Object.entries(data)) {
      if (typeof v === 'string') localStorage.setItem(k, v);
      else localStorage.setItem(k, JSON.stringify(v));
    }
  }, state);

  // Reload to apply state
  await page.goto('http://localhost:3033');
  await wait(2000);

  // 1. Dashboard
  await page.screenshot({ path: path.join(__dirname, '../docs/assets/screenshots/dashboard.png') });
  console.log('Dashboard screenshot taken');

  // Click on "Familia Rivera" to enter editor
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.recent-card'));
    const demo = cards.find(c => c.innerText.includes('Familia Rivera'));
    if (demo) demo.click();
  });
  await wait(2000);

  // 2. Editor
  await page.screenshot({ path: path.join(__dirname, '../docs/assets/screenshots/editor.png') });
  console.log('Editor screenshot taken');

  // 3. Settings (Open modal)
  await page.evaluate(() => {
    const btn = document.querySelector('button[title="Ajustes"]');
    if (btn) btn.click();
  });
  await wait(1000);
  await page.screenshot({ path: path.join(__dirname, '../docs/assets/screenshots/settings.png') });
  
  // Close Settings
  await page.keyboard.press('Escape');
  await wait(500);

  // 4. Dark Mode Settings
  await page.evaluate(() => {
    localStorage.setItem('trama.theme', '"dark"');
  });
  await page.reload();
  await wait(2000);
  await page.screenshot({ path: path.join(__dirname, '../docs/assets/screenshots/dark-mode.png') });

  await browser.close();
  server.close();
  console.log('Done');
});
