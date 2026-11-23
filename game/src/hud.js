// Builds the on-screen HUD for objectives, cash, wanted stars, and speed.
(function () {
  let root, bannerNode, centerNode, flashNode, objectiveNode, objectiveText = '', bannerUntil = 0, centerUntil = 0;
  function init() {
    root = document.getElementById('hud');
    root.innerHTML = '<div id="cs-objective"><span class="cs-objective-title">OBJECTIVE — <span class="cs-objective-value"></span></span><span class="cs-packages"></span></div><div id="cs-stats"><div id="cs-money"></div><div id="cs-stars"></div><div id="cs-speed" style="display:none"></div><div class="cs-health"><i id="cs-health-fill"></i></div></div><div id="cs-hint"></div><div id="cs-banner"></div><div id="cs-center"></div><div id="cs-flash"></div>';
    bannerNode = document.getElementById('cs-banner'); centerNode = document.getElementById('cs-center'); flashNode = document.getElementById('cs-flash');
    objectiveNode = document.getElementById('cs-objective');
  }
  function banner(text, ms) {
    bannerNode.textContent = text || '';
    if (!text) { bannerNode.style.display = 'none'; bannerUntil = 0; return; }
    bannerNode.style.display = 'block'; bannerUntil = ms === Infinity ? Infinity : performance.now() + (ms || 2500);
  }
  function showCenter(text, sub) { centerNode.innerHTML = '<strong>' + text + '</strong><small>' + (sub || '') + '</small>'; centerNode.style.display = 'flex'; centerUntil = Infinity; }
  function damageFlash() { flashNode.style.opacity = '1'; setTimeout(() => { flashNode.style.opacity = '0'; }, 180); }
  function update() {
    if (!root) return;
    const stars = CS.police ? CS.police.getStars() : 0;
    document.getElementById('cs-money').textContent = '$' + (CS.state.money || 0).toLocaleString('en-US');
    document.getElementById('cs-stars').innerHTML = Array.from({ length: 5 }, (_, i) => '<span class="' + (i < stars ? 'lit' : '') + '">★</span>').join('');
    document.getElementById('cs-health-fill').style.width = Math.max(0, CS.combat ? CS.combat.health : 100) + '%';
    const objective = CS.missions && CS.missions.currentObjective() || 'Free roam';
    const objectiveValue = objectiveNode && objectiveNode.querySelector('.cs-objective-value');
    if (objective !== objectiveText) { objectiveText = objective; if (objectiveValue) objectiveValue.textContent = objective; }
    const packagesNode = objectiveNode && objectiveNode.querySelector('.cs-packages');
    if (packagesNode) packagesNode.textContent = typeof CS.activities !== 'undefined' ? 'Packages: ' + CS.activities.packageCount() + '/10' : '';
    const player = CS.player.state;
    const speedNode = document.getElementById('cs-speed');
    if (player.inCar) { speedNode.textContent = Math.round(Math.abs(player.inCar.userData.speed || 0) * 3.6) + ' km/h'; speedNode.style.display = 'block'; }
    else speedNode.style.display = 'none';
    document.getElementById('cs-hint').textContent = player.inCar ? 'E — exit car · Space — handbrake' : 'E — enter car  ·  F — punch  ·  M — mute';
    if (performance.now() > bannerUntil) bannerNode.style.display = 'none';
  }
  CS.hud = { init, update, banner, showCenter, damageFlash };
}());
