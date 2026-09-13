const puppeteer = require('puppeteer');
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.static(path.join(__dirname, '../dist')));
const server = app.listen(3033, async () => {
  console.log('Server started on 3033');
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const wait = (ms) => new Promise(r => setTimeout(r, ms));

  // 1. Dashboard Light
  await page.goto('http://localhost:3033');
  await page.evaluate(() => { localStorage.setItem('trama.theme', 'light'); });
  await page.reload();
  await wait(1500);
  await page.screenshot({ path: path.join(__dirname, '../docs/assets/screenshots/dashboard.png') });
  console.log('1. Dashboard light screenshot taken');

  // 2. Editor Light
  await page.evaluate(() => {
    const tplCard = document.querySelector('.template-card');
    if (tplCard) tplCard.click();
  });
  await wait(2500);
  await page.screenshot({ path: path.join(__dirname, '../docs/assets/screenshots/editor.png') });
  console.log('2. Editor light screenshot taken');

  // 3. Switch to Dark Mode and enter Editor Dark
  await page.evaluate(() => { localStorage.setItem('trama.theme', 'dark'); });
  await page.reload();
  await wait(1500);
  await page.evaluate(() => {
    const tplCard = document.querySelector('.template-card');
    if (tplCard) tplCard.click();
  });
  await wait(2500);
  await page.screenshot({ path: path.join(__dirname, '../docs/assets/screenshots/dark-mode.png') });
  console.log('3. Editor dark mode screenshot taken');

  await browser.close();
  server.close();
  console.log('All screenshots completed successfully');
});
