(function () {
  const CS = window.CS; let health = 100, lastDamage = -Infinity, hitCooldown = 0;
  function damage(amount) { health = Math.max(0, health - amount); lastDamage = performance.now() / 1000; if (CS.hud) CS.hud.damageFlash(); if (health <= 0 && CS.police) CS.police.wasted(); }
  function heal(amount) { health = Math.min(100, health + amount); }
  function punch() {
    const player = CS.player.state.position, people = CS.pedestrians.people || []; let target = null, best = 2.5;
    for (const ped of people) { const d = ped.position.distanceTo(player); if (d < best) { target = ped; best = d; } }
    if (!target) return false;
    const dx = target.position.x - player.x, dz = target.position.z - player.z, len = Math.hypot(dx, dz) || 1;
    target.position.x += dx / len * 3; target.position.z += dz / len * 3; target.userData.stunned = 1.2; target.userData.heading = Math.atan2(dx, dz); target.userData.flee = 1;
    if (CS.police) CS.police.addHeat(1); if (CS.audio) CS.audio.punch(); return true;
  }
  function update(dt) {
    if (performance.now() / 1000 - lastDamage > 5) heal(2 * dt);
    if (hitCooldown > 0) hitCooldown -= dt;
    if (hitCooldown <= 0 && !CS.player.state.inCar) for (const car of CS.police.cars()) if (car.position.distanceTo(CS.player.state.position) < 3 && Math.abs(car.userData.speed) > 8) { damage(Math.abs(car.userData.speed)); hitCooldown = 1; break; }
  }
  Object.defineProperty(CS, 'combat', { value: { damage, heal, punch, update, get health() { return health; }, set health(v) { health = Math.max(0, Math.min(100, v)); } }, configurable: true });
})();
