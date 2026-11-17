(function () {
  const cars = [], cfg = CS.config;
  const material = color => new THREE.MeshStandardMaterial({ color, roughness: 0.65 });
  function createCar(type, color) {
    const car = new THREE.Group(); car.userData.type = type || 'sedan'; car.userData.speed = 0; car.userData.steer = 0; car.userData.wheels = [];
    const paint = material(color || [0x9d332d, 0x286e73, 0xd4a34f, 0x303a48][Math.floor(CS.random() * 4)]);
    const body = new THREE.Mesh(new THREE.BoxGeometry(2, 0.8, 4), paint); body.position.y = 0.85; body.castShadow = true; car.add(body);
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.75, 2), material(0x425b63)); cabin.position.set(0, 1.55, -0.15); car.add(cabin);
    if (type === 'pickup') { const bed = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.45, 1.25), paint); bed.position.set(0, 1.22, 1.25); car.add(bed); }
    if (type === 'van') { cabin.scale.set(1.18, 1.25, 1.35); cabin.position.y = 1.55; }
    const wheels = [];
    for (const x of [-0.95, 0.95]) for (const z of [-1.25, 1.25]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.28, 10), material(0x202326));
      wheel.rotation.z = Math.PI / 2; wheel.position.set(x, 0.48, z); car.add(wheel); wheels.push(wheel);
    }
    for (const x of [-0.65, 0.65]) {
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.2, 0.08), material(0xffe1a0)); head.position.set(x, 0.95, -2.03); car.add(head);
      const tail = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.2, 0.08), material(0xe34937)); tail.position.set(x, 0.95, 2.03); car.add(tail);
    }
    if (type === 'interceptor') { const bar = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.18, 0.35), material(0x318dce)); bar.position.y = 2; car.add(bar); }
    car.userData.wheels = wheels; car.userData.steerWheels = wheels.slice(0, 2); return car;
  }
  function update(car, controls, dt) {
    const data = car.userData, forward = new THREE.Vector3(0, 0, -1).applyQuaternion(car.quaternion);
    const throttle = controls.throttle || 0, brake = controls.brake ? 1 : 0, handbrake = controls.handbrake ? 1 : 0;
    data.speed += throttle * cfg.car.accel * dt;
    if (brake) data.speed -= Math.sign(data.speed) * cfg.car.accel * 1.3 * dt;
    data.speed = THREE.MathUtils.clamp(data.speed, -cfg.car.topSpeed * 0.35, cfg.car.topSpeed);
    data.speed *= Math.pow(handbrake ? 0.992 : 0.985, dt * 60);
    data.steer = controls.steer || 0;
    car.rotation.y += data.steer * cfg.car.steer * Math.min(1, Math.abs(data.speed) / 8) * dt * Math.sign(data.speed || 1) * (handbrake ? 1.5 : 1);
    forward.set(0, 0, -1).applyQuaternion(car.quaternion);
    const next = car.position.clone().addScaledVector(forward, data.speed * dt);
    let hit = false;
    for (const a of CS.city.colliders) if (next.x > a.minX - 1 && next.x < a.maxX + 1 && next.z > a.minZ - 1 && next.z < a.maxZ + 1) { hit = true; break; }
    if (hit) { data.speed *= -0.15; } else car.position.copy(next);
    data.wheels.forEach(wheel => { wheel.rotation.x += data.speed * dt / 0.42; });
    data.steerWheels.forEach(wheel => { wheel.rotation.y = data.steer * 0.35; });
  }
  function spawnParkedCars(scene, count) {
    for (let i = 0; i < count; i++) { const p = CS.city.randomRoadPoint(); const car = createCar(['sedan','coupe','pickup','taxi','van'][i % 5]); car.position.set(p.x + 12, 0, p.z + 12); scene.add(car); cars.push(car); }
  }
  function nearestCar(pos, maxDist) { let best = null, distance = maxDist; cars.forEach(car => { const d = car.position.distanceTo(pos); if (d < distance) { best = car; distance = d; } }); return best; }
  CS.vehicles = { createCar, update, spawnParkedCars, nearestCar, get cars() { return cars; } };
}());
