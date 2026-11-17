(function () {
  let renderer, scene, camera, clock, running = false, paused = false, frames = 0, fpsTime = 0, saveElapsed = 0, lastCar = null;
  function safeUpdate(fn, dt, ...args) { try { if (fn) fn(dt, ...args); } catch (error) { console.error('Game update failed:', error); } }
  function init() {
    const canvas = document.getElementById('game-canvas'); renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); renderer.setSize(innerWidth, innerHeight);
    CS.state = { money: 250 }; CS.shots.apply(); scene = CS.city.build(); camera = new THREE.PerspectiveCamera(65, innerWidth / innerHeight, 0.1, 2000);
    CS.player.create(scene); CS.player.setCamera(camera); CS.input.init(canvas);
    CS.hud.init(); CS.minimap.init(); CS.police.init(scene); CS.audio.init();
    CS.vehicles.spawnParkedCars(scene, 30); CS.traffic.spawn(scene, 14); CS.pedestrians.spawn(scene, 24);
    CS.main = { init, start, loop, scene: () => scene, camera: () => camera };
    const overlay = document.getElementById('start-screen'), continueButton = document.getElementById('continue');
    document.getElementById('start-story').addEventListener('click', () => start('story')); document.getElementById('free-roam').addEventListener('click', () => start('free')); continueButton.addEventListener('click', () => start('continue'));
    if (CS.save.hasSave()) continueButton.hidden = false;
    document.addEventListener('pointerlockchange', () => { if (running && !CS.shots.active() && !document.pointerLockElement) pause(); });
    window.addEventListener('resize', resize);
    window.addEventListener('keydown', event => { if (event.code === 'F3') document.getElementById('debug').hidden = !document.getElementById('debug').hidden; if (event.code === 'Escape' && running) pause(); });
    if (CS.shots.active()) { CS.shots.compose(scene, camera); overlay.classList.add('hidden'); running = true; document.body.style.cursor = 'none'; }
    clock = new THREE.Clock(); requestAnimationFrame(loop);
  }
  function start(mode) {
    if (mode === 'continue') { const data = CS.save.load(); if (data) { CS.state.money = data.money || 250; CS.combat.health = data.health || 100; CS.player.setPose(data.pos.x, data.pos.z, null); CS.missions.startMission(data.missionIndex || 0); } }
    else if (mode === 'story') CS.missions.startMission(0);
    CS.state.mode = mode; running = true; paused = false; document.getElementById('start-screen').classList.add('hidden');
    try { const result = document.getElementById('game-canvas').requestPointerLock(); if (result && result.catch) result.catch(() => {}); } catch (_) {} clock.start();
  }
  function pause() { if (!running) return; paused = true; CS.save.save(); document.getElementById('continue').hidden = false; document.getElementById('start-story').textContent = 'START STORY'; document.getElementById('start-screen').classList.remove('hidden'); }
  function loop(time) {
    requestAnimationFrame(loop); const dt = Math.min(clock ? clock.getDelta() : 0, 0.05);
    if (running && !paused && !CS.shots.active()) {
      safeUpdate(() => {}, dt); // Input is sampled by the player and action systems.
      safeUpdate(CS.player.update.bind(CS.player), dt, CS.input);
      if (CS.input.pressed('keym')) CS.audio.toggleMute();
      const inCar = CS.player.state.inCar; if (inCar && inCar !== lastCar) { CS.police.addHeat(1); CS.audio.pickup(); } lastCar = inCar;
      safeUpdate(CS.traffic.update, dt); safeUpdate(CS.pedestrians.update, dt);
      const ps = CS.player.state; safeUpdate(CS.police.update, dt, ps.position, ps.inCar, ps.inCar ? Math.abs(ps.inCar.userData.speed) : 0);
      safeUpdate(CS.combat.update, dt); safeUpdate(CS.missions.update, dt); safeUpdate(CS.hud.update, dt); safeUpdate(CS.minimap.update, dt);
      safeUpdate(() => { CS.audio.engine(ps.inCar ? Math.abs(ps.inCar.userData.speed) / CS.config.car.topSpeed : 0); CS.audio.siren(CS.police.getStars() > 0); CS.audio.ambient(); }, dt);
      saveElapsed += dt; if (saveElapsed >= 15) { CS.save.save(); saveElapsed = 0; }
      scene.traverse(object => { if (object.userData && object.userData.animate) object.userData.animate(time / 1000); });
    } else if (CS.shots.active()) { safeUpdate(CS.hud.update, dt); safeUpdate(CS.minimap.update, dt); }
    renderer.render(scene, camera); frames++;
    if (time - fpsTime > 500) { const state = CS.player.state; document.getElementById('debug').textContent = `FPS ${Math.round(frames * 1000 / Math.max(1, time - fpsTime))} | X ${state.position.x.toFixed(1)} Z ${state.position.z.toFixed(1)}`; frames = 0; fpsTime = time; }
  }
  function resize() { if (!renderer || !camera) return; camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); }
  CS.boot = init; document.addEventListener('DOMContentLoaded', init, { once: true });
}());
