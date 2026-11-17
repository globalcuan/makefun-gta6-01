(function () {
  let mesh, camera, yaw = 0, pitch = 0.28, inCar = null, phase = 0;
  const position = new THREE.Vector3(0, 0, 18), legs = [];
  function create(scene) {
    mesh = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 1.2, 8), new THREE.MeshStandardMaterial({ color: 0x386c72 })); body.position.y = 1.05; mesh.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.27, 10, 8), new THREE.MeshStandardMaterial({ color: 0xc88e68 })); head.position.y = 1.85; mesh.add(head);
    for (const x of [-0.18, 0.18]) { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.72, 0.2), new THREE.MeshStandardMaterial({ color: 0x343944 })); leg.position.set(x, 0.36, 0); mesh.add(leg); legs.push(leg); }
    mesh.position.copy(position); scene.add(mesh);
  }
  function setCamera(value) { camera = value; }
  function update(dt, input) {
    const mouse = input.consumeMouse(); yaw -= mouse.x * 0.0025; pitch = THREE.MathUtils.clamp(pitch + mouse.y * 0.002, CS.config.camera.minPitch, CS.config.camera.maxPitch);
    const axis = input.axis();
    if (input.pressed('keye')) {
      if (inCar) { position.copy(inCar.position); position.x += 2.5; inCar = null; mesh.visible = true; }
      else { inCar = CS.vehicles.nearestCar(position, 4); if (inCar) { mesh.visible = false; } }
    }
    if (inCar) {
      CS.vehicles.update(inCar, { throttle: -axis.z, steer: axis.x, brake: input.isDown('space'), handbrake: input.isDown('space') }, dt);
      position.copy(inCar.position);
    } else {
      const speed = input.isDown('shift') ? CS.config.player.run : CS.config.player.walk;
      const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
      const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
      position.addScaledVector(forward, -axis.z * speed * dt); position.addScaledVector(right, axis.x * speed * dt);
      position.x = THREE.MathUtils.clamp(position.x, -590, 590); position.z = THREE.MathUtils.clamp(position.z, -590, 590);
      mesh.position.copy(position); mesh.rotation.y = yaw; phase += Math.hypot(axis.x, axis.z) * dt * 9;
      legs.forEach((leg, i) => { leg.rotation.x = Math.sin(phase + i * Math.PI) * Math.min(0.6, Math.hypot(axis.x, axis.z) * 0.5); });
    }
    const target = position.clone().add(new THREE.Vector3(0, 1.5, 0));
    const distance = CS.config.camera.distance, horizontal = Math.cos(pitch) * distance;
    camera.position.set(target.x + Math.sin(yaw) * horizontal, target.y + Math.sin(pitch) * distance, target.z + Math.cos(yaw) * horizontal);
    camera.lookAt(target);
  }
  CS.player = { create, update, setCamera, setPose: function (x, z, car) { position.set(x, 0, z); inCar = car || null; if (mesh) { mesh.position.copy(position); mesh.visible = !inCar; } }, setView: function (newYaw, newPitch) { yaw = newYaw; pitch = newPitch; }, get state() { return { position, pos: position, inCar, yaw, pitch }; } };
}());
