// All sounds are generated with the Web Audio API — no audio assets, no requests.

let ctx: AudioContext | null = null;

// Must be called from a user gesture (autoplay policy); safe to call repeatedly.
export function unlockAudio(): void {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
  } catch {
    ctx = null;
  }
}

function tone(frequency: number, durationMs: number, peak = 0.05): void {
  if (!ctx || ctx.state !== 'running') return;
  try {
    const t0 = ctx.currentTime;
    const seconds = durationMs / 1000;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(peak, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + seconds);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + seconds + 0.05);
  } catch {
    // Audio must never break the timer.
  }
}

export const sounds = {
  countdownTick: () => tone(660, 90, 0.025),
  start: () => tone(880, 200),
  milestone: () => tone(740, 160, 0.04),
  stop: () => tone(523.25, 280),
};
