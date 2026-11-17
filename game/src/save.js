(function () {
  const key = 'costa-serena-save-v1';
  function save() { try { const CS = window.CS, p = CS.player.state.position; localStorage.setItem(key, JSON.stringify({ money: CS.state.money, missionIndex: CS.missions.index(), completed: CS.missions.completed(), health: CS.combat.health, pos: { x: p.x, z: p.z }, at: Date.now() })); return true; } catch (_) { return false; } }
  function load() { try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : null; } catch (_) { return null; } }
  function clear() { try { localStorage.removeItem(key); } catch (_) {} }
  function hasSave() { return !!load(); }
  window.CS.save = { save, load, clear, hasSave };
})();
