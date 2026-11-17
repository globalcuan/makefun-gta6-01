import puppeteer from 'puppeteer';
import { readFile } from 'node:fs/promises';

const shots = JSON.parse(await readFile(new URL('../../shots.json', import.meta.url), 'utf8'));
for (const shot of shots) {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--disable-gpu-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    await page.evaluateOnNewDocument(() => { const hook = setInterval(() => { if (!window.THREE?.WebGLRenderer) return; clearInterval(hook); const original = THREE.WebGLRenderer.prototype.render; THREE.WebGLRenderer.prototype.render = function (scene, camera) { window.__probeCamera = camera; return original.call(this, scene, camera); }; }, 0); });
    await page.goto(`http://localhost:8080/index.html${shot.query}`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.CS?.player && window.THREE?.WebGLRenderer);
    await new Promise(resolve => setTimeout(resolve, 4000));
    const result = await page.evaluate(() => {
      const CS = window.CS;
      const mode = new URLSearchParams(location.search).get('shot'), p = CS.player.state.position;
      const cp = new THREE.Vector3(), target = new THREE.Vector3();
      if (mode === 'cover') { cp.set(p.x, 3, p.z + 7); target.set(p.x, 1.2, p.z - 16); }
      else if (mode === 'chase') { const car = CS.player.state.inCar; cp.set(car.position.x, 4.2, car.position.z + 8); target.set(car.position.x, 1, car.position.z - 12); }
      else if (mode === 'mission') { const m = CS.missions.markerPos(); cp.set(-420, 8, m.z); target.set(m.x, 1, m.z); }
      else { cp.set(0, 55, 560); target.set(0, -100, -80); }
      const forward = target.clone().sub(cp).normalize().multiplyScalar(10).add(cp);
      const closest = CS.city.colliders.map(box => {
        const x = Math.max(box.minX, Math.min(cp.x, box.maxX));
        const z = Math.max(box.minZ, Math.min(cp.z, box.maxZ));
        const dx = cp.x - x, dz = cp.z - z;
        return { box, distance: Math.hypot(dx, dz) };
      }).sort((a, b) => a.distance - b.distance)[0];
      const banner = document.querySelector('#hud-banner');
      return {
        name: new URLSearchParams(location.search).get('shot'),
        player: { pos: CS.player.state.position.toArray(), yaw: CS.player.state.yaw, inCar: !!CS.player.state.inCar },
        camera: { position: cp.toArray(), forward10: forward.toArray() },
        markerPos: CS.missions.markerPos(), objective: CS.missions.currentObjective(),
        banner: { text: banner?.textContent, visible: !!banner && getComputedStyle(banner).display !== 'none' && getComputedStyle(banner).visibility !== 'hidden' && banner.getBoundingClientRect().width > 0 },
        hud: { money: document.querySelector('#hud-money')?.textContent, stars: document.querySelector('#hud-stars')?.textContent, hint: document.querySelector('#hud-hint')?.textContent },
        cameraOnRoad: CS.city.isOnRoad(cp.x, cp.z),
        nearestBuilding: { collider: closest?.box, distance: closest?.distance }
      };
    });
    console.log(JSON.stringify(result));
  } finally { await browser.close(); }
}
