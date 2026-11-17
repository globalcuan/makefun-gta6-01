(function () {
  const CS = window.CS;
  const missions = [
    { title: 'First Wheels', briefing: ['Find a ride.', 'Drive to the yellow marker.'], reward: 300, target: [240, -120], objective: 'Drive to the marker' },
    { title: 'Sunset Courier', briefing: ['Package secured.', 'Drop the package at the north docks'], reward: 500, target: [-360, 240], objective: 'Deliver the package', timer: 120 },
    { title: 'Harbor Heat', briefing: ['Make some noise, then lose the heat.', 'Reach the harbor marker.'], reward: 800, target: [0, 480], objective: 'Lose the cops and reach the harbor' },
    { title: 'The Big Score', briefing: ['Get inside the bank.', 'Wait for the vault.', 'Escape to the beach.'], reward: 2000, target: [-120, -360], objective: 'Reach the bank' }
  ];
  let index = 0, step = 0, elapsed = 0, beacon = null, disc = null, label = null;
  function markerPos() { const m = missions[index]; if (!m || (index === 3 && step < 2)) return null; const p = index === 3 && step === 2 ? [120, 480] : m.target; return { x: p[0], z: p[1] }; }
  function currentObjective() { const m = missions[index]; return m ? m.title + ' — ' + (index === 3 && step === 1 ? 'Wait inside' : index === 3 && step === 2 ? 'Escape to the beach' : m.objective) : 'Costa Serena complete'; }
  function clearMarker() { if (beacon) { CS.city.scene.remove(beacon); CS.city.scene.remove(disc); CS.city.scene.remove(label); } beacon = disc = label = null; }
  function makeMarker() {
    clearMarker(); const pos = markerPos(); if (!pos) return;
    disc = new THREE.Mesh(new THREE.CylinderGeometry(7, 7, .12, 32), new THREE.MeshBasicMaterial({ color: 0xffd43b, transparent: true, opacity: .62 })); disc.position.set(pos.x, .08, pos.z); CS.city.scene.add(disc);
    beacon = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 60, 16), new THREE.MeshBasicMaterial({ color: 0xff4ca8, emissive: 0xff1684, transparent: true, opacity: .35, blending: THREE.AdditiveBlending, depthWrite: false })); beacon.position.set(pos.x, 30, pos.z); CS.city.scene.add(beacon);
    const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 64; const c = canvas.getContext('2d'); c.fillStyle = '#fff'; c.font = 'bold 30px system-ui'; c.textAlign = 'center'; c.fillText('OBJECTIVE', 128, 43); const tex = new THREE.CanvasTexture(canvas); label = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true })); label.position.set(pos.x, 64, pos.z); label.scale.set(12, 3, 1); CS.city.scene.add(label);
  }
  function startMission(i) { index = Math.max(0, Math.min(missions.length - 1, i)); step = 0; elapsed = 0; const m = missions[index]; m.briefing.forEach((line, n) => setTimeout(() => CS.hud.banner(line, 2400), n * 1900)); makeMarker(); }
  function finish() { const m = missions[index]; CS.state.money += m.reward; CS.audio.sting(); CS.save.save(); index++; step = 0; if (index >= missions.length) { CS.state.money += 5000; clearMarker(); CS.hud.showCenter('COSTA SERENA COMPLETE', '$5,000 bonus'); CS.audio.sting(); CS.save.save(); } else startMission(index); }
  function update(dt) {
    if (!missions[index]) return; elapsed += dt; if (index === 1 && elapsed >= 120) { elapsed = 0; CS.hud.banner('Package lost — try again'); }
    if (index === 2 && step === 0 && CS.police.getStars() >= 2) step = 1;
    if (index === 2 && step === 1 && CS.police.getStars() === 0) step = 2;
    if (index === 3 && step === 1 && elapsed >= 10) { step = 2; CS.police.setWanted(3); makeMarker(); }
    const p = markerPos(); if (!p) return; const player = CS.player.state.position;
    if (Math.hypot(player.x - p.x, player.z - p.z) < 12) {
      if (index === 0 && (!CS.player.state.inCar)) return;
      if (index === 2 && step < 2) return;
      if (index === 3 && step === 0) { step = 1; elapsed = 0; makeMarker(); return; }
      if (index === 3 && step === 1) return;
      finish();
    }
  }
  CS.missions = { startMission, update, currentObjective, markerPos, timeRemaining: () => index === 1 ? Math.max(0, 120 - elapsed) : null, index: () => index, completed: () => index };
})();
