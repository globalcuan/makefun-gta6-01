(function () {
  let context = null, master = null, engineOsc, engineGain, sirenOsc, sirenGain, ambientGain, muted = false, sirenTimer = 0;
  function init() {
    if (context) { context.resume(); return; }
    try {
      context = new (window.AudioContext || window.webkitAudioContext)(); master = context.createGain(); master.gain.value = muted ? 0 : 0.22; master.connect(context.destination);
      engineOsc = context.createOscillator(); engineOsc.type = 'sawtooth'; const filter = context.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 350; engineGain = context.createGain(); engineGain.gain.value = 0; engineOsc.connect(filter).connect(engineGain).connect(master); engineOsc.start();
      sirenOsc = context.createOscillator(); sirenOsc.type = 'square'; sirenGain = context.createGain(); sirenGain.gain.value = 0; sirenOsc.connect(sirenGain).connect(master); sirenOsc.start();
      ambientGain = context.createGain(); ambientGain.gain.value = 0.018; ambientGain.connect(master);
      [110, 164.81].forEach((hz, i) => { const osc = context.createOscillator(); osc.type = 'sine'; osc.frequency.value = hz; osc.detune.value = i ? 7 : -6; osc.connect(ambientGain); osc.start(); });
    } catch (_) { context = null; }
  }
  function tone(freq, duration, type, endFreq) {
    if (!context) return;
    const osc = context.createOscillator(), gain = context.createGain(); osc.type = type || 'sine'; osc.frequency.setValueAtTime(freq, context.currentTime);
    if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, context.currentTime + duration);
    gain.gain.setValueAtTime(0.18, context.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration); osc.connect(gain).connect(master); osc.start(); osc.stop(context.currentTime + duration);
  }
  function engine(speed) { if (context && engineOsc) { engineOsc.frequency.setTargetAtTime(60 + Math.max(0, Math.min(1, speed)) * 120, context.currentTime, 0.12); engineGain.gain.setTargetAtTime(speed > 0 ? 0.08 : 0, context.currentTime, 0.15); } }
  function siren(on) { if (context && sirenGain) sirenGain.gain.setTargetAtTime(on ? 0.08 : 0, context.currentTime, 0.08); }
  function pickup() { tone(880, 0.22, 'sine', 1320); }
  function sting() { [523, 659, 784, 1046].forEach((hz, i) => setTimeout(() => tone(hz, 0.38, 'triangle'), i * 130)); }
  function punch() { if (!context) return; tone(90, 0.18, 'sine', 48); const size = Math.floor(context.sampleRate * 0.12), buffer = context.createBuffer(1, size, context.sampleRate), data = buffer.getChannelData(0); for (let i = 0; i < size; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / size); const source = context.createBufferSource(), gain = context.createGain(); source.buffer = buffer; gain.gain.value = 0.16; source.connect(gain).connect(master); source.start(); }
  function ambient() { if (context && context.state === 'suspended') context.resume(); }
  function toggleMute() { muted = !muted; if (context) master.gain.setTargetAtTime(muted ? 0 : 0.22, context.currentTime, 0.05); return muted; }
  window.addEventListener('pointerdown', init, { once: true });
  window.addEventListener('keydown', init, { once: true });
  CS.audio = { init, engine, siren, pickup, sting, punch, ambient, toggleMute };
}());
