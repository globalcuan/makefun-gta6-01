(function () {
  let active = false, seed = 7, shot = '';
  function apply() {
    const params = new URLSearchParams(location.search); shot = params.get('shot') || ''; seed = Number(params.get('seed')) || 7; active = !!shot; CS.shots = { apply, compose, active: () => active, name: () => shot, seed: () => seed };
    if (active) { CS.random = CS.rng(seed); CS.state.shot = shot; }
  }
  function compose(scene, camera) {
    const player = CS.player.state, cars = CS.vehicles.cars, traffic = CS.traffic.cars, people = CS.pedestrians.people;
    const setPlayer = (x, z, car) => { player.position.set(x, 0, z); CS.player.setPose(x, z, car || null); };
    const placeCar = (car, x, z, yaw) => { car.position.set(x, 0, z); car.rotation.y = yaw || 0; };
    const putTraffic = (placements) => placements.forEach(([index, x, z, yaw]) => { if (traffic[index]) placeCar(traffic[index], x, z, yaw); });
    const putPeople = (placements) => placements.forEach(([index, x, z, yaw]) => { if (people[index]) { people[index].position.set(x, 0, z); people[index].rotation.y = yaw || 0; } });
    const policeCar = (x, z, yaw) => {
      const car = CS.vehicles.createCar('interceptor', 0xeee9dc); placeCar(car, x, z, yaw);
      car.userData.speed = 18; car.userData.police = true; scene.add(car); CS.police.cars().push(car); return car;
    };
    if (shot === 'cover') {
      CS.missions.startMission(0); CS.police.setStars(3);
      const car = cars[0]; placeCar(car, 0, 455, -Math.PI / 2); car.userData.speed = 22; setPlayer(0, 455, car);
      // The boulevard runs east-west; a slight diagonal view keeps the sea and city edge in frame.
      policeCar(-9, 455, -Math.PI / 2); policeCar(-18, 450, -Math.PI / 2); policeCar(-27, 460, -Math.PI / 2);
      putTraffic([[0, 12, 455, Math.PI / 2], [1, 22, 455, Math.PI / 2], [2, 31, 455, Math.PI / 2]]);
      putPeople([[0, -7, 482, 1.1], [1, 4, 484, -.7], [2, 16, 481, 2.1], [3, 27, 485, -1.8], [4, -19, 480, .2], [5, 37, 482, 2.8], [6, -31, 484, -1]]);
      camera.position.set(-16, 3.3, 438); camera.lookAt(7, 1.2, 488);
      CS.hud.banner('Find a set of wheels — the Serena story begins.', Infinity);
    }
    if (shot === 'chase') {
      CS.missions.startMission(2);
      const car = cars[0]; placeCar(car, 180, -180, -Math.PI / 4); car.userData.speed = 25; car.userData.steer = .6; setPlayer(180, -180, car);
      CS.police.setStars(3); policeCar(186, -194, 0); policeCar(206, -180, -Math.PI / 2);
      policeCar(196, -164, .6); policeCar(210, -168, -.5);
      putTraffic([[0, 180, -132, Math.PI], [1, 132, -180, Math.PI / 2], [2, 228, -180, -Math.PI / 2]]);
      putPeople([[0, 191, -166, .7], [1, 169, -194, 2.5], [2, 192, -195, -1], [3, 168, -165, 1.5]]);
      camera.position.set(172, 4, -208); camera.lookAt(180, 1, -180);
      CS.hud.banner('Lose the cops!', Infinity);
    }
    if (shot === 'mission') {
      CS.missions.startMission(1); CS.missions.setTimer(87);
      const marker = CS.missions.markerPos(), px = marker.x, pz = marker.z - 8;
      setPlayer(px, pz); CS.player.setView(-Math.PI / 2, .15);
      const car = cars[0]; placeCar(car, px + 3, pz, Math.PI / 2);
      putTraffic([[0, marker.x, marker.z, Math.PI / 2], [1, marker.x - 25, marker.z, -Math.PI / 2]]);
      putPeople([[0, px - 12, pz - 2, 1], [1, px + 12, pz - 2, 2], [2, marker.x + 12, marker.z + 5, -1]]);
      // Framing: player, parked car, objective ring, beacon and label all in frame.
      camera.position.set(px, 2.5, pz - 7);
      camera.lookAt(marker.x, 1.5, marker.z);
      CS.hud.banner('Drop the package at the north docks', Infinity);
    }
    if (shot === 'city') {
      const car = cars[0]; placeCar(car, 0, 455, -Math.PI / 2); setPlayer(0, 455, car);
      putTraffic([[0, 18, 455, Math.PI / 2], [1, -27, 455, -Math.PI / 2], [2, 34, 455, Math.PI / 2], [3, 0, 360, 0], [4, 120, 365, Math.PI], [5, -75, 455, Math.PI / 2], [6, 75, 455, -Math.PI / 2], [7, -35, 360, 0], [8, 155, 365, Math.PI]]);
      putPeople([[0, -12, 480, 1], [1, 6, 483, 2], [2, 24, 479, -.5], [3, 36, 484, 2.5], [4, -34, 482, 0], [5, 50, 481, 1.4], [6, -48, 478, .8], [7, 68, 484, 2.2], [8, 42, 468, -1], [9, -25, 468, 1.7]]);
      camera.position.set(18, 44, 518); camera.lookAt(0, 0, 414);
      CS.hud.banner('Welcome to Costa Serena.', Infinity);
    }
  }
  CS.shots = { apply, compose, active: () => active, name: () => shot, seed: () => seed };
}());
