import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--disable-gpu-sandbox'] });
let failed = false;
const check = (name, ok, detail = '') => { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? `: ${detail}` : ''}`); if (!ok) failed = true; };
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('response', response => { if (response.status() >= 400) errors.push(`HTTP ${response.status()}: ${response.url()}`); });
  await page.goto('http://localhost:8080/index.html', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.CS?.main?.start && window.CS?.vehicles?.cars, { timeout: 10000 });
  await page.evaluate(() => CS.main.start());
  const movement = await page.evaluate(async () => {
    const before = CS.player.state.position.clone();
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW', key: 'w', bubbles: true }));
    await new Promise(resolve => setTimeout(resolve, 2000));
    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyW', key: 'w', bubbles: true }));
    return before.distanceTo(CS.player.state.position);
  });
  check('player moves with KeyW', movement > 0.5, `distance ${movement.toFixed(2)}`);
  const carFound = await page.evaluate(() => {
    const car = CS.vehicles.cars.find(item => !item.userData.isPolice);
    if (!car) return false;
    CS.player.state.position.copy(car.position); CS.player.state.inCar = null;
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyE', key: 'e', bubbles: true }));
    return true;
  });
  await new Promise(resolve => setTimeout(resolve, 250));
  const inCar = await page.evaluate(() => Boolean(CS.player.state.inCar));
  check('enter parked car with KeyE', carFound && inCar);
  const mission = await page.evaluate(() => ({ index: CS.missions.index(), marker: CS.missions.markerPos() }));
  check('mission 0 active with marker', mission.index === 0 && mission.marker && Number.isFinite(mission.marker.x) && Number.isFinite(mission.marker.z), JSON.stringify(mission));
  check('no browser errors', errors.length === 0, errors.join(' | '));
} catch (error) { check('smoke setup', false, error.message); }
finally { await browser.close(); }
if (failed) process.exitCode = 1;
