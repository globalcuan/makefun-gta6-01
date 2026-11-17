(function () {
  const people = [], vehicles = [];
  function spawn(scene, count) {
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x4b7581 }), legMat = new THREE.MeshStandardMaterial({ color: 0x393c48 });
    for (let i = 0; i < count; i++) {
      const person = new THREE.Group(); person.position.set(-570 + CS.random() * 1140, 0, -570 + CS.random() * 1040);
      const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.4, 1.25, 7), bodyMat); torso.position.y = 1.2; person.add(torso);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), new THREE.MeshStandardMaterial({ color: 0xd49a72 })); head.position.y = 2.05; person.add(head);
      const legs = [];
      for (const x of [-0.18, 0.18]) { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.8, 0.18), legMat); leg.position.set(x, 0.4, 0); person.add(leg); legs.push(leg); }
      person.userData = { legs, phase: CS.random() * 6, heading: CS.random() * Math.PI * 2, change: CS.random() * 4 };
      scene.add(person); people.push(person);
    }
    vehicles.push(...CS.vehicles.cars);
  }
  function update(dt) {
    vehicles.splice(0, vehicles.length, ...CS.vehicles.cars, ...(CS.traffic ? CS.traffic.cars : []));
    people.forEach(person => {
      const d = person.userData; d.change -= dt;
      d.stun = Math.max(0, (d.stun || 0) - dt);
      d.flee = Math.max(0, (d.flee || 0) - dt);
      if (d.change <= 0) { d.heading += (CS.random() - 0.5) * 1.5; d.change = 1 + CS.random() * 4; }
      for (const car of vehicles) if (person.position.distanceTo(car.position) < 7) { d.heading = Math.atan2(person.position.x - car.position.x, person.position.z - car.position.z); d.flee = Math.max(d.flee, 2); break; }
      const pace = d.stun > 0 ? 0 : d.flee > 0 ? 3.2 : 1.3;
      person.position.x += Math.sin(d.heading) * pace * dt; person.position.z += Math.cos(d.heading) * pace * dt;
      person.position.x = THREE.MathUtils.clamp(person.position.x, -589, 589); person.position.z = THREE.MathUtils.clamp(person.position.z, -589, 589);
      person.rotation.y = d.heading; d.phase += dt * 7;
      d.legs.forEach((leg, i) => { leg.rotation.x = Math.sin(d.phase + i * Math.PI) * 0.55; });
    });
  }
  CS.pedestrians = { spawn, update, get people() { return people; } };
}());
