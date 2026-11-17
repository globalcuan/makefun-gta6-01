(function () {
  const keys = Object.create(null), held = Object.create(null);
  let mouseX = 0, mouseY = 0;
  function name(event) { return event.code.toLowerCase(); }
  function init(canvas) {
    window.addEventListener('keydown', function (event) {
      const key = name(event);
      if (!held[key]) keys[key] = true;
      held[key] = true;
      if (event.key === ' ') { if (!held.space) keys.space = true; held.space = true; }
      if (event.key === 'Shift') { if (!held.shift) keys.shift = true; held.shift = true; }
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'space'].includes(key)) event.preventDefault();
    });
    window.addEventListener('keyup', function (event) {
      held[name(event)] = false;
      if (event.key === ' ') held.space = false;
      if (event.key === 'Shift') held.shift = false;
    });
    window.addEventListener('blur', function () { Object.keys(held).forEach(k => held[k] = false); });
    document.addEventListener('mousemove', function (event) {
      if (document.pointerLockElement === canvas) { mouseX += event.movementX || 0; mouseY += event.movementY || 0; }
    });
  }
  function pressed(key) { const value = !!keys[key.toLowerCase()]; keys[key.toLowerCase()] = false; return value; }
  function down(...names) { return names.some(k => held[k]); }
  function isDown(key) { return !!held[key.toLowerCase()]; }
  function axis() {
    return { x: (down('keyd', 'arrowright') ? 1 : 0) - (down('keya', 'arrowleft') ? 1 : 0),
      z: (down('keys', 'arrowdown') ? 1 : 0) - (down('keyw', 'arrowup') ? 1 : 0) };
  }
  CS.input = { init, pressed, isDown, axis, consumeMouse: function () { const result = { x: mouseX, y: mouseY }; mouseX = mouseY = 0; return result; } };
}());
