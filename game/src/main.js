(function () {
  const CS = window.CS; let renderer, scene, camera, clock, running = false, paused = true, lastSave = 0, shotMode = false;
  function safeUpdate(name, fn, ...args) { try { if (typeof fn === 'function') fn(...args); } catch (error) { console.error(name, error); } }
  function init() {
    const canvas = document.getElementById('game-canvas');
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true }); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); renderer.setSize(innerWidth, innerHeight);
    scene = CS.city.build(); camera = new THREE.PerspectiveCamera(65, innerWidth / innerHeight, .1, 2000); CS.player.create(scene); CS.player.setCamera(camera); CS.state = { money: 250 };
    safeUpdate('hud.init', CS.hud.init); safeUpdate('minimap.init', CS.minimap.init); safeUpdate('police.init', CS.police.init, scene); safeUpdate('audio.ambient', CS.audio.ambient);
    CS.vehicles.spawnParkedCars(scene, 30);
    CS.traffic.spawn(scene, 14); CS.pedestrians.spawn(scene, 24);
    safeUpdate('shots.apply', CS.shots.apply);
    const save = CS.shots.mode() ? null : CS.save.load(); if (save) { CS.state.money = save.money || 250; CS.combat.health = save.health || 100; CS.missions.startMission(save.missionIndex || 0); if (save.pos) CS.player.state.position.set(save.pos.x, 0, save.pos.z); }
    CS.input.init(canvas); clock = new THREE.Clock(); shotMode = !!CS.shots.mode();
    const continueButton = document.getElementById('continue'); continueButton.hidden = !CS.save.hasSave();
    document.getElementById('start-story').addEventListener('click', () => { CS.missions.startMission(0); start(); });
    continueButton.addEventListener('click', start); document.getElementById('free-roam').addEventListener('click', start);
    window.addEventListener('resize', resize); window.addEventListener('keydown', event => { if (event.code === 'F3') document.getElementById('debug').hidden = !document.getElementById('debug').hidden; });
    document.addEventListener('pointerlockchange', () => { if (running && !document.pointerLockElement && !shotMode) pause(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden && running) pause(); });
    if (shotMode) { document.getElementById('start-screen').hidden = true; running = true; paused = false; document.body.style.cursor = 'none'; }
    else document.getElementById('start-screen').hidden = false;
    requestAnimationFrame(loop);
  }
  function start() { document.getElementById('start-screen').hidden = true; paused = false; running = true; clock.start(); safeUpdate('audio.init', CS.audio.init); const result = document.getElementById('game-canvas').requestPointerLock?.(); if (result && result.catch) result.catch(() => {}); }
  function pause() { paused = true; running = false; safeUpdate('save.save', CS.save.save); document.getElementById('continue').hidden = !CS.save.hasSave(); document.getElementById('start-screen').hidden = false; }
  function resize() { if (!renderer || !camera) return; camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); }
  function loop(time) {
    if (!paused && !shotMode) {
      const dt = Math.min(clock.getDelta(), .05);
      if (CS.input.pressed('m')) CS.audio.toggleMute(); if (CS.input.pressed('f')) CS.combat.punch();
      safeUpdate('input', () => {});
      const previousCar = CS.player.state.inCar; safeUpdate('player', CS.player.update, dt, CS.input);
      if (!previousCar && CS.player.state.inCar) safeUpdate('car theft heat', CS.police.addHeat, 1);
      safeUpdate('vehicles', () => { for (const car of CS.vehicles.cars) if (!car.userData.isPolice && !CS.traffic.cars.includes(car) && car !== CS.player.state.inCar) CS.vehicles.update(car, { throttle: 0 }, dt); });
      safeUpdate('traffic', CS.traffic.update, dt); safeUpdate('pedestrians', CS.pedestrians.update, dt);
      safeUpdate('police', CS.police.update, dt, CS.player.state.position, CS.player.state.inCar, CS.player.state.inCar?.userData.speed || 0);
      safeUpdate('combat', CS.combat.update, dt); safeUpdate('missions', CS.missions.update, dt);
      safeUpdate('hud', CS.hud.update); safeUpdate('minimap', CS.minimap.update); safeUpdate('audio.engine', CS.audio.engine, CS.player.state.inCar ? Math.abs(CS.player.state.inCar.userData.speed) / 42 : 0); safeUpdate('audio.siren', CS.audio.siren, CS.police.getStars() > 0);
      const sea = scene.children.find(item => item.userData.animate); if (sea) safeUpdate('sea', sea.userData.animate, time / 1000);
      if (time - lastSave > 15000) { safeUpdate('autosave', CS.save.save); lastSave = time; }
    }
    if (shotMode) { safeUpdate('hud', CS.hud.update); safeUpdate('minimap', CS.minimap.update); }
    if (camera && CS.player.state) {
      if (CS.city.shotCamera) { camera.position.set(0, 55, 560); camera.lookAt(0, -100, -80); }
      if (shotMode && CS.shots.mode() === 'mission') { const marker = CS.missions.markerPos(); camera.position.set(-420, 8, marker.z); camera.lookAt(marker.x, 1, marker.z); }
      if (shotMode && CS.shots.mode() === 'cover') { const p = CS.player.state.position; camera.position.set(p.x, 3, p.z + 7); camera.lookAt(p.x, 1.2, p.z - 16); }
      if (shotMode && CS.shots.mode() === 'chase') { const car = CS.player.state.inCar; camera.position.set(car.position.x, 4.2, car.position.z + 8); camera.lookAt(car.position.x, 1, car.position.z - 12); }
    }
    renderer.render(scene, camera); requestAnimationFrame(loop);
  }
  CS.main = { init, start, pause };
  window.CS.boot = init;
  document.addEventListener('DOMContentLoaded', init, { once: true });
})();
