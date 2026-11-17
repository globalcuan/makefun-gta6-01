import puppeteer from 'puppeteer';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const shots = JSON.parse(await fs.readFile(path.resolve(dir, '../../shots.json'), 'utf8'));
for (const shot of shots) {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--disable-gpu-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  const errors = [], pageerrors = [], failed = [];
  await page.setRequestInterception(true);
  page.on('request', req => req.url().endsWith('/favicon.ico') ? req.abort() : req.continue());
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', error => pageerrors.push(error.message));
  page.on('requestfailed', req => failed.push(`${req.url()} ${req.failure()?.errorText || ''}`));
  await page.goto(`http://localhost:8080/index.html${shot.query}`, { waitUntil: 'load' });
  await new Promise(resolve => setTimeout(resolve, 4000));
  const file = path.resolve(dir, '../../screenshots', shot.name);
  await page.screenshot({ path: file, type: 'jpeg', quality: 80 });
  console.log(`${shot.name}: ${(await fs.stat(file)).size} bytes, 1280x720`);
  console.log(`console errors: ${JSON.stringify(errors)}; pageerrors: ${JSON.stringify(pageerrors)}; failed requests: ${JSON.stringify(failed)}`);
  await browser.close();
  if (pageerrors.length) process.exitCode = 1;
}
