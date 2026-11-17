import puppeteer from 'puppeteer';
import { readFile, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const shots = JSON.parse(await readFile(path.join(root, 'shots.json'), 'utf8'));
await mkdir(path.join(root, 'screenshots'), { recursive: true });
let hasPageError = false;
for (const shot of shots) {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--disable-gpu-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    const issues = [];
    page.on('console', msg => { if (msg.type() === 'error') issues.push(`console error: ${msg.text()}`); });
    page.on('pageerror', error => { issues.push(`pageerror: ${error.message}`); hasPageError = true; });
    page.on('requestfailed', req => issues.push(`failed request: ${req.url()} (${req.failure()?.errorText})`));
    await page.goto(`http://localhost:8080/index.html${shot.query}`, { waitUntil: 'domcontentloaded' });
    await page.waitForNetworkIdle({ idleTime: 500, timeout: 10000 }).catch(() => {});
    await new Promise(resolve => setTimeout(resolve, 4000));
    const file = path.join(root, 'screenshots', shot.name);
    await page.screenshot({ path: file, type: 'jpeg', quality: 80 });
    const info = await page.evaluate(() => ({ width: document.querySelector('canvas')?.width || innerWidth, height: document.querySelector('canvas')?.height || innerHeight }));
    console.log(`${shot.name}: ${(await stat(file)).size} bytes, ${info.width}x${info.height}`);
    for (const issue of issues) console.log(`  ${issue}`);
  } finally { await browser.close(); }
}
if (hasPageError) process.exitCode = 1;
