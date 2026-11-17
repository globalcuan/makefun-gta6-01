(function () {
  const CS = window.CS, people = [];
  function spawn(scene, count) {
    const rng = CS.shotRng || CS.rng(9482);
    for (let i = 0; i < count; i++) {
      const p = CS.city.randomRoadPoint(rng), person = new THREE.Group(); const skin = new THREE.MeshStandardMaterial({ color: [0xa85e43, 0xd49b72, 0x704631][i % 3] });
      const torso = new THREE.Mesh(new THREE.CylinderGeometry(.28, .36, 1.05, 7), new THREE.MeshStandardMaterial({ color: [0x3f8f8a, 0xc96f4a, 0x35435a][i % 3] })); torso.position.y = 1.05; person.add(torso);
      const head = new THREE.Mesh(new THREE.SphereGeometry(.27, 8, 7), skin); head.position.y = 1.78; person.add(head);
      const legs = []; for (const x of [-.16, .16]) { const leg = new THREE.Mesh(new THREE.BoxGeometry(.18, .7, .2), new THREE.MeshStandardMaterial({ color: 0x34343b })); leg.position.set(x, .38, 0); person.add(leg); legs.push(leg); }
      person.position.set(p.x + (rng() < .5 ? 12 : -12), 0, p.z + (rng() < .5 ? 12 : -12)); person.userData = { heading: rng() * Math.PI * 2, phase: rng() * 6, legs }; scene.add(person); people.push(person);
    }
  }
  function update(dt) {
    for (const person of people) {
      const data = person.userData, nearby = CS.vehicles.cars.find(car => car.position.distanceTo(person.position) < 7);
      if (nearby) data.heading = Math.atan2(person.position.x - nearby.position.x, person.position.z - nearby.position.z);
      else if (Math.random() < dt * .35) data.heading += (Math.random() - .5) * 1.4;
      person.position.x = THREE.MathUtils.clamp(person.position.x + Math.sin(data.heading) * 1.2 * dt, -589, 589); person.position.z = THREE.MathUtils.clamp(person.position.z + Math.cos(data.heading) * 1.2 * dt, -589, 589); person.rotation.y = data.heading; data.phase += dt * 7;
      data.legs[0].rotation.x = Math.sin(data.phase) * .45; data.legs[1].rotation.x = -Math.sin(data.phase) * .45;
    }
  }
  CS.pedestrians = { spawn, update, get people() { return people; } };
})();
