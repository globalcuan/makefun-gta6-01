(function () {
  const CS = window.CS, agents = [];
  function spawn(scene, count) {
    const rng = CS.shotRng || CS.rng(7701); const types = ['sedan', 'taxi', 'coupe', 'van'];
    for (let i = 0; i < count; i++) { const p = CS.city.randomRoadPoint(rng), vertical = Math.abs(p.x / 120 - Math.round(p.x / 120)) < .01; const yaw = vertical ? (rng() < .5 ? 0 : Math.PI) : (rng() < .5 ? Math.PI / 2 : -Math.PI / 2); const car = CS.vehicles.register(scene, CS.vehicles.createCar(types[i % types.length], [0x3f8f8a, 0xc96f4a, 0xe8c98f][i % 3]), p.x, p.z, yaw); car.userData.aiSpeed = 9 + rng() * 7; agents.push(car); }
  }
  function update(dt) {
    for (const car of agents) {
      const pos = car.position, yaw = car.rotation.y;
      if (Math.abs(pos.x) > 560 || Math.abs(pos.z) > 560) car.rotation.y += Math.PI;
      const aheadX = pos.x + Math.sin(yaw) * 8, aheadZ = pos.z + Math.cos(yaw) * 8;
      const blocked = agents.some(other => other !== car && Math.hypot(other.position.x - aheadX, other.position.z - aheadZ) < 4);
      const atCrossing = Math.abs(pos.x / 120 - Math.round(pos.x / 120)) < .04 && Math.abs(pos.z / 120 - Math.round(pos.z / 120)) < .04;
      if (atCrossing && Math.random() < dt * .08) car.rotation.y += Math.random() < .5 ? Math.PI / 2 : -Math.PI / 2;
      CS.vehicles.update(car, { throttle: blocked ? .1 : 1, steer: 0 }, dt);
      car.userData.speed = Math.min(car.userData.aiSpeed, car.userData.speed || car.userData.aiSpeed);
    }
  }
  CS.traffic = { spawn, update, get cars() { return agents; } };
})();
