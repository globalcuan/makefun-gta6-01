(function () {
  let wanted = 0, heatCooldown = 0, bustedTime = 0, sceneRef, blink = 0;
  const units = [];
  function addHeat(amount) { if (heatCooldown > 0) return; wanted = Math.min(5, wanted + Math.max(1, Math.floor(amount || 1))); heatCooldown = 1.5; }
  function createUnit() {
    const car = CS.vehicles.createCar('interceptor', 0x182d45); car.userData.police = true;
    const bar = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.18, 0.35), new THREE.MeshStandardMaterial({ color: 0x246bff, emissive: 0x1644ff, emissiveIntensity: 2 })); bar.position.set(0, 2.02, 0); car.add(bar); car.userData.lightbar = bar; sceneRef.add(car); units.push(car); return car;
  }
  function decay(dt, speed, hidden) { heatCooldown = Math.max(0, heatCooldown - dt); if (speed < 2 || hidden) { decay.wait = (decay.wait || 0) + dt; if (decay.wait > (hidden ? 5 : 18)) { decay.rate = (decay.rate || 0) + dt; if (decay.rate >= 18) { wanted = Math.max(0, wanted - 1); decay.rate = 0; } } } else { decay.wait = 0; decay.rate = 0; } }
  function update(dt, playerPos, inCar, speed) {
    blink += dt; const count = wanted < 1 ? 0 : wanted < 3 ? 1 : wanted === 3 ? 2 : 3;
    while (units.length < count) createUnit();
    while (units.length > count) { const car = units.pop(); sceneRef.remove(car); const i = CS.vehicles.cars.indexOf(car); if (i >= 0) CS.vehicles.cars.splice(i, 1); }
    units.forEach((car, i) => {
      const dx = playerPos.x - car.position.x, dz = playerPos.z - car.position.z; car.rotation.y = Math.atan2(-dx, -dz);
      CS.vehicles.update(car, { throttle: Math.min(1, 0.55 + Math.hypot(dx, dz) / 80), steer: 0 }, dt);
      car.userData.lightbar.material.color.setHex(Math.floor(blink * 5 + i) % 2 ? 0xff2638 : 0x246bff);
      car.userData.lightbar.material.emissive.setHex(Math.floor(blink * 5 + i) % 2 ? 0xff1010 : 0x1644ff);
      if (!inCar && car.position.distanceTo(playerPos) < 2.5) bustedTime += dt; else if (!inCar) bustedTime = 0;
    });
    if (bustedTime >= 2) busted();
    decay(dt, speed, false);
  }
  function busted() { bustedTime = 0; wanted = 0; CS.state.money = Math.floor((CS.state.money || 0) * 0.9); CS.player.state.position.set(-480, 0, -480); CS.hud.showCenter('BUSTED', 'You lost 10% of your cash'); }
  function wasted() { wanted = 0; CS.player.state.position.set(480, 0, 480); CS.combat.health = 100; CS.hud.showCenter('WASTED', 'Recovered at the hospital'); }
  function init(scene) { sceneRef = scene; }
  CS.police = { init, update, addHeat, decay, busted, wasted, getStars: () => wanted, setStars: value => { wanted = Math.max(0, Math.min(5, value)); }, cars: () => units };
}());
