(function () {
  const active = [];
  function spawn(scene, count) {
    for (let i = 0; i < count; i++) {
      const p = CS.city.randomRoadPoint(), car = CS.vehicles.createCar(i % 4 === 0 ? 'taxi' : 'sedan');
      car.position.set(p.x, 0, p.z); car.rotation.y = CS.random() < 0.5 ? 0 : Math.PI / 2;
      car.userData.aiSpeed = 9 + CS.random() * 7; car.userData.aiTurn = 0; scene.add(car); active.push(car);
    }
  }
  function update(dt) {
    active.forEach(car => {
      const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(car.quaternion);
      let throttle = car.userData.aiSpeed / CS.config.car.topSpeed;
      for (const other of active) if (other !== car && other.position.distanceTo(car.position) < 8 && other.position.clone().sub(car.position).dot(dir) > 0) { throttle *= 0.1; break; }
      if (CS.random() < dt * 0.025 && car.userData.aiTurn <= 0) { car.rotation.y += (CS.random() < 0.5 ? -1 : 1) * Math.PI / 2; car.userData.aiTurn = 3; }
      car.userData.aiTurn -= dt;
      CS.vehicles.update(car, { throttle, steer: 0 }, dt);
      if (Math.abs(car.position.x) > 560 || Math.abs(car.position.z) > 560) { car.rotation.y += Math.PI; car.position.clampScalar(-550, 550); }
    });
  }
  CS.traffic = { spawn, update, get cars() { return active; } };
}());
