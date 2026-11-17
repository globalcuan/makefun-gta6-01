(function () {
  const plans = [
    { title: 'First Wheels', lines: ['Find a car and take it.', 'Drive to the marker at the south avenue.'], reward: 300, marker: { x: 240, z: -120 }, type: 'drive' },
    { title: 'Sunset Courier', lines: ['A package needs to reach the north docks.', 'Drop the package at the north docks'], reward: 500, marker: { x: -360, z: 240 }, type: 'timed', limit: 120 },
    { title: 'Harbor Heat', lines: ['Make some noise, then shake the police.', 'Reach the harbor once the heat is gone.'], reward: 800, marker: { x: 0, z: 480 }, type: 'heat' },
    { title: 'The Big Score', lines: ['Get inside the bank and wait for the crew.', 'Escape to the beach with a three star wanted level.'], reward: 2000, marker: { x: -120, z: -360 }, escape: { x: 120, z: 480 }, type: 'bank' }
  ];
  let index = -1, phase = '', timer = 0, inside = 0, markerMesh = null, beacon = null, label = null;
  function makeMarker(position) {
    if (markerMesh) { markerMesh.parent.remove(markerMesh); beacon.parent.remove(beacon); label.parent.remove(label); }
    const group = new THREE.Group(); group.position.set(position.x, 0, position.z);
    markerMesh = new THREE.Mesh(new THREE.CircleGeometry(5, 32), new THREE.MeshBasicMaterial({ color: 0xffd52e, transparent: true, opacity: 0.65, side: THREE.DoubleSide })); markerMesh.rotation.x = -Math.PI / 2; group.add(markerMesh); CS.main.scene().add(group);
    beacon = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 60, 12), new THREE.MeshBasicMaterial({ color: 0xff38c8, emissive: 0xff24bc, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false })); beacon.position.set(position.x, 30, position.z); CS.main.scene().add(beacon);
    const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 64; const ctx = canvas.getContext('2d'); ctx.font = 'bold 30px system-ui'; ctx.fillStyle = '#fff3b0'; ctx.textAlign = 'center'; ctx.fillText('OBJECTIVE', 128, 42);
    const texture = new THREE.CanvasTexture(canvas); label = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true })); label.position.set(position.x, 64, position.z); label.scale.set(12, 3, 1); CS.main.scene().add(label);
  }
  function startMission(i) { index = Math.max(0, Math.min(3, i)); phase = index === 3 ? 'bank' : 'go'; timer = plans[index].limit || 0; inside = 0; say(plans[index].lines); makeMarker(plans[index].marker); }
  function say(lines) { if (CS.shots && CS.shots.active()) return; lines.forEach((line, i) => setTimeout(() => CS.hud.banner(line, 2600), i * 2700)); }
  function complete() {
    const plan = plans[index]; CS.state.money = (CS.state.money || 0) + plan.reward; CS.audio.sting(); CS.save.save(); index++;
    if (index >= plans.length) { CS.state.money += 5000; CS.hud.banner('COSTA SERENA COMPLETE — $5,000 BONUS', 7000); phase = 'done'; removeMarker(); }
    else { phase = 'ready'; CS.hud.banner(plan.title + ' complete — $' + plan.reward, 3000); }
  }
  function removeMarker() { if (markerMesh) { markerMesh.parent.remove(markerMesh); beacon.parent.remove(beacon); label.parent.remove(label); markerMesh = beacon = label = null; } }
  function update(dt) {
    if (phase === 'ready') { startMission(index); return; }
    if (index < 0 || phase === 'done') return;
    const plan = plans[index], p = CS.player.state.position; if (plan.type === 'timed' && phase === 'go') { timer -= dt; if (timer <= 0) { timer = 0; phase = 'failed'; CS.hud.banner('Courier missed the deadline', 3500); } }
    if (phase === 'failed') return;
    let d = Math.hypot(p.x - (phase === 'escape' ? plan.escape.x : plan.marker.x), p.z - (phase === 'escape' ? plan.escape.z : plan.marker.z));
    if (plan.type === 'heat' && phase === 'go') { if (CS.police.getStars() >= 2) phase = 'lose'; return; }
    if (phase === 'lose') { if (CS.police.getStars() === 0 && d < 12) complete(); return; }
    if (plan.type === 'bank' && phase === 'bank' && d < 12) { phase = 'inside'; inside = 0; CS.hud.banner('Stay inside the bank for 10 seconds', 3000); }
    if (phase === 'inside') { inside += dt; if (inside >= 10) { phase = 'escape'; CS.police.setStars(3); makeMarker(plan.escape); } return; }
    if ((plan.type === 'drive' || plan.type === 'timed' || plan.type === 'bank' && phase === 'escape') && d < 12) complete();
  }
  function currentObjective() { if (index < 0) return 'Start the story'; if (phase === 'done') return 'Costa Serena complete'; const plan = plans[index]; const seconds = plan.type === 'timed' && phase === 'go' ? '  ' + Math.floor(timer / 60) + ':' + String(Math.floor(timer % 60)).padStart(2, '0') : ''; return plan.title + ': ' + (phase === 'lose' ? 'lose the wanted level' : phase === 'inside' ? 'wait ' + Math.max(0, Math.ceil(10 - inside)) + 's' : phase === 'escape' ? 'escape to the beach' : 'reach the marker') + seconds; }
  function markerPos() { if (index < 0 || phase === 'done') return null; return phase === 'escape' ? plans[index].escape : plans[index].marker; }
  CS.missions = { startMission, update, currentObjective, markerPos, setTimer: value => { timer = value; }, index: () => Math.max(0, index), completed: () => Math.max(0, Math.min(4, index)), addHeat() { CS.police.addHeat(1); } };
}());
