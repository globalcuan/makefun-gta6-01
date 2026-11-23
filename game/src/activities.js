(function () {
  const packageSpots = [
    { x: -420, z: 650 }, { x: 365, z: 590 }, { x: -510, z: 170 }, { x: 455, z: 120 },
    { x: -245, z: -265 }, { x: 275, z: -315 }, { x: -75, z: 65 }, { x: 520, z: -145 },
    { x: -350, z: -520 }, { x: 85, z: 330 }
  ];
  const checkpoints = [
    { x: 185, z: 455 }, { x: 300, z: 360 }, { x: 265, z: 170 },
    { x: 80, z: 45 }, { x: -175, z: 145 }, { x: -300, z: 390 }
  ];
  let packages = [], startRing = null, checkpointRing = null, scene = null;
  let race = 'idle', checkpoint = 0, timer = 0, elapsed = 0;
  function makeRing(color, radius) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.7, 10, 32), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .9, depthWrite: false }));
    ring.rotation.x = Math.PI / 2; ring.position.y = 1.2; return ring;
  }
  function makeStartRing() {
    const group = new THREE.Group(); group.position.set(60, 1.1, 455);
    for (let i = 0; i < 12; i++) {
      const arc = new THREE.Mesh(new THREE.TorusGeometry(6, .7, 8, 8, Math.PI * 2 / 12 * .82), new THREE.MeshBasicMaterial({ color: i % 2 ? 0xffd451 : 0xfff0b0, transparent: true, opacity: .95, depthWrite: false }));
      arc.rotation.x = Math.PI / 2; arc.rotation.z = i * Math.PI * 2 / 12; group.add(arc);
    }
    return group;
  }
  function init() {
    scene = CS.main.scene();
    if (CS.save && typeof CS.save.load === 'function') { const saved = CS.save.load(); if (saved) CS.state.hiddenPackages = saved.hiddenPackages || 0; }
    const crateMat = new THREE.MeshStandardMaterial({ color: 0xe6a83d, emissive: 0x9a4a0d, emissiveIntensity: .8, metalness: .25, roughness: .35 });
    const glowTextureCanvas = document.createElement('canvas'); glowTextureCanvas.width = glowTextureCanvas.height = 64;
    const ctx = glowTextureCanvas.getContext('2d'), gradient = ctx.createRadialGradient(32, 32, 2, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255,220,100,.9)'); gradient.addColorStop(1, 'rgba(255,170,30,0)'); ctx.fillStyle = gradient; ctx.fillRect(0, 0, 64, 64);
    const glowTexture = new THREE.CanvasTexture(glowTextureCanvas);
    packageSpots.forEach((pos, i) => {
      const group = new THREE.Group(); group.position.set(pos.x, 0, pos.z);
      const box = new THREE.Mesh(new THREE.BoxGeometry(1.35, 1.05, 1.15), crateMat); box.position.y = .7; box.castShadow = true; group.add(box);
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, color: 0xffd86b, transparent: true, opacity: .75, blending: THREE.AdditiveBlending, depthWrite: false }));
      glow.position.y = 1.1; glow.scale.set(4.8, 4.8, 1); group.add(glow); group.userData.phase = i * .8; scene.add(group);
      const collected = i < packageCount(); group.visible = !collected; packages.push({ group, position: pos, collected });
    });
    startRing = makeStartRing(); scene.add(startRing);
    checkpointRing = makeRing(0x32e5ff, 7); checkpointRing.visible = false; scene.add(checkpointRing);
  }
  function packageCount() { return Math.max(0, Math.min(10, Number(CS.state.hiddenPackages) || 0)); }
  function packagesLeft() { return Math.max(0, 10 - packageCount()); }
  function packagePositions() { return packages.filter(item => !item.collected).map(item => item.position); }
  function raceState() { return race === 'active' ? { active: true, checkpoint: checkpoint + 1, total: checkpoints.length, position: checkpoints[checkpoint], time: timer } : { active: false, state: race }; }
  function say(text) { if (!(CS.shots && CS.shots.active())) CS.hud.banner(text, 2600); }
  function persist() { if (CS.save && typeof CS.save.save === 'function') CS.save.save(); }
  function finish(success) {
    race = success ? 'complete' : 'failed'; checkpointRing.visible = false;
    if (success) { CS.state.money = (CS.state.money || 0) + 750; say('Race complete — +$750'); if (CS.audio && CS.audio.sting) CS.audio.sting(); persist(); }
    else say('Race failed');
  }
  function update(dt) {
    if (!scene) return;
    elapsed += dt;
    packages.forEach(item => { if (!item.collected) { item.group.rotation.y += dt * .7; item.group.position.y = Math.sin(elapsed * 2 + item.group.userData.phase) * .18; } });
    startRing.rotation.z += dt * .18;
    if (CS.shots && CS.shots.active()) return;
    const player = CS.player.state, p = player.position;
    packages.forEach((item, i) => {
      if (item.collected || Math.hypot(p.x - item.position.x, p.z - item.position.z) >= 4) return;
      item.collected = true; item.group.visible = false; CS.state.hiddenPackages = packageCount() + 1; CS.state.money = (CS.state.money || 0) + 100;
      say('Hidden package ' + packageCount() + '/10 — +$100'); if (CS.audio && CS.audio.sting) CS.audio.sting(); persist();
    });
    if (race === 'idle' && player.inCar && Math.hypot(p.x - 60, p.z - 455) < 7) { race = 'active'; checkpoint = 0; timer = 90; checkpointRing.visible = true; say('Street race started — 90 seconds'); }
    if (race !== 'active') return;
    timer -= dt; if (timer <= 0) { finish(false); return; }
    const target = checkpoints[checkpoint]; checkpointRing.position.set(target.x, 1.2, target.z);
    if (Math.hypot(p.x - target.x, p.z - target.z) < 9) {
      checkpoint++; timer += 8;
      if (checkpoint >= checkpoints.length) finish(true);
      else say('Checkpoint ' + checkpoint + '/6');
    }
  }
  CS.activities = { init, update, packageCount, packagesLeft, raceState, packagePositions };
}());
