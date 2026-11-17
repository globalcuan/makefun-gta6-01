(function () {
  const CS = window.CS, cars = [], colliders = () => CS.city.colliders;
  const dimensions = { sedan: [4.3, 1.35, 2], coupe: [4, 1.25, 1.9], pickup: [5, 1.6, 2.1], taxi: [4.4, 1.4, 2], van: [4.8, 2.1, 2.2], interceptor: [4.5, 1.45, 2] };
  function createCar(type, color) {
    const size = dimensions[type] || dimensions.sedan, car = new THREE.Group(); car.userData = { type, speed: 0, wheels: [], steer: 0, size };
    const mat = value => new THREE.MeshStandardMaterial({ color: value, metalness: .15, roughness: .65 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), mat(color || 0xc96f4a)); body.position.y = .85; body.castShadow = true; car.add(body);
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(size[0] * .54, size[1] * .8, size[2] * .82), mat(0x2e4a55)); cabin.position.set(-.15, 1.85, 0); cabin.castShadow = true; car.add(cabin);
    for (const x of [-1.35, 1.35]) for (const z of [-size[2] * .55, size[2] * .55]) { const wheel = new THREE.Mesh(new THREE.CylinderGeometry(.42, .42, .22, 12), mat(0x252629)); wheel.rotation.x = Math.PI / 2; wheel.position.set(x, .48, z); car.add(wheel); car.userData.wheels.push(wheel); }
    for (const z of [-.62, .62]) { const head = new THREE.Mesh(new THREE.BoxGeometry(.16, .2, .48), mat(z < 0 ? 0xffe5a3 : 0xd64c39)); head.position.set(size[0] / 2 + .03, .9, z); car.add(head); }
    if (type === 'interceptor') { const bar = new THREE.Mesh(new THREE.BoxGeometry(1.1, .18, .35), mat(0xe9d8b5)); bar.position.set(-.1, 2.45, 0); car.add(bar); }
    return car;
  }
  function update(car, control, dt) {
    const data = car.userData; const throttle = control.throttle || 0, braking = control.brake ? 1 : 0;
    data.speed += throttle * CS.config.car.accel * dt; data.speed *= Math.max(0, 1 - (braking ? 4 : control.handbrake ? 1.9 : .55) * dt); data.speed = THREE.MathUtils.clamp(data.speed, -12, CS.config.car.topSpeed);
    const steer = control.steer || 0; data.steer += (steer - data.steer) * Math.min(1, dt * 8);
    car.rotation.y += data.steer * CS.config.car.steer * Math.min(1, Math.abs(data.speed) / 8) * dt * Math.sign(data.speed || 1) * (control.handbrake ? 1.5 : 1);
    car.position.x += Math.sin(car.rotation.y) * data.speed * dt; car.position.z += Math.cos(car.rotation.y) * data.speed * dt;
    for (const wheel of data.wheels) wheel.rotation.z += data.speed * dt / .42;
    const radius = data.size[0] * .46;
    for (const hit of colliders()) if (car.position.x + radius > hit.minX && car.position.x - radius < hit.maxX && car.position.z + radius > hit.minZ && car.position.z - radius < hit.maxZ) { car.position.x -= Math.sin(car.rotation.y) * data.speed * dt; car.position.z -= Math.cos(car.rotation.y) * data.speed * dt; data.speed *= -.15; break; }
  }
  function register(scene, car, x, z, yaw) { car.position.set(x, 0, z); car.rotation.y = yaw || 0; scene.add(car); cars.push(car); return car; }
  function spawnParkedCars(scene, count) { const types = Object.keys(dimensions), palette = [0xc96f4a, 0xd9a05b, 0x3f8f8a, 0x34363a, 0xe8c98f]; for (let i = 0; i < count; i++) { const p = CS.city.randomRoadPoint(CS.rng(200 + i)); const lane = (i % 2 ? 5 : -5); register(scene, createCar(types[i % types.length], palette[i % palette.length]), p.x + lane, p.z, p.x === Math.round(p.x / 120) * 120 ? 0 : Math.PI / 2); } }
  function nearestCar(pos, maxDist) { let best = null, distance = maxDist; for (const car of cars) { const d = car.position.distanceTo(pos); if (d < distance) { best = car; distance = d; } } return best; }
  CS.vehicles = { createCar, update, spawnParkedCars, nearestCar, get cars() { return cars; }, register };
})();
