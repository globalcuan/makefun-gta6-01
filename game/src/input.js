(function () {
  const keys = Object.create(null), justPressed = Object.create(null);
  let mouseX = 0, mouseY = 0;
  function keyNames(event) { return [event.code.toLowerCase(), event.key === ' ' ? ' ' : event.key.toLowerCase()]; }
  function init(canvas) {
    window.addEventListener('keydown', event => {
      for (const key of keyNames(event)) { if (!keys[key]) justPressed[key] = true; keys[key] = true; }
    });
    window.addEventListener('keyup', event => { for (const key of keyNames(event)) keys[key] = false; });
    document.addEventListener('mousemove', event => { if (document.pointerLockElement === canvas) { mouseX += event.movementX || 0; mouseY += event.movementY || 0; } });
  }
  function pressed(key) { const name = key.toLowerCase(); const value = !!justPressed[name]; justPressed[name] = false; return value; }
  function axis() {
    const x = (keys.d || keys.arrowright ? 1 : 0) - (keys.a || keys.arrowleft ? 1 : 0);
    const z = (keys.s || keys.arrowdown ? 1 : 0) - (keys.w || keys.arrowup ? 1 : 0);
    return { x, z };
  }
  function consumeMouse() { const result = { x: mouseX, y: mouseY }; mouseX = 0; mouseY = 0; return result; }
  window.CS = window.CS || {};
  window.CS.input = { init, pressed, axis, consumeMouse, keys };
})();
