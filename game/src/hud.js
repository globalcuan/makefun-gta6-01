(function () {
  const CS = window.CS;
  let root, bannerNode, centerNode, flashNode, objectiveNode, timerNode, moneyNode, healthNode, starsNode;
  let bannerUntil = 0, centerUntil = 0, flashUntil = 0;
  function init() {
    root = document.getElementById('hud');
    root.innerHTML = '<div class="hud-left"><div id="hud-objective"></div><div id="hud-timer"></div></div><div class="hud-right"><div id="hud-money"></div><div id="hud-health"><i></i></div><div id="hud-stars"></div></div><div id="hud-banner"></div><div id="hud-center"></div><div id="hud-flash"></div><div id="hud-hint">E — enter car&nbsp;&nbsp; F — punch&nbsp;&nbsp; M — mute</div>';
    objectiveNode = root.querySelector('#hud-objective'); timerNode = root.querySelector('#hud-timer'); moneyNode = root.querySelector('#hud-money'); healthNode = root.querySelector('#hud-health i'); starsNode = root.querySelector('#hud-stars'); bannerNode = root.querySelector('#hud-banner'); centerNode = root.querySelector('#hud-center'); flashNode = root.querySelector('#hud-flash');
  }
  function banner(text, ms) { if (bannerNode) { bannerNode.textContent = text || ''; bannerNode.style.display = text ? 'block' : 'none'; bannerUntil = performance.now() + (ms || 2600); } }
  function showCenter(text, sub) { if (centerNode) { centerNode.innerHTML = '<strong>' + text + '</strong><small>' + (sub || '') + '</small>'; centerNode.style.display = 'flex'; centerUntil = performance.now() + 4000; } }
  function damageFlash() { if (flashNode) { flashNode.style.opacity = '1'; flashUntil = performance.now() + 220; } }
  function update() {
    if (!root) return;
    const state = CS.state || {}, health = CS.combat ? CS.combat.health : 100, stars = CS.police ? CS.police.getStars() : 0;
    moneyNode.textContent = '$' + (state.money || 0).toLocaleString('en-US'); healthNode.style.width = Math.max(0, health) + '%';
    starsNode.innerHTML = Array.from({ length: 5 }, (_, i) => '<span style="color:' + (i < stars ? '#ffd34e' : '#665a4d') + '">★</span>').join(' ');
    objectiveNode.textContent = CS.missions ? CS.missions.currentObjective() : 'Free roam';
    const hintNode = root.querySelector('#hud-hint');
    if (hintNode) hintNode.innerHTML = CS.player?.state?.inCar ? 'E — exit car&nbsp;&nbsp; Space — handbrake' : 'E — enter car&nbsp;&nbsp; F — punch&nbsp;&nbsp; M — mute';
    const remaining = CS.missions && CS.missions.timeRemaining(); timerNode.textContent = CS.shots?.mode() === 'mission' ? '1:27' : remaining == null ? '' : Math.floor(remaining / 60) + ':' + String(Math.floor(remaining % 60)).padStart(2, '0');
    const now = performance.now(); if (now > bannerUntil) { bannerNode.textContent = ''; bannerNode.style.display = 'none'; } if (now > centerUntil) centerNode.style.display = 'none'; flashNode.style.opacity = now < flashUntil ? String((flashUntil - now) / 220) : '0';
  }
  CS.hud = { init, update, banner, showCenter, damageFlash };
})();
