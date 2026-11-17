(function () {
  const palette = {
    stucco: [0xc96f4a, 0xd9a05b, 0xd97b6c, 0x3f8f8a, 0xe8c98f],
    glass: 0x2e4a55, roof: 0xb45a38, asphalt: 0x3a3f44,
    dash: 0xf5d76e, ground: 0x8a7f70, sand: 0xd9b380,
    sea: 0x1f7a8c, sky: 0xe8956b
  };
  window.CS = window.CS || {};
  CS.config = {
    city: { size: 1200, roadSpacing: 120, block: 90 }, palette,
    player: { walk: 6, run: 11 }, car: { accel: 22, topSpeed: 42, steer: 1.9 },
    camera: { distance: 7, minPitch: -0.1, maxPitch: 0.9 },
    lighting: { hemisphere: 0.75, sun: 0xffb36b, sunIntensity: 0.95, ambient: 0.15 },
    fog: { start: 800, end: 1800 }
  };
  CS.rng = function (seed) {
    let value = seed >>> 0;
    return function () {
      value += 0x6D2B79F5;
      let t = value;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  CS.random = Math.random;
}());
