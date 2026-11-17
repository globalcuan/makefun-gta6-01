(function () {
  const CS = window.CS; let mode = null, seed = 7;
  function apply() {
    const query = new URLSearchParams(location.search); mode = query.get('shot'); seed = Number(query.get('seed')) || 7; if (!mode) return;
    const rng = CS.rng(seed); CS.shotRng = rng;
    if (mode === 'cover') {
      CS.player.state.position.set(0, 0, 60); CS.player.state.inCar = null; CS.player.state.yaw = 0; CS.player.state.pitch = -.05; CS.shotFreeze = true;
      const car = CS.traffic.cars[0]; if (car) { car.position.set(-5, 0, 42); car.rotation.y = 0; }
      const person = CS.pedestrians.people[0]; if (person) person.position.set(10, 0, 54);
    }
    if (mode === 'chase') {
      const car = CS.vehicles.cars[0]; CS.player.state.inCar = car; car.position.set(0, 0, 40); CS.player.state.position.copy(car.position); car.userData.speed = 25; car.rotation.y = 0;
      CS.police.setWanted(3); const officers = CS.police.cars();
      officers[0]?.position.set(-8, 0, 28); officers[1]?.position.set(0, 0, -10);
      CS.player.state.yaw = 0; CS.player.state.pitch = .05;
    }
    if (mode === 'mission') {
      CS.missions.startMission(1); const marker = CS.missions.markerPos();
      const car = CS.vehicles.cars[0]; if (car) { car.position.set(marker.x - 5, 0, marker.z + 10); car.rotation.y = 0; }
      CS.player.state.position.set(marker.x, 0, marker.z + 8); CS.player.state.inCar = null; CS.player.state.yaw = 0; CS.player.state.pitch = .15;
      setTimeout(() => CS.hud.banner('Drop the package at the north docks', 2147483647), 2100);
    }
    if (mode === 'city') { const car = CS.vehicles.cars[0]; car.position.set(0, 0, 420); CS.player.state.inCar = car; CS.player.state.position.copy(car.position); CS.city.shotCamera = true; }
    const bannerText = { cover: 'Find a set of wheels.', chase: 'Lose the cops!', city: 'Welcome to Costa Serena.' }[mode];
    if (bannerText) CS.hud.banner(bannerText, 2147483647);
    CS.player.syncVisual();
  }
  CS.shots = { apply, mode: () => mode, seed: () => seed };
})();
