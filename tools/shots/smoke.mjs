import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--disable-gpu-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
await page.setRequestInterception(true);
page.on('request', req => req.url().endsWith('/favicon.ico') ? req.abort() : req.continue());
page.on('pageerror', e => errors.push(e.message));
await page.goto('http://localhost:8080/index.html', { waitUntil: 'load' });
const started = await page.evaluate(() => {
  try { document.querySelector('#free-roam').click(); } catch (_) {}
  if (!CS.main || !CS.player) return false;
  CS.main.start('free'); return true;
});
console.log(`${started ? 'PASS' : 'FAIL'} start game`);
const moved = await page.evaluate(() => {
  const before = CS.player.state.pos.clone();
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW', key: 'w', bubbles: true }));
  CS.player.update(2, CS.input);
  window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyW', key: 'w', bubbles: true }));
  return before.distanceTo(CS.player.state.pos);
});
console.log(`${moved > 0.1 ? 'PASS' : 'FAIL'} player moved (${moved.toFixed(2)})`);
const checks = await page.evaluate(() => {
  const car = CS.vehicles.cars[0];
  car.position.copy(CS.player.state.pos); car.position.x += 1;
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyE', key: 'e', bubbles: true }));
  CS.player.update(1 / 60, CS.input);
  window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyE', key: 'e', bubbles: true }));
  const entered = !!CS.player.state.inCar;
  CS.missions.startMission(0);
  return { entered, mission: CS.missions.index() === 0 && !!CS.missions.markerPos() };
});
console.log(`${checks.entered ? 'PASS' : 'FAIL'} enter parked car`);
console.log(`${checks.mission ? 'PASS' : 'FAIL'} mission 0 active with marker`);
console.log(`${errors.length ? 'FAIL' : 'PASS'} no page errors${errors.length ? `: ${errors.join('; ')}` : ''}`);
await browser.close();
if (!started || moved <= 0.1 || !checks.entered || !checks.mission || errors.length) process.exitCode = 1;
