(function () {
  const CS = window.CS, officers = []; let wanted = 0, heatCooldown = 0, contactTime = 0, scene;
  function addHeat(amount) { if (heatCooldown > 0) return; wanted = Math.min(5, wanted + amount); heatCooldown = 1.5; syncCars(); }
  function syncCars() {
    const desired = wanted === 0 ? 0 : wanted < 3 ? 1 : wanted === 3 ? 2 : 3;
    while (officers.length < desired) { const car = CS.vehicles.createCar('interceptor', 0x263b89); car.userData.isPolice = true; car.userData.speed = 0; const lamp = new THREE.Mesh(new THREE.BoxGeometry(.45, .22, .32), new THREE.MeshStandardMaterial({ color: 0xff2020, emissive: 0xff2020, emissiveIntensity: 1 })); lamp.position.set(-.1, 2.58, 0); car.add(lamp); car.userData.light = lamp; CS.vehicles.register(scene, car, 300 + officers.length * 8, 300, 0); officers.push(car); }
    while (officers.length > desired) { const car = officers.pop(); scene.remove(car); const i = CS.vehicles.cars.indexOf(car); if (i >= 0) CS.vehicles.cars.splice(i, 1); }
  }
  function decay(dt) { const p = CS.player.state.position, hidden = Math.abs(p.x) > 500 || Math.abs(p.z) > 500, slow = !CS.player.state.inCar || Math.abs(CS.player.state.inCar.userData.speed) < 3; if (heatCooldown > 0) heatCooldown -= dt; else if (wanted && slow && hidden) { contactTime = 0; wanted = Math.max(0, wanted - dt * .035); if (wanted < 1) wanted = 0; syncCars(); } }
  function busted() { CS.hud.showCenter('BUSTED', 'You lost 10% of your cash'); CS.state.money = Math.floor(CS.state.money * .9); CS.player.state.position.set(-480, 0, -480); CS.player.state.inCar = null; wanted = 0; syncCars(); contactTime = 0; }
  function wasted() { CS.hud.showCenter('WASTED', 'Hospital — health restored'); CS.player.state.position.set(480, 0, 480); CS.player.state.inCar = null; CS.combat.health = 100; wanted = 0; syncCars(); contactTime = 0; }
  function update(dt, playerPos, inCar, speed) {
    decay(dt); let touching = false;
    officers.forEach((car, i) => { const dx = playerPos.x - car.position.x, dz = playerPos.z - car.position.z, distance = Math.hypot(dx, dz); car.rotation.y = Math.atan2(dx, dz); CS.vehicles.update(car, { throttle: Math.min(1, distance / 8), steer: 0 }, dt); car.userData.light.material.color.setHex(Math.floor(performance.now() / 220 + i) % 2 ? 0xff2020 : 0x2055ff); if (!inCar && distance < 3) touching = true; });
    if (touching) { contactTime += dt; if (contactTime >= 2) busted(); } else contactTime = 0;
  }
  function init(value) { scene = value; }
  CS.police = { init, addHeat, decay, update, getStars: () => Math.ceil(wanted), setWanted(v) { wanted = Math.max(0, Math.min(5, v)); syncCars(); }, busted, wasted, cars: () => officers };
})();
