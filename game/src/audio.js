(function () {
  let ctx = null, master = null, engineOsc, engineGain, sirenOsc, sirenGain, ambientNodes = [], muted = false;
  function init() {
    if (ctx) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)(); master = ctx.createGain(); master.gain.value = .22; master.connect(ctx.destination);
      engineOsc = ctx.createOscillator(); engineOsc.type = 'sawtooth'; const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 420; engineGain = ctx.createGain(); engineGain.gain.value = 0; engineOsc.connect(filter); filter.connect(engineGain); engineGain.connect(master); engineOsc.start();
      sirenOsc = ctx.createOscillator(); sirenGain = ctx.createGain(); sirenGain.gain.value = 0; sirenOsc.connect(sirenGain); sirenGain.connect(master); sirenOsc.start();
      for (const f of [110, 165]) { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = f; o.detune.value = f === 110 ? -4 : 4; g.gain.value = .012; o.connect(g); g.connect(master); o.start(); ambientNodes.push(o, g); }
      const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = .08; lg.gain.value = .006; lfo.connect(lg); lg.connect(ambientNodes[1].gain); lfo.start(); ambientNodes.push(lfo, lg);
    } catch (_) { ctx = null; }
  }
  function tone(freq, duration, type, endFreq, gain) { if (!ctx) return; const o = ctx.createOscillator(), g = ctx.createGain(), now = ctx.currentTime; o.type = type || 'sine'; o.frequency.setValueAtTime(freq, now); if (endFreq) o.frequency.exponentialRampToValueAtTime(endFreq, now + duration); g.gain.setValueAtTime(gain || .16, now); g.gain.exponentialRampToValueAtTime(.001, now + duration); o.connect(g); g.connect(master); o.start(now); o.stop(now + duration); }
  function engine(speed01) { if (ctx && engineOsc) { engineOsc.frequency.setTargetAtTime(60 + Math.max(0, Math.min(1, speed01)) * 120, ctx.currentTime, .08); engineGain.gain.setTargetAtTime(speed01 ? .025 : 0, ctx.currentTime, .12); } }
  function siren(on) { if (ctx && sirenOsc) { sirenGain.gain.setTargetAtTime(on ? .045 : 0, ctx.currentTime, .08); if (on) sirenOsc.frequency.setValueAtTime(Math.floor(ctx.currentTime * 2.5) % 2 ? 660 : 880, ctx.currentTime); } }
  function pickup() { tone(880, .12, 'sine', 1320, .16); }
  function sting() { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, .22, 'sine', null, .13), i * 100)); }
  function punch() { if (!ctx) return; const buffer = ctx.createBuffer(1, ctx.sampleRate * .12, ctx.sampleRate), data = buffer.getChannelData(0); for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length); const src = ctx.createBufferSource(), g = ctx.createGain(); src.buffer = buffer; g.gain.value = .2; src.connect(g); g.connect(master); src.start(); tone(90, .12, 'sine', 45, .18); }
  function ambient() { if (!ctx) window.addEventListener('pointerdown', init, { once: true }); }
  function toggleMute() { muted = !muted; if (ctx) master.gain.setTargetAtTime(muted ? 0 : .22, ctx.currentTime, .05); return muted; }
  window.CS.audio = { init, engine, siren, pickup, sting, punch, ambient, toggleMute };
})();
