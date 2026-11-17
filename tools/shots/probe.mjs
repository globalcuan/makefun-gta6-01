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
  await page.goto(`http://localhost:8080/index.html${shot.query}`, { waitUntil: 'load' });
  await new Promise(resolve => setTimeout(resolve, 4000));
  const result = await page.evaluate(() => {
    const p = CS.player.state.position, camera = CS.main.camera(), forward = new THREE.Vector3();
    camera.updateMatrixWorld(true);
    camera.getWorldDirection(forward);
    const look = camera.position.clone().add(forward.multiplyScalar(10));
    const nearest = CS.city.colliders.map(c => {
      const x = Math.max(c.minX, Math.min(camera.position.x, c.maxX));
      const z = Math.max(c.minZ, Math.min(camera.position.z, c.maxZ));
      return { collider: c, distance: Math.hypot(camera.position.x - x, camera.position.z - z) };
    }).sort((a, b) => a.distance - b.distance)[0];
    const banner = document.querySelector('#cs-banner');
    return {
      name: CS.shots.name(), player: { pos: p.toArray(), yaw: CS.player.state.yaw, inCar: !!CS.player.state.inCar },
      camera: { position: camera.position.toArray(), forwardPoint10: look.toArray() },
      markerPos: CS.missions.markerPos(), objective: CS.missions.currentObjective(),
      banner: { text: banner?.textContent, visible: !!banner && getComputedStyle(banner).display !== 'none' && getComputedStyle(banner).visibility !== 'hidden' },
      hud: { money: document.querySelector('#cs-money')?.textContent, stars: document.querySelector('#cs-stars')?.textContent },
      cameraOnRoad: CS.city.isOnRoad(camera.position.x, camera.position.z), nearestBuilding: nearest,
    };
  });
  console.log(JSON.stringify(result));
  await browser.close();
}
