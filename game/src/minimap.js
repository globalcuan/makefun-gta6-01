(function () {
  const CS = window.CS; let canvas, ctx;
  function init() { canvas = document.createElement('canvas'); canvas.width = canvas.height = 180; canvas.id = 'minimap-canvas'; document.getElementById('hud').appendChild(canvas); ctx = canvas.getContext('2d'); }
  function update() {
    if (!ctx) return; ctx.clearRect(0, 0, 180, 180); ctx.save(); ctx.beginPath(); ctx.arc(90, 90, 86, 0, Math.PI * 2); ctx.clip(); ctx.fillStyle = '#17252b'; ctx.fillRect(0, 0, 180, 180);
    const grid = CS.city.roadGrid, scale = 180 / 1200; ctx.strokeStyle = '#66716e'; ctx.lineWidth = 2;
    for (const x of grid.vertical) { ctx.beginPath(); ctx.moveTo(90 + x * scale, 0); ctx.lineTo(90 + x * scale, 180); ctx.stroke(); }
    for (const z of grid.horizontal) { ctx.beginPath(); ctx.moveTo(0, 90 + z * scale); ctx.lineTo(180, 90 + z * scale); ctx.stroke(); }
    const pos = CS.player.state.position; const px = 90 + pos.x * scale, py = 90 + pos.z * scale;
    for (const car of CS.traffic.cars || []) { ctx.fillStyle = '#e8c94a'; ctx.fillRect(90 + car.position.x * scale - 1, 90 + car.position.z * scale - 1, 3, 3); }
    for (const car of CS.police.cars()) { ctx.fillStyle = Math.floor(performance.now() / 250) % 2 ? '#4faaff' : '#f35b69'; ctx.fillRect(90 + car.position.x * scale - 2, 90 + car.position.z * scale - 2, 4, 4); }
    const mark = CS.missions.markerPos(); if (mark) { const pulse = 4 + Math.sin(performance.now() / 150) * 1.5; ctx.save(); ctx.translate(90 + mark.x * scale, 90 + mark.z * scale); ctx.rotate(Math.PI / 4); ctx.fillStyle = '#ff4ca8'; ctx.fillRect(-pulse / 2, -pulse / 2, pulse, pulse); ctx.restore(); }
    ctx.translate(px, py); ctx.rotate(-CS.player.state.yaw); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(5, 5); ctx.lineTo(-5, 5); ctx.closePath(); ctx.fill(); ctx.restore(); ctx.fillStyle = '#fff'; ctx.font = 'bold 12px system-ui'; ctx.fillText('N', 87, 14);
  }
  CS.minimap = { init, update };
})();
