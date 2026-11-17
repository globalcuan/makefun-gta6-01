(function () {
  let active = false, seed = 7, shot = '';
  function apply() {
    const params = new URLSearchParams(location.search); shot = params.get('shot') || ''; seed = Number(params.get('seed')) || 7; active = !!shot; CS.shots = { apply, compose, active: () => active, name: () => shot, seed: () => seed };
    if (active) { CS.random = CS.rng(seed); CS.state.shot = shot; }
  }
  function compose(scene, camera) {
    const player = CS.player.state, cars = CS.vehicles.cars;
    const setPlayer = (x, z, car) => { player.position.set(x, 0, z); CS.player.setPose(x, z, car || null); };
    if (shot === 'cover') {
      CS.missions.startMission(0); setPlayer(60, -30); CS.player.setView(Math.PI, 0.2);
      CS.pedestrians.people.slice(0, 3).forEach((ped, i) => ped.position.set(49 + i * 11, 0, -40 - i * 6));
      cars[0].position.set(67, 0, -45); cars[0].rotation.y = 0;
      cars[1].position.set(53, 0, -55); cars[1].rotation.y = 0;
      camera.position.set(60, 3.2, -22); camera.lookAt(60, 0, -80);
      CS.hud.banner('Find a set of wheels.', Infinity);
    }
    if (shot === 'chase') {
      const car = cars[0]; car.position.set(0, 0, 0); car.rotation.y = 0; car.userData.speed = 25; setPlayer(0, 0, car);
      CS.police.setStars(2);
      for (let i = 0; i < 2; i++) { const police = CS.vehicles.createCar('interceptor'); police.position.set(i ? 4.5 : -4.5, 0, 7 + i * 2); police.userData.speed = 18; scene.add(police); CS.police.cars().push(police); }
      camera.position.set(0, 4, -12); camera.lookAt(0, 1.2, 10);
      CS.hud.banner('Lose the cops!', Infinity);
    }
    if (shot === 'mission') {
      CS.missions.startMission(1); CS.missions.setTimer(87);
      const marker = CS.missions.markerPos();
      const cameraPoint = new THREE.Vector3(-300, 20, 295), target = new THREE.Vector3(marker.x, 0, marker.z);
      const ray = target.clone().sub(cameraPoint), playerPoint = cameraPoint.clone().addScaledVector(ray, 0.6);
      playerPoint.y = 0;
      setPlayer(playerPoint.x, playerPoint.z); CS.player.setView(Math.atan2(-(target.x - playerPoint.x), -(target.z - playerPoint.z)), 0.2);
      const side = new THREE.Vector3(-ray.z, 0, ray.x).normalize().multiplyScalar(5);
      const nearbyCar = cars[0]; nearbyCar.position.set(playerPoint.x + side.x, 0, playerPoint.z + side.z); nearbyCar.rotation.y = 0;
      camera.position.copy(cameraPoint); camera.lookAt(marker.x, 1, marker.z);
      CS.hud.banner('Drop the package at the north docks', Infinity);
    }
    if (shot === 'city') {
      const car = cars[0]; car.position.set(0, 0, 500); car.rotation.y = Math.PI; setPlayer(0, 500, car);
      camera.position.set(0, 89, 590); camera.lookAt(0, 0, 300);
      CS.hud.banner('Welcome to Costa Serena.', Infinity);
    }
  }
  CS.shots = { apply, compose, active: () => active, name: () => shot, seed: () => seed };
}());
