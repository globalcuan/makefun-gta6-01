(function () {
  let canvas, ctx;
  function init() { canvas = document.createElement('canvas'); canvas.width = 180; canvas.height = 180; canvas.id = 'cs-minimap'; document.body.appendChild(canvas); ctx = canvas.getContext('2d'); }
  function update() {
    if (!ctx) return; ctx.clearRect(0, 0, 180, 180); ctx.save(); ctx.beginPath(); ctx.arc(90, 90, 88, 0, Math.PI * 2); ctx.clip(); ctx.fillStyle = '#17232a'; ctx.fillRect(0, 0, 180, 180);
    const p = CS.player.state.position, scale = 180 / 1200, px = 90, py = 90; ctx.translate(px - p.x * scale, py - p.z * scale);
    ctx.strokeStyle = '#69747a'; ctx.lineWidth = 2;
    CS.city.roadGrid.forEach(road => { ctx.beginPath(); if (road.vertical) { ctx.moveTo(road.x * scale, -100); ctx.lineTo(road.x * scale, 1300 * scale); } else { ctx.moveTo(-700 * scale, road.z * scale); ctx.lineTo(700 * scale, road.z * scale); } ctx.stroke(); });
    CS.traffic.cars.forEach(car => dot(car.position, '#e9c948', scale)); CS.police.cars().forEach(car => dot(car.position, '#49a6ff', scale));
    const marker = CS.missions.markerPos(); if (marker) { ctx.fillStyle = '#ff42d2'; ctx.save(); ctx.translate(marker.x * scale, marker.z * scale); ctx.rotate(Math.PI / 4); ctx.fillRect(-4, -4, 8, 8); ctx.restore(); }
    if (typeof CS.activities !== 'undefined') {
      CS.activities.packagePositions().forEach(pos => dot(pos, '#ffd34d', scale));
      const race = CS.activities.raceState(); if (race.active && race.position) dot(race.position, '#32e5ff', scale);
    }
    ctx.restore(); ctx.save(); ctx.translate(90, 90); ctx.rotate(-CS.player.state.yaw); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(-5, 5); ctx.lineTo(5, 5); ctx.fill(); ctx.restore();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 12px system-ui'; ctx.fillText('N', 86, 15);
  }
  function dot(pos, color, scale) { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(pos.x * scale, pos.z * scale, 2.5, 0, Math.PI * 2); ctx.fill(); }
  CS.minimap = { init, update };
}());
