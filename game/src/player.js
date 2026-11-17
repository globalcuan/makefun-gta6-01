(function () {
  const CS = window.CS, state = { position: new THREE.Vector3(0, 0, 18), yaw: 0, pitch: .28, inCar: null }, legs = [];
  let mesh, camera;
  function create(scene) {
    mesh = new THREE.Group(); const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x3f8f8a });
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(.36, .45, .8, 9), bodyMaterial); torso.position.y = 1.05; mesh.add(torso);
    const head = new THREE.Mesh(new THREE.SphereGeometry(.28, 10, 8), new THREE.MeshStandardMaterial({ color: 0xc88d68 })); head.position.y = 1.85; mesh.add(head);
    for (const x of [-.18, .18]) { const leg = new THREE.Mesh(new THREE.BoxGeometry(.22, .72, .24), new THREE.MeshStandardMaterial({ color: 0x34343a })); leg.position.set(x, .4, 0); mesh.add(leg); legs.push(leg); }
    mesh.position.copy(state.position); scene.add(mesh);
  }
  function setCamera(value) { camera = value; }
  function syncVisual() { if (mesh) { mesh.position.copy(state.position); mesh.visible = !state.inCar; } }
  function update(dt, input) {
    const mouse = input.consumeMouse(); state.yaw -= mouse.x * .0025; state.pitch = THREE.MathUtils.clamp(state.pitch - mouse.y * .002, CS.config.camera.minPitch, CS.config.camera.maxPitch);
    const axis = input.axis();
    if (input.pressed('e')) {
      if (state.inCar) { const car = state.inCar; state.position.set(car.position.x + Math.cos(car.rotation.y) * 2.5, 0, car.position.z - Math.sin(car.rotation.y) * 2.5); state.inCar = null; mesh.visible = true; }
      else { const car = CS.vehicles.nearestCar(state.position, 4); if (car) { state.inCar = car; mesh.visible = false; } }
    }
    if (state.inCar) {
      CS.vehicles.update(state.inCar, { throttle: -axis.z, steer: axis.x, brake: input.keys[' '], handbrake: input.keys[' '] }, dt);
      state.position.set(state.inCar.position.x, 0, state.inCar.position.z);
    }
    else {
      const speed = input.keys.shift ? CS.config.player.run : CS.config.player.walk, forwardX = -Math.sin(state.yaw), forwardZ = -Math.cos(state.yaw), sideX = Math.cos(state.yaw), sideZ = -Math.sin(state.yaw);
      state.position.x += (forwardX * -axis.z + sideX * axis.x) * speed * dt; state.position.z += (forwardZ * -axis.z + sideZ * axis.x) * speed * dt;
      state.position.x = THREE.MathUtils.clamp(state.position.x, -590, 590); state.position.z = THREE.MathUtils.clamp(state.position.z, -590, 590); mesh.position.copy(state.position); mesh.rotation.y = state.yaw;
      const swing = Math.sin(performance.now() * .012) * Math.min(1, Math.hypot(axis.x, axis.z)) * .55; legs[0].rotation.x = swing; legs[1].rotation.x = -swing;
    }
    const targetPos = state.inCar ? state.inCar.position : state.position; const target = targetPos.clone().add(new THREE.Vector3(0, 1.5, 0));
    const distance = CS.config.camera.distance, horizontal = Math.cos(state.pitch) * distance;
    camera.position.set(target.x + Math.sin(state.yaw) * horizontal, target.y + Math.sin(state.pitch) * distance + 1, target.z + Math.cos(state.yaw) * horizontal); camera.lookAt(target);
  }
  CS.player = { create, update, setCamera, syncVisual, state };
})();
