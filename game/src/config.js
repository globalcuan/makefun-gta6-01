(function () {
  const config = {
    city: { size: 1200, roadSpacing: 120, blockSize: 90 },
    colors: { stucco: [0xc96f4a, 0xd9a05b, 0xd97b6c, 0x3f8f8a, 0xe8c98f], glass: 0x2e4a55, roof: 0xb45a38, asphalt: 0x3a3f44, dash: 0xf5d76e, ground: 0x8a7f70, sand: 0xd9b380, sea: 0x1f7a8c, sky: 0xe8956b },
    player: { walk: 6, run: 11 }, car: { accel: 22, topSpeed: 42, steer: 1.9 }, camera: { distance: 7, minPitch: -0.1, maxPitch: 0.9 },
    lighting: { hemisphere: 0.75, sun: 0xffb36b, sunIntensity: 0.95, ambient: 0.15 }, fog: { start: 800, end: 1800 }
  };
  function mulberry32(seed) {
    return function () {
      let value = seed += 0x6D2B79F5;
      value = Math.imul(value ^ value >>> 15, value | 1);
      value ^= value + Math.imul(value ^ value >>> 7, value | 61);
      return ((value ^ value >>> 14) >>> 0) / 4294967296;
    };
  }
  window.CS = window.CS || {};
  window.CS.config = config;
  window.CS.rng = mulberry32;
  window.CS.random = Math.random;
})();
