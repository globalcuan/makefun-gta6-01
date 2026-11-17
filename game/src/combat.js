(function () {
  let health = 100, lastDamage = -Infinity, hitCooldown = 0;
  function damage(amount) { health = Math.max(0, health - amount); lastDamage = performance.now() / 1000; CS.hud.damageFlash(); if (health <= 0 && CS.police) CS.police.wasted(); }
  function heal(amount) { health = Math.min(100, health + amount); }
  function punch() {
    const p = CS.player.state.position; let target = null, distance = 2.5;
    CS.pedestrians.people.forEach(ped => { const d = ped.position.distanceTo(p); if (d < distance) { target = ped; distance = d; } });
    if (!target) return false;
    const away = target.position.clone().sub(p).setY(0).normalize(); target.position.addScaledVector(away, 3); target.userData.stun = 0.7; target.userData.flee = 4; target.userData.heading = Math.atan2(away.x, away.z); CS.police.addHeat(1); CS.audio.punch(); return true;
  }
  function update(dt) {
    const now = performance.now() / 1000; hitCooldown = Math.max(0, hitCooldown - dt);
    if (now - lastDamage > 5) heal(2 * dt);
    if (CS.input.pressed('keyf')) punch();
    const player = CS.player.state;
    if (!player.inCar && hitCooldown <= 0) CS.police.cars().forEach(car => { if (car.position.distanceTo(player.position) < 2.3 && Math.abs(car.userData.speed) > 8) { damage(Math.abs(car.userData.speed)); hitCooldown = 1; } });
  }
  CS.combat = { get health() { return health; }, set health(value) { health = Math.max(0, Math.min(100, value)); }, damage, heal, punch, update };
}());
